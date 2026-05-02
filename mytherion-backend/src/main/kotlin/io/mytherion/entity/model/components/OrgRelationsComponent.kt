package io.mytherion.entity.model.components

/** Relational data for organizations (links to other entities). */
data class OrgRelationsComponent(
        override val type: String = "ORG_RELATIONS",
        val data: OrgRelationsData = OrgRelationsData()
) : EntityComponent

data class OrgRelationsData(
        val parentOrg: EntityLink? = null,
        val subsidiaries: List<EntityLink> = emptyList(),
        val leaders: List<EntityLink> = emptyList(),
        val members: List<EntityLink> = emptyList(),
        val operatingLocations: List<EntityLink> = emptyList(),
        val affiliatedSpecies: List<EntityLink> = emptyList(),
        val culture: EntityLink? = null,
        val ownedItems: List<EntityLink> = emptyList()
)
