package io.mytherion.codex.dto

import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryType
import jakarta.validation.constraints.Size

import java.util.UUID

/**
 * Request DTO for updating an existing entry All fields are optional - only provided fields will
 * be updated
 */
data class UpdateEntryRequest(
    val type: EntryType? = null,
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String? = null,
    val description: String? = null,
    val notes: String? = null,
    val tags: List<String>? = null,
    val thumbnail: String? = null,
    val content: EntryContent? = null,
    val version: Long? = null
)
