package io.mytherion.auth.model

import io.mytherion.user.model.User
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "email_verification_tokens")
class EmailVerificationToken(
        @Id
        @GeneratedValue(
                strategy = GenerationType.SEQUENCE,
                generator = "email_verification_token_id_seq"
        )
        @SequenceGenerator(
                name = "email_verification_token_id_seq",
                sequenceName = "email_verification_tokens_id_seq",
                allocationSize = 1
        )
        var id: Long? = null,
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
