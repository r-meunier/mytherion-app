package io.mytherion.entity.model.components

/** Relational data for cultures, including semantic links and cultural lenses. */
data class CultureRelationsComponent(
        override val type: String = "CULTURE_RELATIONS",
        val data: CultureRelationsData = CultureRelationsData()
) : EntityComponent

data class CultureRelationsData(
        val locations: List<EntityLink> = emptyList(),
        val leaders: List<EntityLink> = emptyList(),
        val members: List<EntityLink> = emptyList(),
        val parentCulture: EntityLink? = null,
        val derivatives: List<EntityLink> = emptyList(),
        val species: List<EntityLink> = emptyList(),
        val affiliatedOrgs: List<EntityLink> = emptyList(),
        val ownedItems: List<EntityLink> = emptyList()
)
