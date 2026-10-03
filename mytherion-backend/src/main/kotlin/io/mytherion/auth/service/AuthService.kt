package io.mytherion.auth.service

import io.mytherion.auth.dto.AuthDTO
import io.mytherion.auth.exception.EmailAlreadyInUseException
import io.mytherion.auth.exception.EmailAlreadyVerifiedException
import io.mytherion.auth.exception.EmailNotVerifiedException
import io.mytherion.auth.exception.InvalidCredentialsException
import io.mytherion.auth.exception.InvalidVerificationTokenException
import io.mytherion.auth.exception.VerificationTokenExpiredException
import io.mytherion.auth.jwt.JwtService
import io.mytherion.platform.monitoring.MetricsService
import io.mytherion.user.exception.UserNotFoundException
import io.mytherion.user.exception.UsernameAlreadyInUseException
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val verificationTokenRepository:
    io.mytherion.auth.repository.EmailVerificationTokenRepository,
    private val emailService: io.mytherion.platform.email.EmailService,
    private val metricsService: MetricsService
) {

    @Transactional
    fun register(req: AuthDTO.RegisterRequest): AuthDTO.AuthResponse {
        val startTime = System.currentTimeMillis()
        var success = false

        if (userRepository.existsByEmail(req.email)) {
            metricsService.recordRegistration(
                durationMs = System.currentTimeMillis() - startTime,
                success = false
            )
            throw EmailAlreadyInUseException()
        }
        if (userRepository.existsByUsername(req.username)) {
            metricsService.recordRegistration(
                durationMs = System.currentTimeMillis() - startTime,
                success = false
            )
            throw UsernameAlreadyInUseException()
        }

        val encodedPassword =
            passwordEncoder.encode(req.password)
                ?: error("PasswordEncoder returned null")

        val user =
            User(
                email = req.email.lowercase(),
                username = req.username,
                passwordHash = encodedPassword,
                role = UserRole.USER
            )

        val saved = userRepository.save(user)

        // Send verification email
        sendVerificationEmail(saved)

        val token =
            jwtService.generateAccessToken(
                userId = requireNotNull(saved.id) { "User ID is missing" },
                email = saved.email,
                role = saved.role.name
            )

        val userResponse =
            AuthDTO.UserResponse(
                id = requireNotNull(saved.id) { "User ID is missing" },
                email = saved.email,
                username = saved.username,
                role = saved.role.name,
                emailVerified = saved.emailVerified
            )

        success = true

        val duration = System.currentTimeMillis() - startTime
        metricsService.recordRegistration(durationMs = duration, success = success)

        return AuthDTO.AuthResponse(accessToken = token, user = userResponse)
    }

    @Transactional(readOnly = true)
    fun login(req: AuthDTO.LoginRequest): AuthDTO.AuthResponse {
        val startTime = System.currentTimeMillis()
        var success = false
        var reason = "ok"

        val user =
            userRepository.findByEmailAndDeletedAtIsNull(req.email.lowercase())
                ?: run {
                    reason = "invalid_credentials"
                    metricsService.recordLogin(
                        durationMs = System.currentTimeMillis() - startTime,
                        success = false,
                        reason = reason
                    )
                    throw InvalidCredentialsException()
                }

        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
            reason = "invalid_credentials"
            metricsService.recordLogin(
                durationMs = System.currentTimeMillis() - startTime,
                success = false,
                reason = reason
            )
            throw InvalidCredentialsException()
        }

        // Hard enforcement: Require email verification to login
        if (!user.emailVerified) {
            reason = "email_not_verified"
            metricsService.recordLogin(
                durationMs = System.currentTimeMillis() - startTime,
                success = false,
                reason = reason
            )
            throw EmailNotVerifiedException()
        }

        val token =
            jwtService.generateAccessToken(
                userId = requireNotNull(user.id) { "User ID is missing" },
                email = user.email,
                role = user.role.name
            )

        val userResponse =
            AuthDTO.UserResponse(
                id = requireNotNull(user.id) { "User ID is missing" },
                email = user.email,
                username = user.username,
                role = user.role.name,
                emailVerified = user.emailVerified
            )

        success = true
        val duration = System.currentTimeMillis() - startTime
        metricsService.recordLogin(durationMs = duration, success = success, reason = reason)

        return AuthDTO.AuthResponse(accessToken = token, user = userResponse)
    }

    @Transactional(readOnly = true)
    fun getUserById(userId: UUID): AuthDTO.UserResponse {
        val user =
            userRepository.findById(userId).orElseThrow {
                UserNotFoundException(userId)
            }

        if (user.isDeleted()) {
            throw UserNotFoundException(userId)
        }

        return AuthDTO.UserResponse(
            id = requireNotNull(user.id) { "User ID is missing" },
            email = user.email,
            username = user.username,
            role = user.role.name,
            emailVerified = user.emailVerified
        )
    }

    @Transactional
    fun sendVerificationEmail(user: User) {
        // Delete any existing unverified tokens for this user
        verificationTokenRepository.deleteByUser(user)

        // Generate new verification token
        val token = java.util.UUID.randomUUID().toString()
        val expiresAt =
            java.time.Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS)

        val verificationToken =
            io.mytherion.auth.model.EmailVerificationToken(
                token = token,
                user = user,
                expiresAt = expiresAt
            )

        verificationTokenRepository.save(verificationToken)

        // Send verification email
        emailService.sendVerificationEmail(user.email, user.username, token)
    }

    @Transactional
    fun verifyEmail(token: String): AuthDTO.UserResponse {
        val verificationToken =
            verificationTokenRepository.findByToken(token)
                ?: throw InvalidVerificationTokenException()

        if (verificationToken.isVerified()) {
            throw EmailAlreadyVerifiedException()
        }

        if (verificationToken.isExpired()) {
            throw VerificationTokenExpiredException()
        }

        // Mark token as verified
        verificationToken.verifiedAt = java.time.Instant.now()

        // Mark user email as verified
        verificationToken.user.emailVerified = true

        userRepository.save(verificationToken.user)
        verificationTokenRepository.save(verificationToken)

        return AuthDTO.UserResponse(
            id = requireNotNull(verificationToken.user.id) { "User ID is missing" },
            email = verificationToken.user.email,
            username = verificationToken.user.username,
            role = verificationToken.user.role.name,
            emailVerified = verificationToken.user.emailVerified
        )
    }

    @Transactional
    fun resendVerificationEmail(userId: UUID) {
        val user =
            userRepository.findById(userId).orElseThrow {
                UserNotFoundException(userId)
            }

        if (user.emailVerified) {
            throw EmailAlreadyVerifiedException()
        }

        sendVerificationEmail(user)
    }

    @Transactional
    fun resendVerificationEmailByEmail(email: String) {
        val user =
            userRepository.findByEmailAndDeletedAtIsNull(email.lowercase())
                ?: throw UserNotFoundException()

        if (user.emailVerified) {
            throw EmailAlreadyVerifiedException()
        }

        sendVerificationEmail(user)
    }
}
