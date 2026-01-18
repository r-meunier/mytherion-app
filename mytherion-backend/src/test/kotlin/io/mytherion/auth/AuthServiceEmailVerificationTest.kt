package io.mytherion.auth

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mytherion.auth.model.EmailVerificationToken
import io.mytherion.auth.repository.EmailVerificationTokenRepository
import io.mytherion.email.EmailService
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(MockKExtension::class)
class AuthServiceEmailVerificationTest {

    @MockK private lateinit var userRepository: UserRepository

    @MockK private lateinit var verificationTokenRepository: EmailVerificationTokenRepository

    @MockK private lateinit var emailService: EmailService

    @InjectMockKs private lateinit var authService: AuthService

    private lateinit var testUser: User
    private lateinit var verifiedUser: User

    @BeforeEach
    fun setUp() {
        testUser =
                User(
                        id = 1L,
                        email = "test@example.com",
                        username = "testuser",
                        passwordHash = "hashedPassword",
                        role = UserRole.USER,
                        emailVerified = false
                )

        verifiedUser =
                User(
                        id = 2L,
                        email = "verified@example.com",
                        username = "verifieduser",
                        passwordHash = "hashedPassword",
                        role = UserRole.USER,
                        emailVerified = true
                )
    }

    // ==================== sendVerificationEmail Tests ====================

    @Test
    fun `sendVerificationEmail should create token and send email`() {
        // Given
        every { verificationTokenRepository.deleteByUser(testUser) } just Runs
        every { verificationTokenRepository.save(any()) } returnsArgument 0
        every { emailService.sendVerificationEmail(any(), any()) } just Runs

        // When
        authService.sendVerificationEmail(testUser)

        // Then
        verify { verificationTokenRepository.deleteByUser(testUser) }
        verify { verificationTokenRepository.save(match { it.user == testUser }) }
        verify { emailService.sendVerificationEmail(testUser.email, any()) }
    }

    @Test
    fun `sendVerificationEmail should delete old unverified tokens`() {
        // Given
        every { verificationTokenRepository.deleteByUser(testUser) } just Runs
        every { verificationTokenRepository.save(any()) } returnsArgument 0
        every { emailService.sendVerificationEmail(any(), any()) } just Runs

        // When
        authService.sendVerificationEmail(testUser)

        // Then
        verify(exactly = 1) { verificationTokenRepository.deleteByUser(testUser) }
    }

    @Test
    fun `sendVerificationEmail should create token with 24 hour expiration`() {
        // Given
        val capturedToken = slot<EmailVerificationToken>()
        every { verificationTokenRepository.deleteByUser(testUser) } just Runs
        every { verificationTokenRepository.save(capture(capturedToken)) } returnsArgument 0
        every { emailService.sendVerificationEmail(any(), any()) } just Runs

        val beforeSend = Instant.now()

        // When
        authService.sendVerificationEmail(testUser)

        val afterSend = Instant.now()

        // Then
        val token = capturedToken.captured
        val expectedExpiry = beforeSend.plus(24, ChronoUnit.HOURS)
        val maxExpiry = afterSend.plus(24, ChronoUnit.HOURS)

        assertTrue(token.expiresAt.isAfter(expectedExpiry) || token.expiresAt == expectedExpiry)
        assertTrue(token.expiresAt.isBefore(maxExpiry) || token.expiresAt == maxExpiry)
    }

    // ==================== verifyEmail Tests ====================

    @Test
    fun `verifyEmail with valid token should mark user as verified`() {
        // Given
        val token = "valid-token-123"
        val verificationToken =
                EmailVerificationToken(
                        id = 1L,
                        token = token,
                        user = testUser,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS),
                        verifiedAt = null
                )

        every { verificationTokenRepository.findByToken(token) } returns verificationToken
        every { userRepository.save(any()) } returnsArgument 0
        every { verificationTokenRepository.save(any()) } returnsArgument 0

        // When
        val result = authService.verifyEmail(token)

        // Then
        assertTrue(testUser.emailVerified, "User should be marked as verified")
        assertNotNull(verificationToken.verifiedAt, "Token verifiedAt should be set")
        assertEquals(testUser.email, result.email)
        assertTrue(result.emailVerified)

