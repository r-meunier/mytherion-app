package io.mytherion.project.dto

import io.mytherion.project.model.Project
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

import java.util.UUID

data class ProjectResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val ownerId: UUID,
    val ownerUsername: String,
    val createdAt: Instant,
    val updatedAt: Instant,
    val genre: String?,
    val entityCount: Long = 0
) {
    companion object {
        fun from(project: Project, entityCount: Long = 0) =
            ProjectResponse(
                id = requireNotNull(project.id) { "Project ID is missing" },
                name = project.name,
                description = project.description,
                ownerId = requireNotNull(project.owner.id) { "Owner ID is missing" },
                ownerUsername = project.owner.username,
                createdAt = project.createdAt,
                updatedAt = project.updatedAt,
                genre = project.genre,
                entityCount = entityCount
            )
    }
}

data class CreateProjectRequest(
    @field:NotBlank(message = "Project name is required")
    @field:Size(
        min = 1,
        max = 255,
        message = "Project name must be between 1 and 255 characters"
    )
    val name: String,
    @field:Size(max = 5000, message = "Description must not exceed 5000 characters")
    @field:Size(max = 5000, message = "Description must not exceed 5000 characters")
    val description: String? = null,
    val genre: String? = null
)

data class UpdateProjectRequest(
    @field:Size(
        min = 1,
        max = 255,
        message = "Project name must be between 1 and 255 characters"
    )
    val name: String? = null,
    @field:Size(max = 5000, message = "Description must not exceed 5000 characters")
    val description: String? = null,
    val genre: String? = null
)
