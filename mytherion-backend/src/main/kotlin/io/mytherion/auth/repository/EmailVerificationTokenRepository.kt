package io.mytherion.auth.repository

import io.mytherion.auth.model.EmailVerificationToken
import io.mytherion.user.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EmailVerificationTokenRepository : JpaRepository<EmailVerificationToken, UUID> {
    fun findByToken(token: String): EmailVerificationToken?
    fun findByUserAndVerifiedAtIsNull(user: User): EmailVerificationToken?
    fun deleteByUser(user: User)
}
