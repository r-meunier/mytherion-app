package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for characters. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CharacterRelationsSection(
    override val id: String = "CHARACTER_RELATIONS",
    override val type: String = "CHARACTER_RELATIONS",
    val data: CharacterRelationsData = CharacterRelationsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class CharacterRelationsData(
    val birthplace: EntryLink? = null,
    val residence: EntryLink? = null,
    val leaderOf: List<EntryLink> = emptyList(),
    val memberOf: List<EntryLink> = emptyList(),
    val owns: List<EntryLink> = emptyList(),
    val species: EntryLink? = null,
    val culture: EntryLink? = null
)
