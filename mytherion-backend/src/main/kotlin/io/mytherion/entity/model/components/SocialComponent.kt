package io.mytherion.entity.model.components

/** Social & Life Context (Occupations, Skills, etc.). */
data class SocialComponent(
    override val type: String = "SOCIAL",
    val data: SocialData = SocialData()
) : EntityComponent

data class SocialData(
    val occupations: List<String> = emptyList(),
    val hobbies: List<String> = emptyList(),
    val skills: List<String> = emptyList(),
    val talents: List<String> = emptyList(),
    val sociology: String? = null, // External social standing/context
    val affiliations: String? = null // General text-based affiliations
)
