package io.mytherion.project.service

import io.mytherion.entity.repository.EntityRepository
import io.mytherion.logging.debugWith
import io.mytherion.logging.infoWith
import io.mytherion.logging.logger
import io.mytherion.logging.measureTime
import io.mytherion.logging.warnWith
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.monitoring.MetricsService
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
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProjectService(
        private val projectRepository: ProjectRepository,
        private val userRepository: UserRepository,
        private val entityRepository: EntityRepository,
        private val metricsService: MetricsService
) {
    private val logger = logger()

    // TEMP: hard-coded user until auth is in place
    private fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || !authentication.isAuthenticated) {
             throw IllegalStateException("No authenticated user found")
        }
        val userId = authentication.principal as? Long
            ?: throw IllegalStateException("Principal is not a valid User ID")
            
        return userRepository.findById(userId).orElseThrow {
            IllegalStateException("User with id=$userId not found")
        }
    }

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

    @Transactional(readOnly = true)
    fun listProjectsForCurrentUser(page: Int = 0, size: Int = 20): Page<ProjectResponse> {
        val user = getCurrentUser()
        logger.debugWith("Listing projects", "userId" to user.id, "page" to page, "size" to size)

        return logger.measureTime("Fetch projects") {
            val pageable: Pageable =
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            val result = projectRepository.findAllByOwner(user, pageable).map(ProjectResponse::from)

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
    fun getProjectById(id: Long): ProjectResponse {
        val user = getCurrentUser()
        logger.debugWith("Fetching project", "projectId" to id, "userId" to user.id)

        val project =
                projectRepository.findById(id).orElseThrow {
                    logger.warnWith("Project not found", "projectId" to id)
                    ProjectNotFoundException(id)
                }
        verifyOwnership(project, user)

        logger.infoWith("Project fetched", "projectId" to id, "name" to project.name)
        return ProjectResponse.from(project)
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
                ProjectResponse.from(saved)
            }
        } finally {
            val duration = System.currentTimeMillis() - startTime
            metricsService.recordProjectCreation(duration, success)
        }
    }

    @Transactional
    fun updateProject(id: Long, request: UpdateProjectRequest): ProjectResponse {
        val user = getCurrentUser()
        logger.infoWith(
                "Updating project",
                "projectId" to id,
                "userId" to user.id,
                "updates" to
                        listOfNotNull(
                                request.name?.let { "name" },
                                request.description?.let { "description" },
                                request.genre?.let { "genre" }
                        )
        )

        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)

        // Update only provided fields
        request.name?.let { project.name = it }
        request.description?.let { project.description = it }
        request.genre?.let { project.genre = it }

        val saved = projectRepository.save(project)
        logger.infoWith("Project updated successfully", "projectId" to id)

        return ProjectResponse.from(saved)
    }

    @Transactional(readOnly = true)
    fun getProjectStats(id: Long): io.mytherion.project.dto.ProjectStatsDTO {
        val user = getCurrentUser()
        logger.debugWith("Fetching project stats", "projectId" to id, "userId" to user.id)

        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)

        val startTime = System.currentTimeMillis()

        return logger.measureTime("Calculate project stats") {
            // Use efficient database aggregation instead of loading all entities
            val entityCount = entityRepository.countByProjectAndDeletedAtIsNull(project).toInt()
            val entityCountByType =
                    entityRepository.countByProjectAndTypeGrouped(project).associate {
                        it.getType().name to it.getCount().toInt()
                    }

            logger.infoWith(
                    "Project stats calculated",
                    "projectId" to id,
                    "entityCount" to entityCount,
                    "types" to entityCountByType.keys
            )

            val duration = System.currentTimeMillis() - startTime
            metricsService.recordEntityQuery(id, entityCount, duration)

            io.mytherion.project.dto.ProjectStatsDTO.from(project, entityCount, entityCountByType)
        }
    }

    @Transactional
    fun deleteProject(id: Long) {
        val user = getCurrentUser()
        logger.infoWith("Deleting project", "projectId" to id, "userId" to user.id)

        val project = projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        verifyOwnership(project, user)

        // Check if project has entities before deleting
        val entityCount = entityRepository.countByProjectAndDeletedAtIsNull(project).toInt()
        if (entityCount > 0) {
            logger.warnWith(
                    "Cannot delete project with entities",
                    "projectId" to id,
                    "entityCount" to entityCount
            )
            throw ProjectHasEntitiesException(id, entityCount)
        }

        projectRepository.delete(project)
        logger.infoWith("Project deleted successfully", "projectId" to id)
    }
}
