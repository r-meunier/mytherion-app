package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Social & Life Context (Occupations, Skills, etc.). */
@JsonIgnoreProperties(ignoreUnknown = true)
data class SocialSection(
    override val id: String = "SOCIAL",
    override val type: String = "SOCIAL",
    val data: SocialData = SocialData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class SocialData(
    val occupations: List<String> = emptyList(),
    val hobbies: List<String> = emptyList(),
    val skills: List<String> = emptyList(),
    val talents: List<String> = emptyList(),
    val sociology: String? = null, // External social standing/context
    val affiliations: String? = null // General text-based affiliations
)
