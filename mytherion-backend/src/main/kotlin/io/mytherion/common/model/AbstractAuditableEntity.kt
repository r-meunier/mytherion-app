package io.mytherion.common.model

import jakarta.persistence.*
import org.hibernate.proxy.HibernateProxy
import java.time.Instant
import java.util.UUID

@MappedSuperclass
abstract class AbstractAuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()

    @Column(name = "deleted_at")
    var deletedAt: Instant? = null

    @PrePersist
    protected fun onPrePersist() {
        val now = Instant.now()
        createdAt = now
        updatedAt = now
    }

    @PreUpdate
    protected fun onPreUpdate() {
        updatedAt = Instant.now()
    }

    fun isDeleted(): Boolean = deletedAt != null

    fun markDeleted() {
        deletedAt = Instant.now()
    }

    fun restore() {
        deletedAt = null
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false

        // Unpack Hibernate proxies so lazy relationships evaluate accurately
        val thisEffectiveClass = if (this is HibernateProxy) this.hibernateLazyInitializer.persistentClass else this.javaClass
        val otherEffectiveClass = if (other is HibernateProxy) other.hibernateLazyInitializer.persistentClass else other.javaClass
        if (thisEffectiveClass != otherEffectiveClass) return false

        other as AbstractAuditableEntity

        // Entities with null IDs are transient and only equal by instance identity (this === other)
        return id != null && id == other.id
    }

    override fun hashCode(): Int {
        // Return persistent class hash code to guarantee bucket consistency across Set/Map transitions
        return if (this is HibernateProxy) this.hibernateLazyInitializer.persistentClass.hashCode() else this.javaClass.hashCode()
    }
}
