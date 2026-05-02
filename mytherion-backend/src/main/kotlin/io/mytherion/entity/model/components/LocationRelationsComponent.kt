package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for locations (occupants and hierarchy). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationRelationsComponent(
    override val id: String = "LOCATION_RELATIONS",
    override val type: String = "LOCATION_RELATIONS",
    val data: LocationRelationsData = LocationRelationsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationRelationsData(
    val parentLocation: EntityLink? = null, // The container location
    val species: List<EntityLink> = emptyList(),
    val cultures: List<EntityLink> = emptyList(),
    val bornHere: List<EntityLink> = emptyList(),
    val residents: List<EntityLink> = emptyList(),
    val items: List<EntityLink> = emptyList(),
    val organizations: List<EntityLink> = emptyList()
)
