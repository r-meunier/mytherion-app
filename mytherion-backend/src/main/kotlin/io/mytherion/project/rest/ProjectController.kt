package io.mytherion.project.rest

import io.mytherion.logging.errorWith
import io.mytherion.logging.infoWith
import io.mytherion.logging.logger
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.service.ProjectService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects")
class ProjectController(private val projectService: ProjectService) {
        private val logger = logger()

        @GetMapping
        fun listProjects(
                @RequestParam(defaultValue = "0") page: Int,
                @RequestParam(defaultValue = "20") size: Int
        ): Page<ProjectResponse> {
                logger.infoWith("List projects request", "page" to page, "size" to size)
                return try {
                        projectService.listProjectsForCurrentUser(page, size)
                } catch (e: Exception) {
                        logger.errorWith(
                                "Failed to list projects",
                                e,
                                "page" to page,
                                "size" to size
                        )
                        throw e
                }
        }

        @GetMapping("/{id}")
        fun getProjectById(@PathVariable id: Long): ProjectResponse {
                logger.infoWith("Get project request", "projectId" to id)
                return try {
                        projectService.getProjectById(id)
                } catch (e: Exception) {
                        logger.errorWith("Failed to get project", e, "projectId" to id)
                        throw e
                }
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        fun createProject(@RequestBody @Valid request: CreateProjectRequest): ProjectResponse {
                logger.infoWith("Create project request", "name" to request.name)
                return try {
                        projectService.createProject(request)
                } catch (e: Exception) {
                        logger.errorWith("Failed to create project", e, "name" to request.name)
                        throw e
                }
        }

        @PutMapping("/{id}")
        fun updateProject(
                @PathVariable id: Long,
                @RequestBody @Valid request: UpdateProjectRequest
        ): ProjectResponse {
                logger.infoWith("Update project request", "projectId" to id)
                return try {
                        projectService.updateProject(id, request)
                } catch (e: Exception) {
                        logger.errorWith("Failed to update project", e, "projectId" to id)
                        throw e
                }
        }

        @GetMapping("/{id}/stats")
        fun getProjectStats(@PathVariable id: Long): io.mytherion.project.dto.ProjectStatsDTO {
                logger.infoWith("Get project stats request", "projectId" to id)
                return try {
                        projectService.getProjectStats(id)
                } catch (e: Exception) {
                        logger.errorWith("Failed to get project stats", e, "projectId" to id)
                        throw e
                }
        }

        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        fun deleteProject(@PathVariable id: Long) {
                logger.infoWith("Delete project request", "projectId" to id)
                try {
                        projectService.deleteProject(id)
                } catch (e: Exception) {
                        logger.errorWith("Failed to delete project", e, "projectId" to id)
                        throw e
                }
        }
}
