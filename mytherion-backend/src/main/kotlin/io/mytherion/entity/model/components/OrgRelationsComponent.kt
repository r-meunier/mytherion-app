package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for organizations (links to other entities). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class OrgRelationsComponent(
    override val id: String = "ORG_RELATIONS",
    override val type: String = "ORG_RELATIONS",
    val data: OrgRelationsData = OrgRelationsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
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
