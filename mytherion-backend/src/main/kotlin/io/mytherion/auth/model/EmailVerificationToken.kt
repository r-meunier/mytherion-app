package io.mytherion.auth.model

import io.mytherion.user.model.User
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "email_verification_tokens")
class EmailVerificationToken(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,
    @Column(nullable = false, unique = true) var token: String,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,
    @Column(name = "expires_at", nullable = false) var expiresAt: Instant,
    @Column(name = "created_at", nullable = false) val createdAt: Instant = Instant.now(),
    @Column(name = "verified_at") var verifiedAt: Instant? = null
) {
    fun isExpired(): Boolean = expiresAt.isBefore(Instant.now())
    fun isVerified(): Boolean = verifiedAt != null
}
