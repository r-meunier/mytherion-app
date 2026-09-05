package io.mytherion.codex.dto

import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

import java.util.UUID

/** Request DTO for creating a new entry */
data class CreateEntryRequest(
    @field:NotNull(message = "CodexEntry type is required") val type: EntryType,
    @field:NotBlank(message = "Name is required")
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String,
    val description: String? = null,
    val notes: String? = null,
    val tags: List<String>? = null,
    val thumbnail: String? = null,
    val content: EntryContent? = null
)
