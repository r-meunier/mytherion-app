package io.mytherion.entity.model.components

/** Relational data for species. */
data class SpeciesRelationsComponent(
    override val type: String = "SPECIES_RELATIONS",
    val data: SpeciesRelationsData = SpeciesRelationsData()
) : EntityComponent

data class SpeciesRelationsData(
    val locations: List<EntityLink> = emptyList(),
    val ancestors: List<EntityLink> = emptyList(),
    val subspecies: List<EntityLink> = emptyList(),
    val affiliatedOrgs: List<EntityLink> = emptyList(),
    val ownedItems: List<EntityLink> = emptyList(),
    val culture: EntityLink? = null
)
