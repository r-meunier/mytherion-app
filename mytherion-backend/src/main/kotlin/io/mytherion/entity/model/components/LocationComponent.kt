package io.mytherion.entity.model.components

/** Geographical and environmental data for a location. */
data class LocationComponent(
        override val type: String = "LOCATION",
        val data: LocationData = LocationData()
) : EntityComponent

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
