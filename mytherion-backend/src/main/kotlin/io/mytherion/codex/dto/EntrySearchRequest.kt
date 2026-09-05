package io.mytherion.codex.dto

import io.mytherion.codex.model.EntryType

import java.util.UUID

/** Request DTO for searching/filtering entries */
data class EntrySearchRequest(
    val type: EntryType? = null,
    val tags: List<String>? = null,
    val search: String? = null, // Search in name, description
    val page: Int = 0,
    val size: Int = 20
)
