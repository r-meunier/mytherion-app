package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for locations (occupants and hierarchy). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationRelationsSection(
    override val id: String = "LOCATION_RELATIONS",
    override val type: String = "LOCATION_RELATIONS",
    val data: LocationRelationsData = LocationRelationsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class LocationRelationsData(
    val parentLocation: EntryLink? = null, // The container location
    val species: List<EntryLink> = emptyList(),
    val cultures: List<EntryLink> = emptyList(),
    val bornHere: List<EntryLink> = emptyList(),
    val residents: List<EntryLink> = emptyList(),
    val items: List<EntryLink> = emptyList(),
    val organizations: List<EntryLink> = emptyList()
)
