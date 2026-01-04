package io.mytherion.project.rest

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

    @GetMapping
    fun listProjects(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "20") size: Int
    ): Page<ProjectResponse> = projectService.listProjectsForCurrentUser(page, size)

    @GetMapping("/{id}")
    fun getProjectById(@PathVariable id: Long): ProjectResponse = projectService.getProjectById(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createProject(@RequestBody @Valid request: CreateProjectRequest): ProjectResponse =
            projectService.createProject(request)

    @PutMapping("/{id}")
    fun updateProject(
            @PathVariable id: Long,
            @RequestBody @Valid request: UpdateProjectRequest
    ): ProjectResponse = projectService.updateProject(id, request)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteProject(@PathVariable id: Long) = projectService.deleteProject(id)
}
