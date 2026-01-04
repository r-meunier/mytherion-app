package io.mytherion.user.dto

import jakarta.validation.constraints.Size

data class UpdateUserRequest(
        @field:Size(min = 3, max = 32, message = "Username must be between 3 and 32 characters")
        val username: String? = null
)
