package io.mytherion.user.repository

import io.mytherion.user.model.User
import org.springframework.data.jpa.repository.JpaRepository

import java.util.UUID

interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
    fun findByEmailAndDeletedAtIsNull(email: String): User?
    fun findByIdAndDeletedAtIsNull(id: UUID): User?
    fun existsByEmail(email: String): Boolean
    fun existsByUsername(username: String): Boolean
    fun existsByUsernameAndDeletedAtIsNull(username: String): Boolean
}
