package io.mytherion.user.rest

import io.mytherion.user.dto.UpdateUserRequest
import io.mytherion.user.dto.UserResponse
import io.mytherion.user.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

import org.springframework.security.access.prepost.PreAuthorize
import java.util.UUID

@RestController
@RequestMapping("/api/user")
class UserController(private val userService: UserService) {

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  fun getUsers(): List<UserResponse> = userService.getAll()

  @GetMapping("/{id}")
  fun getUserById(@PathVariable id: UUID): UserResponse = userService.getUserById(id)

  @PutMapping("/{id}")
  fun updateUser(
    @PathVariable id: UUID,
    @RequestBody @Valid request: UpdateUserRequest,
    authentication: Authentication
  ): UserResponse {
    val currentUserId = UUID.fromString(authentication.name)
    val isAdmin = authentication.authorities.any { it.authority == "ROLE_ADMIN" }
    return userService.updateUser(id, currentUserId, isAdmin, request)
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  fun deleteUser(@PathVariable id: UUID, authentication: Authentication) {
    val currentUserId = UUID.fromString(authentication.name)
    val isAdmin = authentication.authorities.any { it.authority == "ROLE_ADMIN" }
    userService.deleteUser(id, currentUserId, isAdmin)
  }
}
