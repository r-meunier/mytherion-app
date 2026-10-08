package io.mytherion.codex.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/**
 * A read-only starting set of details for one [EntryType], shipped as JSON under
 * `resources/codex/templates/`. Creating an entry copies the template's details into the entry's
 * content; changing a template only affects entries created afterwards.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class EntryTemplate(
    val id: String,
    val entryType: EntryType,
    val level: TemplateLevel,
    val name: String,
    val description: String? = null,
    val details: List<TemplateDetail> = emptyList()
)

/** A detail as a template declares it: no id and no value, those belong to the entry. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateDetail(
    val label: String,
    val hint: String? = null,
    val role: ContextRole? = null
)

/** How much a template starts with. Mirrored in types/codex.ts. */
enum class TemplateLevel {
    BLANK,
    BASIC,
    FULL
}
