package io.mytherion.user.dto

import io.mytherion.user.model.User

data class UserResponse(val id: Long, val username: String) {
    companion object {
        fun from(user: User) = UserResponse(id = user.id!!, username = user.username)
    }
}
