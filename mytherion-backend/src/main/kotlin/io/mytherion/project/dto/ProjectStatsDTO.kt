package io.mytherion.project.dto

import io.mytherion.project.model.Project
import java.time.Instant

/** Response DTO for Project with statistics */
data class ProjectStatsDTO(
        val id: Long,
        val name: String,
        val description: String?,
        val entityCount: Int,
        val entityCountByType: Map<String, Int>,
        val createdAt: Instant,
        val updatedAt: Instant
) {
    companion object {
        fun from(
                project: Project,
                entityCount: Int,
                entityCountByType: Map<String, Int>
        ): ProjectStatsDTO {
            return ProjectStatsDTO(
                    id = project.id!!,
                    name = project.name,
                    description = project.description,
                    entityCount = entityCount,
                    entityCountByType = entityCountByType,
                    createdAt = project.createdAt,
                    updatedAt = project.updatedAt
            )
        }
    }
}
