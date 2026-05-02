package io.mytherion.user.service

import io.mytherion.user.dto.UpdateUserRequest
import io.mytherion.user.dto.UserResponse
import io.mytherion.user.exception.UserNotFoundException
import io.mytherion.user.repository.UserRepository
import java.time.Instant
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(private val userRepository: UserRepository) {

    @Transactional(readOnly = true)
    fun getAll(): List<UserResponse> =
        userRepository.findAll().filter { !it.isDeleted() }.map(UserResponse::from)

    @Transactional(readOnly = true)
    fun getUserById(id: Long): UserResponse {
        val user = userRepository.findByIdAndDeletedAtIsNull(id) ?: throw UserNotFoundException(id)
        return UserResponse.from(user)
    }

    @Transactional
    fun updateUser(userId: Long, currentUserId: Long, isAdmin: Boolean, request: UpdateUserRequest): UserResponse {
        val user = userRepository.findByIdAndDeletedAtIsNull(userId)
            ?: throw UserNotFoundException(userId)

        // Authorization: users can only update their own profile unless they are an admin
        if (userId != currentUserId && !isAdmin) {
            throw IllegalArgumentException("You can only update your own profile")
        }

        // Update username if provided and validate uniqueness
        request.username?.let { newUsername ->
            if (newUsername != user.username) {
                if (userRepository.existsByUsernameAndDeletedAtIsNull(newUsername)) {
                    throw IllegalArgumentException("Username '$newUsername' is already taken")
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
                    throw IllegalArgumentException("Invalid role: $roleName")
                }
            } else {
                throw IllegalArgumentException("Only administrators can change roles")
            }
        }

        return UserResponse.from(userRepository.save(user))
    }

    @Transactional
    fun deleteUser(userId: Long, currentUserId: Long, isAdmin: Boolean) {
        val user = userRepository.findByIdAndDeletedAtIsNull(userId)
            ?: throw UserNotFoundException(userId)

        // Authorization: users can only delete their own account unless they are an admin
        if (userId != currentUserId && !isAdmin) {
            throw IllegalArgumentException("You can only delete your own account")
        }

        // Soft delete: mark as deleted instead of removing from database
        user.deletedAt = Instant.now()
        userRepository.save(user)
    }
}
