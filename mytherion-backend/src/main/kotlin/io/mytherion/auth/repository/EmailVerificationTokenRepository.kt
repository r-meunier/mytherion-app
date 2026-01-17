package io.mytherion.auth.repository

import io.mytherion.auth.model.EmailVerificationToken
import io.mytherion.user.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EmailVerificationTokenRepository : JpaRepository<EmailVerificationToken, Long> {
    fun findByToken(token: String): EmailVerificationToken?
    fun findByUserAndVerifiedAtIsNull(user: User): EmailVerificationToken?
    fun deleteByUser(user: User)
}
