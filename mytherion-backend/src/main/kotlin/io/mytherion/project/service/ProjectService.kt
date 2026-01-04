package io.mytherion.project.service

import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val userRepository: UserRepository
) {

    // TEMP: hard-coded user until auth is in place
    private fun getCurrentUser() =
        userRepository.findById(1L).orElseThrow {
            IllegalStateException("Demo user with id=1 not found. Create it manually for now.")
        }

    @Transactional(readOnly = true)
    fun listProjectsForCurrentUser(): List<ProjectResponse> {
        val user = getCurrentUser()
        return projectRepository.findAllByOwner(user).map(ProjectResponse::from)
    }

    @Transactional
    fun createProject(request: CreateProjectRequest): ProjectResponse {
        val user = getCurrentUser()
        val project = Project(
            owner = user,
            name = request.name,
            description = request.description
        )
        return ProjectResponse.from(projectRepository.save(project))
    }
}
