package io.mytherion.user.repository

import io.mytherion.user.model.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?
    fun findByEmailAndDeletedAtIsNull(email: String): User?
    fun findByIdAndDeletedAtIsNull(id: Long): User?
    fun existsByEmail(email: String): Boolean
    fun existsByUsername(username: String): Boolean
    fun existsByUsernameAndDeletedAtIsNull(username: String): Boolean
}
