package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for species. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesRelationsSection(
    override val id: String = "SPECIES_RELATIONS",
    override val type: String = "SPECIES_RELATIONS",
    val data: SpeciesRelationsData = SpeciesRelationsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesRelationsData(
    val locations: List<EntryLink> = emptyList(),
    val ancestors: List<EntryLink> = emptyList(),
    val subspecies: List<EntryLink> = emptyList(),
    val affiliatedOrgs: List<EntryLink> = emptyList(),
    val ownedItems: List<EntryLink> = emptyList(),
    val culture: EntryLink? = null
)
