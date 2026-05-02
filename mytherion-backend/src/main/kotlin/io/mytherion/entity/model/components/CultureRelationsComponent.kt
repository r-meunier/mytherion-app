package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for cultures, including semantic links and cultural lenses. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CultureRelationsComponent(
    override val id: String = "CULTURE_RELATIONS",
    override val type: String = "CULTURE_RELATIONS",
    val data: CultureRelationsData = CultureRelationsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
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
