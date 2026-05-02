package io.mytherion.entity.model.components

/** 
 * Generic Perspectives component. 
 * Can be attached to any entity (Character, Org, Culture) to track opinions on other entities.
 */
data class PerspectivesComponent(
        override val type: String = "PERSPECTIVES",
        val data: PerspectiveData = PerspectiveData()
) : EntityComponent

data class PerspectiveData(
        val views: List<OpinionLink> = emptyList()
)

data class OpinionLink(
        val entity: EntityLink,      // The target entity
        val opinion: String? = null, // The text field for the view/opinion
        val stance: String? = null   // e.g. "Friendly", "Hostile", "Suspicious"
)
