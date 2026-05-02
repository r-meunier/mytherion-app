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
        JsonSubTypes.Type(value = PsycheComponent::class, name = "PSYCHE"),
        JsonSubTypes.Type(value = SocialComponent::class, name = "SOCIAL"),
        JsonSubTypes.Type(value = CustomComponent::class, name = "CUSTOM")
)
sealed interface EntityComponent {
        val type: String
}
