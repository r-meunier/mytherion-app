package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** 
 * Generic Perspectives component. 
 * Can be attached to any entity (Character, Org, Culture) to track opinions on other entities.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class PerspectivesComponent(
    override val id: String = "PERSPECTIVES",
    override val type: String = "PERSPECTIVES",
    val data: PerspectiveData = PerspectiveData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class PerspectiveData(
    val views: List<OpinionLink> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class OpinionLink(
    val entity: EntityLink,      // The target entity
    val opinion: String? = null, // The text field for the view/opinion
    val stance: String? = null   // e.g. "Friendly", "Hostile", "Suspicious"
)
