package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for items (location and ownership). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class ItemRelationsComponent(
    override val id: String = "ITEM_RELATIONS",
    override val type: String = "ITEM_RELATIONS",
    val data: ItemRelationsData = ItemRelationsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class ItemRelationsData(
    val currentLocation: EntityLink? = null,
    val owners: List<EntityLink> = emptyList() // Links to Characters, Organizations, Species, or Cultures
)
