package io.mytherion.auth

import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class CurrentUserProvider(
    private val userRepository: UserRepository,
) {

    fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || !authentication.isAuthenticated) {
            throw IllegalStateException("No authenticated user found")
        }
        val userId =
            authentication.principal as? Long
                ?: throw IllegalStateException("Principal is not a valid User ID")

        return userRepository.findById(userId).orElseThrow {
            IllegalStateException("User with id=$userId not found")
        }
    }
}
