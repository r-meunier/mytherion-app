package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for organizations (links to other entries). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class OrganizationRelationsSection(
    override val id: String = "ORG_RELATIONS",
    override val type: String = "ORGANIZATION_RELATIONS",
    val data: OrgRelationsData = OrgRelationsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class OrgRelationsData(
    val parentOrg: EntryLink? = null,
    val subsidiaries: List<EntryLink> = emptyList(),
    val leaders: List<EntryLink> = emptyList(),
    val members: List<EntryLink> = emptyList(),
    val operatingLocations: List<EntryLink> = emptyList(),
    val affiliatedSpecies: List<EntryLink> = emptyList(),
    val culture: EntryLink? = null,
    val ownedItems: List<EntryLink> = emptyList()
)
