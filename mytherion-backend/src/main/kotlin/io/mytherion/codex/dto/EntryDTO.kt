package io.mytherion.codex.dto

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryType
import java.time.Instant

/** Response DTO for CodexEntry */
import java.util.UUID

data class EntryDTO(
    val id: UUID,
    val projectId: UUID,
    val type: EntryType,
    val name: String,
    val description: String?,
    val notes: String?,
    val tags: List<String>?,
    val thumbnail: String?,
    val content: EntryContent?,
    val version: Long,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(entry: CodexEntry): EntryDTO {
            return EntryDTO(
                id = requireNotNull(entry.id) { "CodexEntry ID is missing" },
                projectId = requireNotNull(entry.project.id) { "Project ID is missing" },
                type = entry.type,
                name = entry.name,
                description = entry.description,
                notes = entry.notes,
                tags = entry.tags?.toList(),
                thumbnail = entry.thumbnail,
                content = entry.content,
                version = entry.version,
                createdAt = entry.createdAt,
                updatedAt = entry.updatedAt
            )
        }
    }
}
