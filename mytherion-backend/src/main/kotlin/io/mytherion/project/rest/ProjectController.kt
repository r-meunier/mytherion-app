package io.mytherion.project.rest

import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.service.ProjectService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects")
class ProjectController(
    private val projectService: ProjectService
) {

    @GetMapping
    fun listProjects(): List<ProjectResponse> =
        projectService.listProjectsForCurrentUser()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createProject(@RequestBody @Valid request: CreateProjectRequest): ProjectResponse =
        projectService.createProject(request)
}
