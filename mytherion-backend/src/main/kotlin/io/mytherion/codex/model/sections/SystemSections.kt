package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Custom key-value component. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CustomSection(
    override val id: String = "CUSTOM",
    override val type: String = "CUSTOM_FIELDS",
    val data: Map<String, Any> = emptyMap()
) : EntrySection

/** Fallback component for unknown types. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class GenericSection(
    override val type: String,
    override val id: String = type,
    val data: Map<String, Any> = emptyMap()
) : EntrySection
