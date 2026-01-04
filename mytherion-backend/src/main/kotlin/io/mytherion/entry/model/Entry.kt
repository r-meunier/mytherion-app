package io.mytherion.entry.model

import io.mytherion.project.model.Project
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "entries")
class Entry(
        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "entry_id_seq")
        val id: Long? = null,
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "project_id", nullable = false)
        val project: Project,
        @Column(nullable = false) @Enumerated(EnumType.STRING) var type: EntryType,
        @Column(nullable = false) var title: String,
        @Column(columnDefinition = "text") var summary: String? = null,
        @Column(columnDefinition = "text") var body: String? = null,

        // For now, keep tags as a plain string: "vampire, london, julien"
        @Column(columnDefinition = "text") var tags: String? = null,
        @Column(name = "image_url", columnDefinition = "text") var imageUrl: String? = null,

        // JSONB in DB; we store it as raw JSON string for now
        @Column(columnDefinition = "jsonb") var metadata: String? = null,
        @Column(name = "created_at", nullable = false) val createdAt: Instant = Instant.now(),
        @Column(name = "updated_at", nullable = false) var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    private fun touchUpdatedAt() {
        updatedAt = Instant.now()
    }
}

enum class EntryType {
    CHARACTER,
    ORGANIZATION,
    CULTURE,
    SPECIES,
    LOCATION,
    ITEM
}
