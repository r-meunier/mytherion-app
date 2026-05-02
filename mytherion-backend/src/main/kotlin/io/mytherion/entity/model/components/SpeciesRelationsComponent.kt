package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for species. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesRelationsComponent(
    override val id: String = "SPECIES_RELATIONS",
    override val type: String = "SPECIES_RELATIONS",
    val data: SpeciesRelationsData = SpeciesRelationsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesRelationsData(
    val locations: List<EntityLink> = emptyList(),
    val ancestors: List<EntityLink> = emptyList(),
    val subspecies: List<EntityLink> = emptyList(),
    val affiliatedOrgs: List<EntityLink> = emptyList(),
    val ownedItems: List<EntityLink> = emptyList(),
    val culture: EntityLink? = null
)
