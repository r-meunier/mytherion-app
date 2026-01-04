package io.mytherion.project.dto

import io.mytherion.project.model.Project

data class ProjectResponse(
    val id: Long,
    val name: String,
    val description: String?
) {
    companion object {
        fun from(project: Project) = ProjectResponse(
            id = project.id!!,
            name = project.name,
            description = project.description
        )
    }
}

data class CreateProjectRequest(
    val name: String,
    val description: String? = null
)
