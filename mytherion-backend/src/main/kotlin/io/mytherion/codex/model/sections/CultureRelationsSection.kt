package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for cultures, including semantic links and cultural lenses. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CultureRelationsSection(
    override val id: String = "CULTURE_RELATIONS",
    override val type: String = "CULTURE_RELATIONS",
    val data: CultureRelationsData = CultureRelationsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class CultureRelationsData(
    val locations: List<EntryLink> = emptyList(),
    val leaders: List<EntryLink> = emptyList(),
    val members: List<EntryLink> = emptyList(),
    val parentCulture: EntryLink? = null,
    val derivatives: List<EntryLink> = emptyList(),
    val species: List<EntryLink> = emptyList(),
    val affiliatedOrgs: List<EntryLink> = emptyList(),
    val ownedItems: List<EntryLink> = emptyList()
)
