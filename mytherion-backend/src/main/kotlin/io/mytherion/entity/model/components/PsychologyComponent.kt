package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Psychological makeup and internal state. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class PsychologyComponent(
    override val id: String = "PSYCHOLOGY",
    override val type: String = "PSYCHOLOGY",
    val data: PsychologyData = PsychologyData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class PsychologyData(
    val motivations: MotivationData = MotivationData(),
    val arc: CharacterArc = CharacterArc(),
    val positiveTraits: List<String> = emptyList(),
    val negativeTraits: List<String> = emptyList(),
    val quirks: List<String> = emptyList(),
    val mannerisms: String? = null,
    val perspective: String? = null // General worldview/opinion text field
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MotivationData(
    val externalGoal: String? = null,
    val internalNeed: String? = null,
    val justification: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CharacterArc(
    val type: String? = null,
    val theme: String? = null,
    val moralChoice: String? = null
)
