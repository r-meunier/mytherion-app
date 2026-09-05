package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Geographical and environmental data for a location. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationSection(
    override val id: String = "LOCATION",
    override val type: String = "LOCATION_DETAILS",
    val data: LocationData = LocationData()
) : EntrySection

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
