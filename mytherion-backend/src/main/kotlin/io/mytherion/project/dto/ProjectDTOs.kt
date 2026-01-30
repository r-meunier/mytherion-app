package io.mytherion.project.dto

import io.mytherion.project.model.Project
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

data class ProjectResponse(
        val id: Long,
        val name: String,
        val description: String?,
        val ownerId: Long,
        val ownerUsername: String,
        val createdAt: Instant,
        val updatedAt: Instant,
        val genre: String?
) {
    companion object {
        fun from(project: Project) =
                ProjectResponse(
                        id = project.id!!,
                        name = project.name,
                        description = project.description,
                        ownerId = project.owner.id!!,
                        ownerUsername = project.owner.username,
                        createdAt = project.createdAt,
                        updatedAt = project.updatedAt,
                        genre = project.genre
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
