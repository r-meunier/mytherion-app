package io.mytherion.codex.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

/**
 * Root object stored in the `content` jsonb column. See docs/codex-entry-model.md.
 *
 * [templateId] records which template the entry was created from. It is provenance only: nothing
 * depends on it staying accurate, and it is not checked against the current templates, so a
 * renamed or retired template never makes an existing entry invalid.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class EntryContent(
    val templateId: String? = null,
    val details: MutableList<EntryDetail> = mutableListOf()
)

/**
 * One author-controlled label/value pair on an entry ("Story role: Protagonist"). Values are text,
 * possibly multi-line. [hint] is copied from the template at creation so it survives template
 * changes; [role] tells the AI Context Pack what the detail is for.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class EntryDetail(
    val id: UUID,
    val label: String,
    val value: String? = null,
    val hint: String? = null,
    val role: ContextRole? = null
)

/** What a detail is for, so the Context Pack can pick it for a scene. Mirrored in types/codex.ts. */
enum class ContextRole {
    IDENTITY,
    APPEARANCE,
    VOICE,
    MOTIVATION,
    BACKSTORY,
    SENSORY,
    CURRENT_STATE
}
