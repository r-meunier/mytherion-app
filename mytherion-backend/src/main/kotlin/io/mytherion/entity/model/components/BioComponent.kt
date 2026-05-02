package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Standard Biography component (Physical & Vitality). */
data class BioComponent(
    override val id: String = "BIO",
    override val type: String = "BIO",
    val data: BioData = BioData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class BioData(
    val status: String? = null, // e.g. Alive, Dead, Missing
    val age: Quantity = Quantity(),
    val gender: String? = null,
    val sex: String? = null,
    val role: String? = null,
    val condition: String? = null // Overall Condition/Presentation
)
