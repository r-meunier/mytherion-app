package io.mytherion.entity.model.components

/** Contextual Origins (Location & Culture links). */
data class OriginsComponent(
        override val type: String = "ORIGINS",
        val data: OriginsData = OriginsData()
) : EntityComponent

data class OriginsData(
        val birthplace: EntityLink? = null,
        val residence: EntityLink? = null,
        val species: EntityLink? = null,
        val culture: EntityLink? = null
)
