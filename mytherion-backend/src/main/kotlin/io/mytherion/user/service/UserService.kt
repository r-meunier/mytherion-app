package io.mytherion.user.service

import io.mytherion.user.dto.UpdateUserRequest
import io.mytherion.user.dto.UserResponse
import io.mytherion.user.exception.InvalidRoleException
import io.mytherion.user.exception.UserAccessDeniedException
import io.mytherion.user.exception.UserNotFoundException
import io.mytherion.user.exception.UsernameAlreadyInUseException
import io.mytherion.user.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(private val userRepository: UserRepository) {

    @Transactional(readOnly = true)
    fun getAll(): List<UserResponse> =
        userRepository.findAll().filter { !it.isDeleted() }.map(UserResponse::from)

    @Transactional(readOnly = true)
    fun getUserById(id: UUID): UserResponse {
        val user = userRepository.findByIdAndDeletedAtIsNull(id) ?: throw UserNotFoundException(id)
        return UserResponse.from(user)
    }

    @Transactional
    fun updateUser(userId: UUID, currentUserId: UUID, isAdmin: Boolean, request: UpdateUserRequest): UserResponse {
        // Authorization: users can only update their own profile unless they are an admin.
        // Checked before the lookup so a non-admin cannot tell a missing user (404) from
        // someone else's (403).
        if (userId != currentUserId && !isAdmin) {
            throw UserAccessDeniedException(userId)
        }

        val user = userRepository.findByIdAndDeletedAtIsNull(userId)
            ?: throw UserNotFoundException(userId)

        // Update username if provided and validate uniqueness
        request.username?.let { newUsername ->
            if (newUsername != user.username) {
                if (userRepository.existsByUsernameAndDeletedAtIsNull(newUsername)) {
                    throw UsernameAlreadyInUseException()
                }
                user.username = newUsername
            }
        }

        // Update role if provided (Admin only)
        request.role?.let { roleName ->
            if (isAdmin) {
                try {
                    user.role = io.mytherion.user.model.UserRole.valueOf(roleName.uppercase())
                } catch (e: Exception) {
                    throw InvalidRoleException(roleName)
                }
            } else {
                throw UserAccessDeniedException(userId)
            }
        }

        return UserResponse.from(userRepository.save(user))
    }

    @Transactional
    fun deleteUser(userId: UUID, currentUserId: UUID, isAdmin: Boolean) {
        // Authorization first, for the same reason as in updateUser.
        if (userId != currentUserId && !isAdmin) {
            throw UserAccessDeniedException(userId)
        }

        val user = userRepository.findByIdAndDeletedAtIsNull(userId)
            ?: throw UserNotFoundException(userId)

        // Soft delete: mark as deleted instead of removing from database
        user.markDeleted()
        userRepository.save(user)
    }
}
