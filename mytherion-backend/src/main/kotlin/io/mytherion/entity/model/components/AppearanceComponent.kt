package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Physical appearance of an entity. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class AppearanceComponent(
    override val id: String = "APPEARANCE",
    override val type: String = "APPEARANCE",
    val data: AppearanceData = AppearanceData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class AppearanceData(
    val physicalFeatures: String? = null,
    val clothingStyle: String? = null,
    val distinguishingMarks: String? = null,
    val skinAndMarkings: String? = null,
    val height: Quantity = Quantity(),
    val weight: Quantity = Quantity()
)
