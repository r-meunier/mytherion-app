package io.mytherion.entity.model.components

/** Historical data and backstory. */
data class HistoryComponent(
        override val type: String = "HISTORY",
        val data: HistoryData = HistoryData()
) : EntityComponent

data class HistoryData(
        val backstory: String? = null,
        val journey: String? = null // The character's path/progression
)
