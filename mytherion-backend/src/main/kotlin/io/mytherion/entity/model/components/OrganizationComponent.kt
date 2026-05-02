package io.mytherion.entity.model.components

/** Internal organization structure and data. */
data class OrganizationComponent(
        override val type: String = "ORGANIZATION",
        val data: OrganizationData = OrganizationData()
) : EntityComponent

data class OrganizationData(
        val population: Quantity = Quantity(),
        val agenda: String? = null,
        val powerStructure: String? = null,
        val laws: String? = null,
        val internalCulture: String? = null, // Text description of the org's culture
        val diplomacy: String? = null,
        val products: List<String> = emptyList(),
        val assets: String? = null
)
