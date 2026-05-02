package io.mytherion.entity.model.components

/** Psychological makeup (Motivations & Traits). */
data class PsycheComponent(
        override val type: String = "PSYCHE",
        val data: PsycheData = PsycheData()
) : EntityComponent

data class PsycheData(
        val motivations: MotivationData = MotivationData(),
        val arc: CharacterArc = CharacterArc(),
        val positiveTraits: List<String> = emptyList(),
        val negativeTraits: List<String> = emptyList(),
        val fears: String? = null,
        val wound: String? = null, // The past trauma (The "Ghost")
        val lie: String? = null, // The false belief they hold
        val secrets: String? = null, // What they hide from the world
        val quirks: List<String> = emptyList(),
        val mannerisms: String? = null // General Behavior/Demeanor
)

data class MotivationData(
        val externalGoal: String? = null, // The "Want" (Tangible objective)
        val internalNeed: String? = null, // The "Need" (Psychological growth)
        val justification: String? = null // The "Why" (Reasoning)
)

data class CharacterArc(
        val type: String? = null, // Positive, Negative, Flat, etc.
        val theme: String? = null, // The central moral theme
        val moralChoice: String? = null // The climactic decision
)
