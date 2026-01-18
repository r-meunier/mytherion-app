package io.mytherion.auth

import com.fasterxml.jackson.databind.ObjectMapper
import io.mytherion.auth.dto.AuthDTO
import io.mytherion.auth.model.EmailVerificationToken
import io.mytherion.auth.repository.EmailVerificationTokenRepository
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import java.time.Instant
import java.time.temporal.ChronoUnit
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(ObjectMapper::class)
class EmailVerificationIntegrationTest {

    @Autowired private lateinit var mockMvc: MockMvc

    @Autowired private lateinit var objectMapper: ObjectMapper

    @Autowired private lateinit var userRepository: UserRepository

    @Autowired private lateinit var tokenRepository: EmailVerificationTokenRepository

    @Autowired private lateinit var passwordEncoder: PasswordEncoder

    @MockBean private lateinit var emailService: io.mytherion.email.EmailService

    @AfterEach
    fun cleanup() {
        tokenRepository.deleteAll()
        userRepository.deleteAll()
    }

    // ==================== Registration Tests ====================

    @Test
    fun `POST register should NOT set auth cookie with hard enforcement`() {
        // Given
        val request =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )

        // When & Then
        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(false))
                .andExpect(cookie().doesNotExist("mytherion_token"))
    }

    @Test
    fun `POST register should create unverified user`() {
        // Given
        val request =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )

        // When
        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated)

        // Then
        val user = userRepository.findByEmailAndDeletedAtIsNull("test@example.com")
        assertNotNull(user)
        assertFalse(user!!.emailVerified, "User should not be verified after registration")
    }

    // ==================== Verify Email Tests ====================

    @Test
    fun `POST verify-email with valid token should verify user`() {
        // Given - Create unverified user and token
        val user = createUnverifiedUser("test@example.com", "testuser")
        val token = createVerificationToken(user)

        // When & Then
        mockMvc.perform(post("/api/auth/verify-email").param("token", token.token))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true))

        // Verify user is marked as verified in database
        val updatedUser = userRepository.findById(user.id!!).get()
        assertTrue(updatedUser.emailVerified, "User should be verified")

        // Verify token is marked as verified
        val updatedToken = tokenRepository.findByToken(token.token)
        assertNotNull(updatedToken?.verifiedAt, "Token should be marked as verified")
    }

    @Test
    fun `POST verify-email with invalid token should return 400`() {
        // When & Then
        mockMvc.perform(post("/api/auth/verify-email").param("token", "invalid-token-123"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST verify-email with expired token should return 400`() {
        // Given - Create user and expired token
        val user = createUnverifiedUser("test@example.com", "testuser")
        val expiredToken =
                EmailVerificationToken(
                        token = "expired-token",
                        user = user,
                        expiresAt = Instant.now().minus(1, ChronoUnit.HOURS)
                )
        tokenRepository.save(expiredToken)

        // When & Then
        mockMvc.perform(post("/api/auth/verify-email").param("token", expiredToken.token))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST verify-email with already verified token should return 400`() {
        // Given - Create user and already verified token
        val user = createUnverifiedUser("test@example.com", "testuser")
        val verifiedToken =
                EmailVerificationToken(
                        token = "verified-token",
                        user = user,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS),
                        verifiedAt = Instant.now()
                )
        tokenRepository.save(verifiedToken)

        // When & Then
        mockMvc.perform(post("/api/auth/verify-email").param("token", verifiedToken.token))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST verify-email should be publicly accessible`() {
        // Given - Create user and token
        val user = createUnverifiedUser("test@example.com", "testuser")
        val token = createVerificationToken(user)

        // When & Then - Should work without authentication
        mockMvc.perform(post("/api/auth/verify-email").param("token", token.token))
                .andExpect(status().isOk)
    }

    // ==================== Resend Verification Tests ====================

    @Test
    fun `POST resend-verification with valid email should return 204`() {
        // Given - Create unverified user
        createUnverifiedUser("test@example.com", "testuser")

        // When & Then
        mockMvc.perform(post("/api/auth/resend-verification").param("email", "test@example.com"))
                .andExpect(status().isNoContent)
    }

    @Test
    fun `POST resend-verification with verified user should return 400`() {
        // Given - Create verified user
        val user = createVerifiedUser("verified@example.com", "verifieduser")

        // When & Then
        mockMvc.perform(post("/api/auth/resend-verification").param("email", user.email))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST resend-verification with non-existent email should return 400`() {
        // When & Then
        mockMvc.perform(
                        post("/api/auth/resend-verification")
                                .param("email", "nonexistent@example.com")
                )
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST resend-verification should be publicly accessible`() {
        // Given - Create unverified user
        createUnverifiedUser("test@example.com", "testuser")

        // When & Then - Should work without authentication
        mockMvc.perform(post("/api/auth/resend-verification").param("email", "test@example.com"))
                .andExpect(status().isNoContent)
    }

    @Test
    fun `POST resend-verification should invalidate old tokens`() {
        // Given - Create user with existing token
        val user = createUnverifiedUser("test@example.com", "testuser")
        val oldToken = createVerificationToken(user)

        // When - Resend verification
        mockMvc.perform(post("/api/auth/resend-verification").param("email", user.email))
                .andExpect(status().isNoContent)

        // Then - Old token should be deleted
        val deletedToken = tokenRepository.findByToken(oldToken.token)
        assertNull(deletedToken, "Old token should be deleted")
    }

    // ==================== Login with Email Verification Tests ====================

    @Test
    fun `POST login with unverified email should fail`() {
        // Given - Create unverified user
        val user = createUnverifiedUser("test@example.com", "testuser")

        // When & Then
        val loginRequest = AuthDTO.LoginRequest(email = user.email, password = "password123")

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest))
                )
                .andExpect(status().isBadRequest)
                .andExpect(cookie().doesNotExist("mytherion_token"))
    }

    @Test
    fun `POST login with verified email should succeed`() {
        // Given - Create verified user
        val user = createVerifiedUser("verified@example.com", "verifieduser")

        // When & Then
        val loginRequest = AuthDTO.LoginRequest(email = user.email, password = "password123")

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest))
                )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.email").value(user.email))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(cookie().exists("mytherion_token"))
    }

    // ==================== Helper Methods ====================

    private fun createUnverifiedUser(email: String, username: String): User {
        val user =
                User(
                        email = email,
                        username = username,
                        passwordHash = passwordEncoder.encode("password123"),
                        role = UserRole.USER,
                        emailVerified = false
                )
        return userRepository.save(user)
    }

    private fun createVerifiedUser(email: String, username: String): User {
        val user =
                User(
                        email = email,
                        username = username,
                        passwordHash = passwordEncoder.encode("password123"),
                        role = UserRole.USER,
                        emailVerified = true
                )
        return userRepository.save(user)
    }

    private fun createVerificationToken(user: User): EmailVerificationToken {
        val token =
                EmailVerificationToken(
                        token = java.util.UUID.randomUUID().toString(),
                        user = user,
                        expiresAt = Instant.now().plus(24, ChronoUnit.HOURS)
                )
        return tokenRepository.save(token)
    }
}
