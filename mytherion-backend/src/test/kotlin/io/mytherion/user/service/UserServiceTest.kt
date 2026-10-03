package io.mytherion.user.service

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.user.dto.UpdateUserRequest
import io.mytherion.user.exception.InvalidRoleException
import io.mytherion.user.exception.UserAccessDeniedException
import io.mytherion.user.exception.UserNotFoundException
import io.mytherion.user.exception.UsernameAlreadyInUseException
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID

class UserServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val service = UserService(userRepository)

    private val me = UUID.randomUUID()
    private val someoneElse = UUID.randomUUID()

    private fun user(id: UUID) =
        User(username = "u_$id", email = "$id@test.dev", passwordHash = "hash", role = UserRole.USER)
            .apply { this.id = id }

    @Test
    fun `non-admin editing another user is denied before the lookup, so existence does not leak`() {
        assertThrows<UserAccessDeniedException> {
            service.updateUser(someoneElse, me, isAdmin = false, UpdateUserRequest(username = "x"))
        }
        verify(exactly = 0) { userRepository.findByIdAndDeletedAtIsNull(any()) }
    }

    @Test
    fun `non-admin deleting another user is denied before the lookup`() {
        assertThrows<UserAccessDeniedException> { service.deleteUser(someoneElse, me, isAdmin = false) }
        verify(exactly = 0) { userRepository.findByIdAndDeletedAtIsNull(any()) }
    }

    @Test
    fun `admin editing a missing user gets 404`() {
        every { userRepository.findByIdAndDeletedAtIsNull(someoneElse) } returns null
        assertThrows<UserNotFoundException> {
            service.updateUser(someoneElse, me, isAdmin = true, UpdateUserRequest(username = "x"))
        }
    }

    @Test
    fun `taking a username already in use is a conflict`() {
        every { userRepository.findByIdAndDeletedAtIsNull(me) } returns user(me)
        every { userRepository.existsByUsernameAndDeletedAtIsNull("taken") } returns true
        assertThrows<UsernameAlreadyInUseException> {
            service.updateUser(me, me, isAdmin = false, UpdateUserRequest(username = "taken"))
        }
    }

    @Test
    fun `non-admin changing their own role is denied`() {
        every { userRepository.findByIdAndDeletedAtIsNull(me) } returns user(me)
        assertThrows<UserAccessDeniedException> {
            service.updateUser(me, me, isAdmin = false, UpdateUserRequest(role = "ADMIN"))
        }
    }

    @Test
    fun `admin setting an unknown role gets 400`() {
        every { userRepository.findByIdAndDeletedAtIsNull(me) } returns user(me)
        assertThrows<InvalidRoleException> {
            service.updateUser(me, me, isAdmin = true, UpdateUserRequest(role = "WIZARD"))
        }
    }
}
