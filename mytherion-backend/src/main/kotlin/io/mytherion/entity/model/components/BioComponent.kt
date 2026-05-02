package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Standard Biography component (Physical & Vitality). */
@JsonIgnoreProperties(ignoreUnknown = true)
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
) {
    @JsonAnySetter
    fun handleUnknown(key: String, value: Any?) {
        // Ignore unknown fields like legacy height/weight
    }
}
