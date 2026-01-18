package io.mytherion.project.service

import io.mytherion.entity.repository.EntityRepository
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectHasEntitiesException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProjectService(
        private val projectRepository: ProjectRepository,
        private val userRepository: UserRepository,
        private val entityRepository: EntityRepository
) {

    // TEMP: hard-coded user until auth is in place
    private fun getCurrentUser(): User {
        return userRepository.findById(1L).orElseThrow {
            IllegalStateException("Demo user with id=1 not found. Create it manually for now.")
        }
    }

    /** Verify that the current user owns the given project */
    private fun verifyOwnership(project: Project, currentUser: User) {
        if (project.owner.id != currentUser.id) {
            throw ProjectAccessDeniedException(project.id!!)
        }
    }

    @Transactional(readOnly = true)
    fun listProjectsForCurrentUser(page: Int = 0, size: Int = 20): Page<ProjectResponse> {
        val user = getCurrentUser()
        val pageable: Pageable =
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        return projectRepository.findAllByOwner(user, pageable).map(ProjectResponse::from)
    }

    @Transactional(readOnly = true)
    fun getProjectById(id: Long): ProjectResponse {
        val user = getCurrentUser()
        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)
        return ProjectResponse.from(project)
    }

    @Transactional
    fun createProject(request: CreateProjectRequest): ProjectResponse {
        val user = getCurrentUser()
        val project = Project(owner = user, name = request.name, description = request.description)
        return ProjectResponse.from(projectRepository.save(project))
    }

    @Transactional
    fun updateProject(id: Long, request: UpdateProjectRequest): ProjectResponse {
        val user = getCurrentUser()
        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)

        // Update only provided fields
        request.name?.let { project.name = it }
        request.description?.let { project.description = it }

        // updatedAt will be automatically updated by @PreUpdate callback
        return ProjectResponse.from(projectRepository.save(project))
    }

    @Transactional(readOnly = true)
    fun getProjectStats(id: Long): io.mytherion.project.dto.ProjectStatsDTO {
        val user = getCurrentUser()
        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)

        val entities = entityRepository.findAllByProjectAndDeletedAtIsNull(project)
        val entityCount = entities.size
        val entityCountByType = entities.groupBy { it.type.name }.mapValues { it.value.size }

        return io.mytherion.project.dto.ProjectStatsDTO.from(
                project,
                entityCount,
                entityCountByType
        )
    }

    @Transactional
    fun deleteProject(id: Long) {
        val user = getCurrentUser()
        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)

        // Check if project has entities before deleting
        val entityCount = entityRepository.findAllByProjectAndDeletedAtIsNull(project).size
        if (entityCount > 0) {
            throw ProjectHasEntitiesException(id, entityCount)
        }

        projectRepository.delete(project)
    }
}
