package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Biological and physiological data for a species. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesSection(
    override val id: String = "SPECIES",
    override val type: String = "SPECIES_DETAILS",
    val data: SpeciesData = SpeciesData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesData(
    val pluralName: String? = null,
    val scientificName: String? = null,
    val isSapient: Boolean = false,
    val lifespan: Quantity = Quantity(),
    val anatomy: String? = null,
    val uniqueAbilities: String? = null,
    val reproduction: String? = null,
    val habitat: String? = null,
    val diet: String? = null,
    val origins: String? = null // Text based origins/history
)
