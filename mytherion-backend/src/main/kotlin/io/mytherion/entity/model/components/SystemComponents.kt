package io.mytherion.entity.model.components

/** Custom key-value component. */
data class CustomComponent(
    override val type: String = "CUSTOM",
    val data: Map<String, Any> = emptyMap()
) : EntityComponent

/** Fallback component for unknown types. */
data class GenericComponent(
    override val type: String,
    val data: Map<String, Any> = emptyMap()
) : EntityComponent
