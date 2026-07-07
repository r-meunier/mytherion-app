package io.mytherion.project.service

import io.mytherion.auth.CurrentUserProvider
import io.mytherion.entity.service.EntityQueryService
import io.mytherion.logging.debugWith
import io.mytherion.logging.infoWith
import io.mytherion.logging.logger
import io.mytherion.logging.measureTime
import io.mytherion.logging.warnWith
import io.mytherion.monitoring.MetricsService
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectHasEntitiesException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val currentUserProvider: CurrentUserProvider,
    private val entityQueryService: EntityQueryService,
    private val metricsService: MetricsService
) {
    private val logger = logger()

    private fun getCurrentUser(): User = currentUserProvider.getCurrentUser()

    /** Verify that the current user owns the given project */
    private fun verifyOwnership(project: Project, currentUser: User) {
        if (project.owner.id != currentUser.id) {
            logger.warnWith(
                "Access denied to project",
                "projectId" to project.id,
                "ownerId" to project.owner.id,
                "requestingUserId" to currentUser.id
            )
            throw ProjectAccessDeniedException(project.id!!)
        }
    }

    /**
     * Fetch a project and verify that the given user owns it. Used by other services (e.g.
     * EntityService) to validate project access without directly querying ProjectRepository.
     */
    fun getVerifiedProject(projectId: UUID, userId: UUID): Project {
        val project =
            projectRepository.findByIdAndDeletedAtIsNull(projectId)
                ?: throw ProjectNotFoundException(projectId)
        if (project.owner.id != userId) {
            throw ProjectAccessDeniedException(requireNotNull(project.id) { "Project ID is missing" })
        }
        return project
    }

    @Transactional(readOnly = true)
    fun listProjectsForCurrentUser(page: Int = 0, size: Int = 20, search: String? = null, genre: String? = null): Page<ProjectResponse> {
        val user = getCurrentUser()
        logger.debugWith("Listing projects", "userId" to user.id, "page" to page, "size" to size, "search" to search, "genre" to genre)

        return logger.measureTime("Fetch projects") {
            val pageable: Pageable =
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            
            val result = if (search.isNullOrBlank() && genre.isNullOrBlank()) {
                projectRepository.findAllByOwnerAndDeletedAtIsNull(user, pageable).map { project ->
                    val count = entityQueryService.countByProject(project)
                    ProjectResponse.from(project, count)
                }
            } else {
                val namePattern = search?.takeIf { it.isNotBlank() }
                    ?.lowercase()
                    ?.replace("\\", "\\\\")
                    ?.replace("%", "\\%")
                    ?.replace("_", "\\_")
                    ?.let { "%$it%" }
                val genreFilter = genre?.takeIf { it.isNotBlank() }
                projectRepository.searchProjects(user, namePattern, genreFilter, pageable).map { project ->
                    val count = entityQueryService.countByProject(project)
                    ProjectResponse.from(project, count)
                }
            }

            logger.infoWith(
                "Projects listed",
                "userId" to user.id,
                "count" to result.content.size,
                "totalElements" to result.totalElements
            )
            result
        }
    }

    @Transactional(readOnly = true)
    fun getProjectById(projectId: UUID): ProjectResponse {
        val user = getCurrentUser()
        logger.debugWith("Fetching project", "projectId" to projectId, "userId" to user.id)

        val project =
            projectRepository.findById(projectId).orElseThrow {
                logger.warnWith("Project not found", "projectId" to projectId)
                ProjectNotFoundException(projectId)
            }
        verifyOwnership(project, user)

        val count = entityQueryService.countByProject(project)
        logger.infoWith("Project fetched", "projectId" to projectId, "name" to project.name, "entityCount" to count)
        return ProjectResponse.from(project, count)
    }

    @Transactional
    fun createProject(request: CreateProjectRequest): ProjectResponse {
        val user = getCurrentUser()
        logger.infoWith("Creating project", "userId" to user.id, "name" to request.name)

        val startTime = System.currentTimeMillis()
        var success = false

        return try {
            logger.measureTime("Save project") {
                val project =
                    Project(
                        owner = user,
                        name = request.name,
                        description = request.description,
                        genre = request.genre
                    )
                val saved = projectRepository.save(project)

                logger.infoWith(
                    "Project created successfully",
                    "projectId" to saved.id,
                    "userId" to user.id,
                    "name" to saved.name
                )
                success = true
                ProjectResponse.from(saved, 0)
            }
        } finally {
            val duration = System.currentTimeMillis() - startTime
            metricsService.recordProjectCreation(duration, success)
        }
    }

    @Transactional
    fun updateProject(projectId: UUID, request: UpdateProjectRequest): ProjectResponse {
        val user = getCurrentUser()
        logger.infoWith(
            "Updating project",
            "projectId" to projectId,
            "userId" to user.id,
            "updates" to
                    listOfNotNull(
                        request.name?.let { "name" },
                        request.description?.let { "description" },
                        request.genre?.let { "genre" }
                    )
        )

        val project = projectRepository.findById(projectId).orElseThrow { ProjectNotFoundException(projectId) }
        verifyOwnership(project, user)

        // Update only provided fields
        request.name?.let { project.name = it }
        request.description?.let { project.description = it }
        request.genre?.let { project.genre = it }

        val saved = projectRepository.save(project)
        val count = entityQueryService.countByProject(saved)
        logger.infoWith("Project updated successfully", "projectId" to projectId)

        return ProjectResponse.from(saved, count)
    }

    @Transactional(readOnly = true)
    fun getProjectStats(projectId: UUID): io.mytherion.project.dto.ProjectStatsDTO {
        val user = getCurrentUser()
        logger.debugWith("Fetching project stats", "projectId" to projectId, "userId" to user.id)

        val project = projectRepository.findById(projectId).orElseThrow { ProjectNotFoundException(projectId) }
        verifyOwnership(project, user)

        val startTime = System.currentTimeMillis()

        return logger.measureTime("Calculate project stats") {
            // Use efficient database aggregation instead of loading all entities
            val entityCount = entityQueryService.countByProject(project).toInt()
            val entityCountByType = entityQueryService.countByProjectGrouped(project)

            logger.infoWith(
                "Project stats calculated",
                "projectId" to projectId,
                "entityCount" to entityCount,
                "types" to entityCountByType.keys
            )

            val duration = System.currentTimeMillis() - startTime
            metricsService.recordEntityQuery(projectId, entityCount, duration)

            io.mytherion.project.dto.ProjectStatsDTO.from(project, entityCount, entityCountByType)
        }
    }

    @Transactional
    fun deleteProject(projectId: UUID) {
        val user = getCurrentUser()
        logger.infoWith("Deleting project", "projectId" to projectId, "userId" to user.id)

        val project = projectRepository.findById(projectId).orElseThrow { ProjectNotFoundException(projectId) }
        verifyOwnership(project, user)

        // Check if project has entities before deleting
        val count = entityQueryService.countByProject(project)
        if (count > 0) {
            logger.warnWith(
                "Cannot delete project with entities",
                "projectId" to projectId,
                "entityCount" to count
            )
            throw ProjectHasEntitiesException(projectId, count.toInt())
        }

        projectRepository.delete(project)
        logger.infoWith("Project deleted successfully", "projectId" to projectId)
    }
}
