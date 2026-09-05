package io.mytherion.codex.model.sections

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Historical data and backstory. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class HistorySection(
    override val id: String = "HISTORY",
    override val type: String = "HISTORY",
    val data: HistoryData = HistoryData()
) : EntrySection

@JsonIgnoreProperties(ignoreUnknown = true)
data class HistoryData(
    val backstory: String? = null,
    val journey: String? = null // The character's path/progression
)
