package io.mytherion.auth.service

import io.mockk.every
import io.mockk.mockk
import io.mytherion.auth.exception.NotAuthenticatedException
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class CurrentUserProviderTest {

    private val userRepository = mockk<UserRepository>()
    private val provider = CurrentUserProvider(userRepository)
    private val userId = UUID.randomUUID()

    private fun authenticateAs(principal: Any) {
        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken(principal, null, emptyList())
    }

    @AfterEach
    fun clearContext() = SecurityContextHolder.clearContext()

    @Test
    fun `returns the live user behind the token`() {
        val user = User(username = "u", email = "u@test.dev", passwordHash = "hash").apply { id = userId }
        authenticateAs(userId)
        every { userRepository.findByIdAndDeletedAtIsNull(userId) } returns user

        assertSame(user, provider.getCurrentUser())
    }

    @Test
    fun `no authentication is 401`() {
        assertThrows<NotAuthenticatedException> { provider.getCurrentUser() }
    }

    @Test
    fun `token for a missing or soft-deleted user is a dead session, 401`() {
        authenticateAs(userId)
        every { userRepository.findByIdAndDeletedAtIsNull(userId) } returns null

        assertThrows<NotAuthenticatedException> { provider.getCurrentUser() }
    }

    @Test
    fun `a principal that is not a user id is a bug, not a client error`() {
        authenticateAs("not-a-uuid")

        assertThrows<IllegalStateException> { provider.getCurrentUser() }
    }
}
