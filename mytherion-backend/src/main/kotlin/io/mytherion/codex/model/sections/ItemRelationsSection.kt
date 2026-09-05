package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for items (location and ownership). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class ItemRelationsSection(
    override val id: String = "ITEM_RELATIONS",
    override val type: String = "ITEM_RELATIONS",
    val data: ItemRelationsData = ItemRelationsData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class ItemRelationsData(
    val currentLocation: EntryLink? = null,
    val owners: List<EntryLink> = emptyList() // Links to Characters, Organizations, Species, or Cultures
)
