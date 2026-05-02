package io.mytherion.entity.model.components

/** Standard Biography component (Physical & Vitality). */
data class BioComponent(
    override val type: String = "BIO", 
    val data: BioData = BioData()
) : EntityComponent

data class BioData(
        val status: String? = null, // e.g. Alive, Dead, Missing
        val age: String? = null,
        val gender: String? = null,
        val sex: String? = null,
        val role: String? = null,
        val height: String? = null,
        val weight: String? = null,
        val condition: String? = null // Overall Condition/Presentation
)
