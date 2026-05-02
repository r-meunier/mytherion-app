package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Custom key-value component. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class CustomComponent(
    override val id: String = "CUSTOM",
    override val type: String = "CUSTOM",
    val data: Map<String, Any> = emptyMap()
) : EntityComponent

/** Fallback component for unknown types. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class GenericComponent(
    override val type: String,
    override val id: String = type,
    val data: Map<String, Any> = emptyMap()
) : EntityComponent
