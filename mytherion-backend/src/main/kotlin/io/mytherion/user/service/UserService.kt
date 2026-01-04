package io.mytherion.user.service

import io.mytherion.project.exception.UserNotFoundException
import io.mytherion.user.dto.UpdateUserRequest
import io.mytherion.user.dto.UserResponse
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
    fun updateUser(userId: Long, currentUserId: Long, request: UpdateUserRequest): UserResponse {
        // Authorization: users can only update their own profile
        if (userId != currentUserId) {
            throw IllegalArgumentException("You can only update your own profile")
        }

        val user =
                userRepository.findByIdAndDeletedAtIsNull(userId)
                        ?: throw UserNotFoundException(userId)

        // Update username if provided and validate uniqueness
        request.username?.let { newUsername ->
            if (newUsername != user.username) {
                if (userRepository.existsByUsernameAndDeletedAtIsNull(newUsername)) {
                    throw IllegalArgumentException("Username '$newUsername' is already taken")
                }
                user.username = newUsername
            }
        }

        return UserResponse.from(userRepository.save(user))
    }

    @Transactional
    fun deleteUser(userId: Long, currentUserId: Long) {
        // Authorization: users can only delete their own account
        if (userId != currentUserId) {
            throw IllegalArgumentException("You can only delete your own account")
        }

        val user =
                userRepository.findByIdAndDeletedAtIsNull(userId)
                        ?: throw UserNotFoundException(userId)

        // Soft delete: mark as deleted instead of removing from database
        user.deletedAt = Instant.now()
        userRepository.save(user)
    }
}
