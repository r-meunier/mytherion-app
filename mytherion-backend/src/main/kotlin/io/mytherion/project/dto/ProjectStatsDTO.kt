package io.mytherion.project.dto

import io.mytherion.project.model.Project
import java.time.Instant

import java.util.UUID

/** Response DTO for Project with statistics */
data class ProjectStatsDTO(
    val id: UUID,
    val name: String,
    val description: String?,
    val entryCount: Int,
    val entityCountByType: Map<String, Int>,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(
            project: Project,
            entryCount: Int,
            entityCountByType: Map<String, Int>
        ): ProjectStatsDTO {
            return ProjectStatsDTO(
                id = requireNotNull(project.id) { "Project ID is missing" },
                name = project.name,
                description = project.description,
                entryCount = entryCount,
                entityCountByType = entityCountByType,
                createdAt = project.createdAt,
                updatedAt = project.updatedAt
            )
        }
    }
}
