package io.mytherion.entity.model.components

/** Biological and physiological data for a species. */
data class SpeciesComponent(
        override val type: String = "SPECIES",
        val data: SpeciesData = SpeciesData()
) : EntityComponent

data class SpeciesData(
        val pluralName: String? = null,
        val scientificName: String? = null,
        val isSapient: Boolean = false,
        val lifespan: LifespanData = LifespanData(),
        val anatomy: String? = null,
        val uniqueAbilities: String? = null,
        val reproduction: String? = null,
        val habitat: String? = null,
        val diet: String? = null,
        val origins: String? = null // Text based origins/history
)

data class LifespanData(
        val amount: Int? = null,
        val unit: String? = null // e.g. Years, Months, Eons
)
