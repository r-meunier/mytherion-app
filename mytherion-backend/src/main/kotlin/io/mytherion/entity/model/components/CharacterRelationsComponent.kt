package io.mytherion.entity.model.components

/** Relational data for characters. */
data class CharacterRelationsComponent(
    override val type: String = "CHARACTER_RELATIONS",
    val data: CharacterRelationsData = CharacterRelationsData()
) : EntityComponent

data class CharacterRelationsData(
    val birthplace: EntityLink? = null,
    val residence: EntityLink? = null,
    val leaderOf: List<EntityLink> = emptyList(),
    val memberOf: List<EntityLink> = emptyList(),
    val owns: List<EntityLink> = emptyList(),
    val species: EntityLink? = null,
    val culture: EntityLink? = null
)
