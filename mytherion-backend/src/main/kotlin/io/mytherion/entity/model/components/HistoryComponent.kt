package io.mytherion.entity.model.components

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Historical data and backstory. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class HistoryComponent(
    override val id: String = "HISTORY",
    override val type: String = "HISTORY",
    val data: HistoryData = HistoryData()
) : EntityComponent

@JsonIgnoreProperties(ignoreUnknown = true)
data class HistoryData(
    val backstory: String? = null,
    val journey: String? = null // The character's path/progression
)