        verify { userRepository.save(testUser) }
        verify { verificationTokenRepository.save(verificationToken) }
    }

    @Test
    fun `verifyEmail with invalid token should throw exception`() {
        // Given
        val token = "invalid-token"
        every { verificationTokenRepository.findByToken(token) } returns null

        // When & Then
        val exception = assertThrows<IllegalArgumentException> { authService.verifyEmail(token) }

        assertEquals("Invalid verification token", exception.message)
        verify { verificationTokenRepository.findByToken(token) }
        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `verifyEmail with expired token should throw exception`() {
        // Given
        val token = "expired-token"
        val expiredToken =
                EmailVerificationToken(
                        id = 1L,
                        token = token,
                        user = testUser,
                        expiresAt = Instant.now().minus(1, ChronoUnit.HOURS),
                        verifiedAt = null
                )

        every { verificationTokenRepository.findByToken(token) } returns expiredToken

        // When & Then
        val exception = assertThrows<IllegalArgumentException> { authService.verifyEmail(token) }

        assertEquals("Verification token expired", exception.message)
        verify { verificationTokenRepository.findByToken(token) }
        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `verifyEmail with already verified token should throw exception`() {
        // Given
        val token = "already-verified-token"
        val verifiedToken =
                EmailVerificationToken(
                        id = 1L,
                        token = token,
                        user = testUser,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS),
                        verifiedAt = Instant.now().minus(1, ChronoUnit.HOURS)
                )

        every { verificationTokenRepository.findByToken(token) } returns verifiedToken

        // When & Then
        val exception = assertThrows<IllegalArgumentException> { authService.verifyEmail(token) }

        assertEquals("Email already verified", exception.message)
        verify { verificationTokenRepository.findByToken(token) }
        verify(exactly = 0) { userRepository.save(any()) }
    }

    // ==================== resendVerificationEmailByEmail Tests ====================

    @Test
    fun `resendVerificationEmailByEmail should send new email`() {
        // Given
        val email = "test@example.com"
        every { userRepository.findByEmailAndDeletedAtIsNull(email) } returns testUser
        every { verificationTokenRepository.deleteByUser(testUser) } just Runs
        every { verificationTokenRepository.save(any()) } returnsArgument 0
        every { emailService.sendVerificationEmail(any(), any()) } just Runs

        // When
        authService.resendVerificationEmailByEmail(email)

        // Then
        verify { userRepository.findByEmailAndDeletedAtIsNull(email) }
        verify { verificationTokenRepository.deleteByUser(testUser) }
        verify { verificationTokenRepository.save(any()) }
        verify { emailService.sendVerificationEmail(email, any()) }
    }

    @Test
    fun `resendVerificationEmailByEmail for verified user should throw exception`() {
        // Given
        val email = "verified@example.com"
        every { userRepository.findByEmailAndDeletedAtIsNull(email) } returns verifiedUser

        // When & Then
        val exception =
                assertThrows<IllegalArgumentException> {
                    authService.resendVerificationEmailByEmail(email)
                }

        assertEquals("Email already verified", exception.message)
        verify { userRepository.findByEmailAndDeletedAtIsNull(email) }
        verify(exactly = 0) { emailService.sendVerificationEmail(any(), any()) }
    }

    @Test
    fun `resendVerificationEmailByEmail for non-existent user should throw exception`() {
        // Given
        val email = "nonexistent@example.com"
        every { userRepository.findByEmailAndDeletedAtIsNull(email) } returns null

        // When & Then
        val exception =
                assertThrows<IllegalArgumentException> {
                    authService.resendVerificationEmailByEmail(email)
                }

        assertEquals("User not found", exception.message)
        verify { userRepository.findByEmailAndDeletedAtIsNull(email) }
        verify(exactly = 0) { emailService.sendVerificationEmail(any(), any()) }
    }

    @Test
    fun `resendVerificationEmailByEmail should normalize email to lowercase`() {
        // Given
        val email = "Test@Example.COM"
        val normalizedEmail = "test@example.com"
        every { userRepository.findByEmailAndDeletedAtIsNull(normalizedEmail) } returns testUser
        every { verificationTokenRepository.deleteByUser(testUser) } just Runs
        every { verificationTokenRepository.save(any()) } returnsArgument 0
        every { emailService.sendVerificationEmail(any(), any()) } just Runs

        // When
        authService.resendVerificationEmailByEmail(email)

        // Then
        verify { userRepository.findByEmailAndDeletedAtIsNull(normalizedEmail) }
    }

    // ==================== resendVerificationEmail (by userId) Tests ====================

    @Test
    fun `resendVerificationEmail by userId should send new email`() {
        // Given
        val userId = 1L
        every { userRepository.findById(userId) } returns Optional.of(testUser)
        every { verificationTokenRepository.deleteByUser(testUser) } just Runs
        every { verificationTokenRepository.save(any()) } returnsArgument 0
        every { emailService.sendVerificationEmail(any(), any()) } just Runs

        // When
        authService.resendVerificationEmail(userId)

        // Then
        verify { userRepository.findById(userId) }
        verify { emailService.sendVerificationEmail(testUser.email, any()) }
    }

    @Test
    fun `resendVerificationEmail for verified user should throw exception`() {
        // Given
        val userId = 2L
        every { userRepository.findById(userId) } returns Optional.of(verifiedUser)

        // When & Then
        val exception =
                assertThrows<IllegalArgumentException> {
                    authService.resendVerificationEmail(userId)
                }

        assertEquals("Email already verified", exception.message)
        verify(exactly = 0) { emailService.sendVerificationEmail(any(), any()) }
    }

    @Test
    fun `resendVerificationEmail for non-existent user should throw exception`() {
        // Given
        val userId = 999L
        every { userRepository.findById(userId) } returns Optional.empty()

        // When & Then
        val exception =
                assertThrows<IllegalArgumentException> {
                    authService.resendVerificationEmail(userId)
                }

        assertEquals("User not found", exception.message)
        verify(exactly = 0) { emailService.sendVerificationEmail(any(), any()) }
    }
}
