package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Contextual Origins (Location & Culture links). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class OriginsComponent(
    override val id: String = "ORIGINS",
    override val type: String = "ORIGINS",
    val data: OriginsData = OriginsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class OriginsData(
    val birthplace: EntityLink? = null,
    val residence: EntityLink? = null,
    val species: EntityLink? = null,
    val culture: EntityLink? = null
)
