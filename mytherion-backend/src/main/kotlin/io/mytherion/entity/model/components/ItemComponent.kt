package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Inherent properties and lore of an item. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class ItemComponent(
    override val id: String = "ITEM",
    override val type: String = "ITEM",
    val data: ItemData = ItemData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class ItemData(
    val rarity: String? = null,
    val material: String? = null,
    val condition: String? = null,
    val weight: Quantity = Quantity(),
    val value: Quantity = Quantity(),
    val properties: List<String> = emptyList(), // e.g. ["Sentient", "Cursed"]
    val history: String? = null
)
