package io.mytherion.entity.model.components

/** Inherent properties and lore of an item. */
data class ItemComponent(
    override val type: String = "ITEM",
    val data: ItemData = ItemData()
) : EntityComponent

data class ItemData(
    val rarity: String? = null,
    val material: String? = null,
    val condition: String? = null,
    val weight: Quantity = Quantity(),
    val value: Quantity = Quantity(),
    val properties: List<String> = emptyList(), // e.g. ["Sentient", "Cursed"]
    val history: String? = null
)
