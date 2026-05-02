package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

/**
 * Base interface for all entity components. Uses Jackson polymorphic type handling to deserialize
 * into concrete classes based on the 'type' field.
 */
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        visible = true,
        defaultImpl = GenericComponent::class
)
@JsonSubTypes(
        JsonSubTypes.Type(value = BioComponent::class, name = "BIO"),
        JsonSubTypes.Type(value = OriginsComponent::class, name = "ORIGINS"),
        JsonSubTypes.Type(value = PsychologyComponent::class, name = "PSYCHOLOGY"),
        JsonSubTypes.Type(value = AppearanceComponent::class, name = "APPEARANCE"),
        JsonSubTypes.Type(value = SocialComponent::class, name = "SOCIAL"),
        JsonSubTypes.Type(value = HistoryComponent::class, name = "HISTORY"),
        JsonSubTypes.Type(value = CharacterRelationsComponent::class, name = "CHARACTER_RELATIONS"),
        JsonSubTypes.Type(value = OrganizationComponent::class, name = "ORGANIZATION"),
        JsonSubTypes.Type(value = OrgRelationsComponent::class, name = "ORG_RELATIONS"),
        JsonSubTypes.Type(value = CultureComponent::class, name = "CULTURE"),
        JsonSubTypes.Type(value = CultureRelationsComponent::class, name = "CULTURE_RELATIONS"),
        JsonSubTypes.Type(value = PerspectivesComponent::class, name = "PERSPECTIVES"),
        JsonSubTypes.Type(value = CustomComponent::class, name = "CUSTOM")
)
sealed interface EntityComponent {
        val type: String
}

/**
 * A unified structure for linking one entity to another. Allows for metadata and custom labels on
 * the relationship.
 */
data class EntityLink(
        val targetId: Long,
        val label: String? = null,
        val metadata: Map<String, Any> = emptyMap()
)
