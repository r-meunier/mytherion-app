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
    private val jwtService: JwtService
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
            passwordEncoder.encode(req.password) ?: throw IllegalArgumentException("Password must not be null")

        val user = User(
            email = req.email.lowercase(),
            username = req.username,
            passwordHash = encodedPassword,
            role = UserRole.USER
        )

        val saved = userRepository.save(user)

        val token = jwtService.generateAccessToken(
            userId = saved.id!!,
            email = saved.email,
            role = saved.role.name
        )
        return AuthDTO.AuthResponse(accessToken = token)
    }

    @Transactional(readOnly = true)
    fun login(req: AuthDTO.LoginRequest): AuthDTO.AuthResponse {
        val user = userRepository.findByEmail(req.email.lowercase())
            ?: throw IllegalArgumentException("Invalid credentials")

        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
            throw IllegalArgumentException("Invalid credentials")
        }

        val token = jwtService.generateAccessToken(
            userId = user.id!!,
            email = user.email,
            role = user.role.name
        )
        return AuthDTO.AuthResponse(accessToken = token)
    }
}
