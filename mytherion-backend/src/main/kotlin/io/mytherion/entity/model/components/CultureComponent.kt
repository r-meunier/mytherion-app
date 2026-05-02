package io.mytherion.entity.model.components

/** Internal cultural attributes and data. */
data class CultureComponent(
        override val type: String = "CULTURE",
        val data: CultureData = CultureData()
) : EntityComponent

data class CultureData(
        val language: String? = null,
        val population: String? = null,
        val values: String? = null,
        val rituals: String? = null,
        val mythos: String? = null,
        val expression: String? = null,
        val history: String? = null
)
