package io.mytherion.entity.model.components

/** Relational data for items (location and ownership). */
data class ItemRelationsComponent(
        override val type: String = "ITEM_RELATIONS",
        val data: ItemRelationsData = ItemRelationsData()
) : EntityComponent

data class ItemRelationsData(
        val currentLocation: EntityLink? = null,
        val owners: List<EntityLink> = emptyList() // Links to Characters, Organizations, Species, or Cultures
)
