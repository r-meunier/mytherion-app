package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Biological and physiological data for a species. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class SpeciesComponent(
    override val id: String = "SPECIES",
    override val type: String = "SPECIES",
    val data: SpeciesData = SpeciesData()
) : EntityComponent

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
