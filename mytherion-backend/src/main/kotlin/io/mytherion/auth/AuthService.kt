package io.mytherion.auth

import io.mytherion.auth.dto.AuthDTO
import io.mytherion.auth.jwt.JwtService
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
        private val userRepository: UserRepository,
        private val passwordEncoder: PasswordEncoder,
        private val jwtService: JwtService,
        private val verificationTokenRepository:
                io.mytherion.auth.repository.EmailVerificationTokenRepository,
        private val emailService: io.mytherion.email.EmailService
) {

        @Transactional
        fun register(req: AuthDTO.RegisterRequest): AuthDTO.AuthResponse {
                if (userRepository.existsByEmail(req.email)) {
                        throw IllegalArgumentException("Email already in use")
                }
                if (userRepository.existsByUsername(req.username)) {
                        throw IllegalArgumentException("Username already in use")
                }

                val encodedPassword =
                        passwordEncoder.encode(req.password)
                                ?: throw IllegalArgumentException("Password must not be null")

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
                                userId = saved.id!!,
                                email = saved.email,
                                role = saved.role.name
                        )

                val userResponse =
                        AuthDTO.UserResponse(
                                id = saved.id!!,
                                email = saved.email,
                                username = saved.username,
                                role = saved.role.name,
                                emailVerified = saved.emailVerified
                        )

                return AuthDTO.AuthResponse(accessToken = token, user = userResponse)
        }

        @Transactional(readOnly = true)
        fun login(req: AuthDTO.LoginRequest): AuthDTO.AuthResponse {
                val user =
                        userRepository.findByEmailAndDeletedAtIsNull(req.email.lowercase())
                                ?: throw IllegalArgumentException("Invalid credentials")

                if (!passwordEncoder.matches(req.password, user.passwordHash)) {
                        throw IllegalArgumentException("Invalid credentials")
                }

                // Hard enforcement: Require email verification to login
                if (!user.emailVerified) {
                        throw IllegalArgumentException("Please verify your email before logging in")
                }

                val token =
                        jwtService.generateAccessToken(
                                userId = user.id!!,
                                email = user.email,
                                role = user.role.name
                        )

                val userResponse =
                        AuthDTO.UserResponse(
                                id = user.id!!,
                                email = user.email,
                                username = user.username,
                                role = user.role.name,
                                emailVerified = user.emailVerified
                        )

                return AuthDTO.AuthResponse(accessToken = token, user = userResponse)
        }

        @Transactional(readOnly = true)
        fun getUserById(userId: Long): AuthDTO.UserResponse {
                val user =
                        userRepository.findById(userId).orElseThrow {
                                IllegalArgumentException("User not found")
                        }

                if (user.isDeleted()) {
                        throw IllegalArgumentException("User not found")
                }

                return AuthDTO.UserResponse(
                        id = user.id!!,
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
                                ?: throw IllegalArgumentException("Invalid verification token")

                if (verificationToken.isVerified()) {
                        throw IllegalArgumentException("Email already verified")
                }

                if (verificationToken.isExpired()) {
                        throw IllegalArgumentException("Verification token expired")
                }

                // Mark token as verified
                verificationToken.verifiedAt = java.time.Instant.now()

                // Mark user email as verified
                verificationToken.user.emailVerified = true

                userRepository.save(verificationToken.user)
                verificationTokenRepository.save(verificationToken)

                return AuthDTO.UserResponse(
                        id = verificationToken.user.id!!,
                        email = verificationToken.user.email,
                        username = verificationToken.user.username,
                        role = verificationToken.user.role.name,
                        emailVerified = verificationToken.user.emailVerified
                )
        }

        @Transactional
        fun resendVerificationEmail(userId: Long) {
                val user =
                        userRepository.findById(userId).orElseThrow {
                                IllegalArgumentException("User not found")
                        }

                if (user.emailVerified) {
                        throw IllegalArgumentException("Email already verified")
                }

                sendVerificationEmail(user)
        }

        @Transactional
        fun resendVerificationEmailByEmail(email: String) {
                val user =
                        userRepository.findByEmailAndDeletedAtIsNull(email.lowercase())
                                ?: throw IllegalArgumentException("User not found")

                if (user.emailVerified) {
                        throw IllegalArgumentException("Email already verified")
                }

                sendVerificationEmail(user)
        }
}
