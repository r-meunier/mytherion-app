package io.mytherion.story.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/**
 * A built-in story structure (Three-Act, Save the Cat, …), shipped as JSON under
 * `resources/story/structures/`. Picking one creates its acts and beats; after that they belong to the
 * author, and changing the structure file only affects stories created afterwards.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class StoryStructure(
    val id: String,
    val name: String,
    val description: String? = null,
    /** Display order in the structure picker. */
    val order: Int = 0,
    val acts: List<StructureAct> = emptyList()
)

/** An act as a structure declares it. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class StructureAct(
    val title: String,
    val description: String? = null,
    val beats: List<StructureBeat> = emptyList()
)

/** A beat as a structure declares it: no id, that belongs to the act it is copied into. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class StructureBeat(
    val name: String,
    val hint: String? = null,
    /** Where the structure expects this beat, as a fraction of the story (0..1). */
    val position: Double? = null
)
