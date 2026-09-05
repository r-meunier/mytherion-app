package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Physical appearance of an entry. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class AppearanceSection(
    override val id: String = "APPEARANCE",
    override val type: String = "APPEARANCE",
    val data: AppearanceData = AppearanceData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class AppearanceData(
    val physicalFeatures: String? = null,
    val clothingStyle: String? = null,
    val distinguishingMarks: String? = null,
    val skinAndMarkings: String? = null,
    val height: Quantity = Quantity(),
    val weight: Quantity = Quantity()
)
