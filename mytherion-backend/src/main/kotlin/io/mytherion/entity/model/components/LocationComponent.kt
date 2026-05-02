package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Geographical and environmental data for a location. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationComponent(
    override val id: String = "LOCATION",
    override val type: String = "LOCATION",
    val data: LocationData = LocationData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationData(
    val population: Quantity = Quantity(),
    val geology: String? = null,
    val ecology: String? = null,
    val economy: String? = null,
    val demographics: String? = null,
    val energy: String? = null,
    val security: String? = null,
    val history: String? = null
)
