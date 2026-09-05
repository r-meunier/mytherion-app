package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Internal organization structure and data. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class OrganizationSection(
    override val id: String = "ORGANIZATION",
    override val type: String = "ORGANIZATION_DETAILS",
    val data: OrganizationData = OrganizationData()
) : EntrySection

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
