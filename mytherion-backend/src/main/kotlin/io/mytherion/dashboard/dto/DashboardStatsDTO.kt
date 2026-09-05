package io.mytherion.dashboard.dto

import java.time.Instant

/** Aggregate statistics for the user dashboard. */
data class DashboardStatsDTO(
    val totalEntries: Long,
    val entriesThisWeek: Long,
    val recentEdits: Long,
    val totalProjects: Long,
    val recentEntries: List<io.mytherion.codex.dto.EntryDTO> = emptyList(),
    val entryCountByType: Map<String, Int> = emptyMap(),
    val lastUpdated: Instant = Instant.now()
)
