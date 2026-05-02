package io.mytherion.dashboard.dto

import java.time.Instant

/** Aggregate statistics for the user dashboard. */
data class DashboardStatsDTO(
    val totalEntities: Long,
    val entitiesThisWeek: Long,
    val recentEdits: Long,
    val totalProjects: Long,
    val recentEntities: List<io.mytherion.entity.dto.EntityDTO> = emptyList(),
    val lastUpdated: Instant = Instant.now()
)
