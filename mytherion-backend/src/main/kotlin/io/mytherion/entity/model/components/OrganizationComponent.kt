package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Internal organization structure and data. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class OrganizationComponent(
    override val id: String = "ORGANIZATION",
    override val type: String = "ORGANIZATION",
    val data: OrganizationData = OrganizationData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
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
