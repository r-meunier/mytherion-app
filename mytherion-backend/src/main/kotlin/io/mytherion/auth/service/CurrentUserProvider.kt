package io.mytherion.auth.service

import io.mytherion.auth.exception.NotAuthenticatedException
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CurrentUserProvider(
    private val userRepository: UserRepository,
) {

    fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || !authentication.isAuthenticated) {
            throw NotAuthenticatedException()
        }
        val userId =
            authentication.principal as? UUID
                ?: throw IllegalStateException("Principal is not a valid User ID")

        // A still-valid token for a user that no longer exists is a dead session, not a 500.
        return userRepository.findById(userId).orElseThrow {
            NotAuthenticatedException()
        }
    }
}
