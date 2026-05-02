package io.mytherion.entity.model.components

/** Psychological makeup and internal state. */
data class PsychologyComponent(
        override val type: String = "PSYCHOLOGY",
        val data: PsychologyData = PsychologyData()
) : EntityComponent

data class PsychologyData(
        val motivations: MotivationData = MotivationData(),
        val arc: CharacterArc = CharacterArc(),
        val positiveTraits: List<String> = emptyList(),
        val negativeTraits: List<String> = emptyList(),
        val fears: String? = null,
        val wound: String? = null,
        val lie: String? = null,
        val secrets: String? = null,
        val quirks: List<String> = emptyList(),
        val mannerisms: String? = null,
        val perspective: String? = null // General worldview/opinion text field
)

data class MotivationData(
        val externalGoal: String? = null,
        val internalNeed: String? = null,
        val justification: String? = null
)

data class CharacterArc(
        val type: String? = null,
        val theme: String? = null,
        val moralChoice: String? = null
)
