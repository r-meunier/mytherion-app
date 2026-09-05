package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** 
 * Generic Perspectives component. 
 * Can be attached to any entry (Character, Org, Culture) to track opinions on other entries.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class PerspectivesSection(
    override val id: String = "PERSPECTIVES",
    override val type: String = "PERSPECTIVES",
    val data: PerspectiveData = PerspectiveData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class PerspectiveData(
    val views: List<OpinionLink> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class OpinionLink(
    val entry: EntryLink,      // The target entry
    val opinion: String? = null, // The text field for the view/opinion
    val stance: String? = null   // e.g. "Friendly", "Hostile", "Suspicious"
)
