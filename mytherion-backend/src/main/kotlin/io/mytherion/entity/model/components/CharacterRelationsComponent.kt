package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Relational data for characters. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CharacterRelationsComponent(
    override val id: String = "CHARACTER_RELATIONS",
    override val type: String = "CHARACTER_RELATIONS",
    val data: CharacterRelationsData = CharacterRelationsData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class CharacterRelationsData(
    val birthplace: EntityLink? = null,
    val residence: EntityLink? = null,
    val leaderOf: List<EntityLink> = emptyList(),
    val memberOf: List<EntityLink> = emptyList(),
    val owns: List<EntityLink> = emptyList(),
    val species: EntityLink? = null,
    val culture: EntityLink? = null
)
