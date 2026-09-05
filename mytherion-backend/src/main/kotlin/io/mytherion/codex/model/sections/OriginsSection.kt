package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Contextual Origins (Location & Culture links). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class OriginsSection(
    override val id: String = "ORIGINS",
    override val type: String = "ORIGINS",
    val data: OriginsData = OriginsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class OriginsData(
    val birthplace: EntryLink? = null,
    val residence: EntryLink? = null,
    val species: EntryLink? = null,
    val culture: EntryLink? = null
)
