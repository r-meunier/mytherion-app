package io.mytherion.user.rest

import io.mytherion.user.dto.UpdateUserRequest
import io.mytherion.user.dto.UserResponse
import io.mytherion.user.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user")
class UserController(private val userService: UserService) {

    @GetMapping fun getUsers(): List<UserResponse> = userService.getAll()

    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: Long): UserResponse = userService.getUserById(id)

    @PutMapping("/{id}")
    fun updateUser(
            @PathVariable id: Long,
            @RequestBody @Valid request: UpdateUserRequest,
            authentication: Authentication
    ): UserResponse {
        val currentUserId = authentication.name.toLong()
        return userService.updateUser(id, currentUserId, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(@PathVariable id: Long, authentication: Authentication) {
        val currentUserId = authentication.name.toLong()
        userService.deleteUser(id, currentUserId)
    }
}
