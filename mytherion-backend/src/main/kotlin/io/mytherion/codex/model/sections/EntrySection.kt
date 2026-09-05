package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import java.util.UUID

/**
 * Base interface for all entry sections. Uses Jackson polymorphic type handling to deserialize
 * into concrete classes based on the 'type' field.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type",
    visible = true,
    defaultImpl = GenericSection::class
)
@JsonSubTypes(
    JsonSubTypes.Type(value = BioSection::class, name = "BIO"),
    JsonSubTypes.Type(value = OriginsSection::class, name = "ORIGINS"),
    JsonSubTypes.Type(value = PsychologySection::class, name = "PSYCHOLOGY"),
    JsonSubTypes.Type(value = AppearanceSection::class, name = "APPEARANCE"),
    JsonSubTypes.Type(value = SocialSection::class, name = "SOCIAL"),
    JsonSubTypes.Type(value = HistorySection::class, name = "HISTORY"),
    JsonSubTypes.Type(value = CharacterRelationsSection::class, name = "CHARACTER_RELATIONS"),
    JsonSubTypes.Type(value = OrganizationSection::class, name = "ORGANIZATION_DETAILS"),
    JsonSubTypes.Type(value = OrganizationRelationsSection::class, name = "ORGANIZATION_RELATIONS"),
    JsonSubTypes.Type(value = CultureSection::class, name = "CULTURE_DETAILS"),
    JsonSubTypes.Type(value = CultureRelationsSection::class, name = "CULTURE_RELATIONS"),
    JsonSubTypes.Type(value = PerspectivesSection::class, name = "PERSPECTIVES"),
    JsonSubTypes.Type(value = SpeciesSection::class, name = "SPECIES_DETAILS"),
    JsonSubTypes.Type(value = SpeciesRelationsSection::class, name = "SPECIES_RELATIONS"),
    JsonSubTypes.Type(value = LocationSection::class, name = "LOCATION_DETAILS"),
    JsonSubTypes.Type(value = LocationRelationsSection::class, name = "LOCATION_RELATIONS"),
    JsonSubTypes.Type(value = ItemSection::class, name = "ITEM_DETAILS"),
    JsonSubTypes.Type(value = ItemRelationsSection::class, name = "ITEM_RELATIONS"),
    JsonSubTypes.Type(value = CustomSection::class, name = "CUSTOM_FIELDS")
)
@JsonIgnoreProperties(ignoreUnknown = true)
sealed interface EntrySection {
    val id: String
        get() = type
    val type: String
}

/**
 * A unified structure for linking one entry to another. Allows for content and custom labels on
 * the relationship.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class EntryLink(
    val targetId: UUID,
    val label: String? = null,
    val content: Map<String, Any> = emptyMap()
)

/**
 * A generic structure for numerical values with units. Allows for sorting, filtering, and unit
 * conversion logic.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class Quantity(
    val value: Double? = null,
    val unit: String? = null, // e.g. "kg", "years", "people", "gold"
    val label: String? = null // Optional override for display
)
