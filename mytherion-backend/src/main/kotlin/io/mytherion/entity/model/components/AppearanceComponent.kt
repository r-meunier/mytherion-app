package io.mytherion.entity.model.components

/** Physical appearance of an entity. */
data class AppearanceComponent(
        override val type: String = "APPEARANCE",
        val data: AppearanceData = AppearanceData()
) : EntityComponent

data class AppearanceData(
        val physicalFeatures: String? = null,
        val clothingStyle: String? = null,
        val distinguishingMarks: String? = null,
        val skinAndMarkings: String? = null,
        val height: Quantity = Quantity(),
        val weight: Quantity = Quantity()
)
