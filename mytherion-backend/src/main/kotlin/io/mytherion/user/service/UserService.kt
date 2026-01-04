package io.mytherion.user.service

import io.mytherion.project.exception.UserNotFoundException
import io.mytherion.user.dto.UserResponse
import io.mytherion.user.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository) {

    fun getAll(): List<UserResponse> = userRepository.findAll().map(UserResponse::from)

    fun getUserById(id: Long): UserResponse {
        val user = userRepository.findById(id).orElse(null) ?: throw UserNotFoundException(id)
        return UserResponse.from(user)
    }
}
