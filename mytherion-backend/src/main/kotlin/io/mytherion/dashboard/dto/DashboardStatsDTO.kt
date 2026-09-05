package io.mytherion.dashboard.dto

import java.time.Instant

/** Aggregate statistics for the user dashboard. */
data class DashboardStatsDTO(
    val totalEntities: Long,
    val entitiesThisWeek: Long,
    val recentEdits: Long,
    val totalProjects: Long,
    val recentEntities: List<io.mytherion.codex.dto.EntryDTO> = emptyList(),
    val entityCountByType: Map<String, Int> = emptyMap(),
    val lastUpdated: Instant = Instant.now()
)
