package io.mytherion.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class AuthDTO {
    data class RegisterRequest(
        @field:Email val email: String,
        @field:NotBlank @field:Size(min = 3, max = 32) val username: String,
        @field:NotBlank @field:Size(min = 8, max = 72) val password: String
    )

    data class LoginRequest(
        @field:Email val email: String,
        @field:NotBlank val password: String
    )

    data class AuthResponse(
        val accessToken: String,
        val tokenType: String = "Bearer"
    )
}