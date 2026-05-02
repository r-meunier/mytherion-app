package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Internal cultural attributes and data. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CultureComponent(
    override val id: String = "CULTURE",
    override val type: String = "CULTURE",
    val data: CultureData = CultureData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class CultureData(
    val language: String? = null,
    val population: String? = null,
    val values: String? = null,
    val rituals: String? = null,
    val mythos: String? = null,
    val expression: String? = null,
    val history: String? = null
)
