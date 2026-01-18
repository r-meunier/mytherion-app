package io.mytherion.auth.model

import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import java.time.Instant
import java.time.temporal.ChronoUnit
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class EmailVerificationTokenTest {

    private fun createTestUser(): User {
        return User(
                email = "test@example.com",
                username = "testuser",
                password = "hashedPassword",
                role = UserRole.USER
        )
    }

    @Test
    fun `isExpired returns true when token is expired`() {
        // Given
        val user = createTestUser()
        val expiredTime = Instant.now().minus(1, ChronoUnit.HOURS)
        val token =
                EmailVerificationToken(token = "test-token", user = user, expiresAt = expiredTime)

        // When
        val result = token.isExpired()

        // Then
        assertTrue(result, "Token should be expired")
    }

    @Test
    fun `isExpired returns false when token is not expired`() {
        // Given
        val user = createTestUser()
        val futureTime = Instant.now().plus(1, ChronoUnit.HOURS)
        val token =
                EmailVerificationToken(token = "test-token", user = user, expiresAt = futureTime)

        // When
        val result = token.isExpired()

        // Then
        assertFalse(result, "Token should not be expired")
    }

    @Test
    fun `isExpired returns true when token expires at current instant`() {
        // Given
        val user = createTestUser()
        val now = Instant.now()
        val token = EmailVerificationToken(token = "test-token", user = user, expiresAt = now)

        // When - wait a tiny bit to ensure time has passed
        Thread.sleep(10)
        val result = token.isExpired()

        // Then
        assertTrue(result, "Token should be expired when expiresAt is in the past")
    }

    @Test
    fun `isVerified returns true when verifiedAt is set`() {
        // Given
        val user = createTestUser()
        val token =
                EmailVerificationToken(
                        token = "test-token",
                        user = user,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS),
                        verifiedAt = Instant.now()
                )

        // When
        val result = token.isVerified()

        // Then
        assertTrue(result, "Token should be verified when verifiedAt is set")
    }

    @Test
    fun `isVerified returns false when verifiedAt is null`() {
        // Given
        val user = createTestUser()
        val token =
                EmailVerificationToken(
                        token = "test-token",
                        user = user,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS),
                        verifiedAt = null
                )

        // When
        val result = token.isVerified()

        // Then
        assertFalse(result, "Token should not be verified when verifiedAt is null")
    }

    @Test
    fun `token is created with current timestamp`() {
        // Given
        val user = createTestUser()
        val beforeCreation = Instant.now()

        // When
        val token =
                EmailVerificationToken(
                        token = "test-token",
                        user = user,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS)
                )

        val afterCreation = Instant.now()

        // Then
        assertTrue(token.createdAt.isAfter(beforeCreation) || token.createdAt == beforeCreation)
        assertTrue(token.createdAt.isBefore(afterCreation) || token.createdAt == afterCreation)
    }

    @Test
    fun `token can be verified by setting verifiedAt`() {
        // Given
        val user = createTestUser()
        val token =
                EmailVerificationToken(
                        token = "test-token",
                        user = user,
                        expiresAt = Instant.now().plus(1, ChronoUnit.HOURS)
                )

        assertFalse(token.isVerified(), "Token should not be verified initially")

        // When
        token.verifiedAt = Instant.now()

        // Then
        assertTrue(token.isVerified(), "Token should be verified after setting verifiedAt")
    }
}
