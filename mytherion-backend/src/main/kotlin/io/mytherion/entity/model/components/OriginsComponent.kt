package io.mytherion.entity.model.components

/** Contextual Origins (Location & Culture links). */
data class OriginsComponent(
        override val type: String = "ORIGINS",
        val data: OriginsData = OriginsData()
) : EntityComponent

data class OriginsData(
        val birthplaceId: Long? = null,
        val residenceId: Long? = null,
        val speciesId: Long? = null,
        val cultureId: Long? = null
)
