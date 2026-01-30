package io.mytherion.project.rest

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mytherion.auth.jwt.JwtService
import io.mytherion.auth.util.CookieUtil
import io.mytherion.project.ProjectTestFixtures
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.service.ProjectService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import tools.jackson.databind.ObjectMapper

@WebMvcTest(controllers = [ProjectController::class])
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

        @Autowired private lateinit var mockMvc: MockMvc

        @Autowired private lateinit var objectMapper: ObjectMapper

        @MockkBean private lateinit var projectService: ProjectService

        @MockkBean private lateinit var jwtService: JwtService

        @MockkBean private lateinit var cookieUtil: CookieUtil

        // ==================== List Projects Tests ====================

        @Test
        fun `listProjects should return paginated results`() {
                // Given
                val projects =
                        listOf(
                                ProjectTestFixtures.createTestProjectResponse(
                                        id = 1L,
                                        name = "Project 1"
                                ),
                                ProjectTestFixtures.createTestProjectResponse(
                                        id = 2L,
                                        name = "Project 2"
                                )
                        )
                val page = PageImpl(projects, PageRequest.of(0, 10), projects.size.toLong())

                every { projectService.listProjectsForCurrentUser(0, 10) } returns page

                // When & Then
                mockMvc.perform(get("/api/projects").param("page", "0").param("size", "10"))
                        .andExpect(status().isOk)
                        .andExpect(jsonPath("$.content").isArray)
                        .andExpect(jsonPath("$.content.length()").value(2))
                        .andExpect(jsonPath("$.content[0].id").value(1))
                        .andExpect(jsonPath("$.content[0].name").value("Project 1"))
                        .andExpect(jsonPath("$.content[1].id").value(2))
                        .andExpect(jsonPath("$.content[1].name").value("Project 2"))
                        .andExpect(jsonPath("$.content[1].genre").doesNotExist())
                        .andExpect(jsonPath("$.totalElements").value(2))
        }

        @Test
        fun `listProjects with default pagination should use default values`() {
                // Given
                val page = PageImpl(emptyList<ProjectResponse>(), PageRequest.of(0, 20), 0)
                every { projectService.listProjectsForCurrentUser(0, 20) } returns page

                // When & Then
                mockMvc.perform(get("/api/projects"))
                        .andExpect(status().isOk)
                        .andExpect(jsonPath("$.content").isArray)
                        .andExpect(jsonPath("$.content.length()").value(0))
        }

        // ==================== Get Project by ID Tests ====================

        @Test
        fun `getProjectById when exists should return 200`() {
                // Given
                val projectResponse =
                        ProjectTestFixtures.createTestProjectResponse(
                                id = 1L,
                                name = "Test Project",
                                description = "Test description"
                        )
                every { projectService.getProjectById(1L) } returns projectResponse

                // When & Then
                mockMvc.perform(get("/api/projects/1"))
                        .andExpect(status().isOk)
                        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                        .andExpect(jsonPath("$.id").value(1))
                        .andExpect(jsonPath("$.name").value("Test Project"))
                        .andExpect(jsonPath("$.description").value("Test description"))
                        .andExpect(jsonPath("$.ownerId").value(1))
                        .andExpect(jsonPath("$.ownerUsername").value("testuser"))
                        .andExpect(jsonPath("$.genre").doesNotExist())
        }

        @Test
        fun `getProjectById when not found should return 404`() {
                // Given
                every { projectService.getProjectById(999L) } throws ProjectNotFoundException(999L)

                // When & Then
                mockMvc.perform(get("/api/projects/999"))
                        .andExpect(status().isNotFound)
                        .andExpect(jsonPath("$.status").value(404))
                        .andExpect(jsonPath("$.error").value("Not Found"))
                        .andExpect(jsonPath("$.message").value("Project with id 999 not found"))
        }

        @Test
        fun `getProjectById when access denied should return 403`() {
                // Given
                every { projectService.getProjectById(2L) } throws ProjectAccessDeniedException(2L)

                // When & Then
                mockMvc.perform(get("/api/projects/2"))
                        .andExpect(status().isForbidden)
                        .andExpect(jsonPath("$.status").value(403))
                        .andExpect(jsonPath("$.error").value("Forbidden"))
                        .andExpect(
                                jsonPath("$.message").value("Access denied to project with id 2")
                        )
        }

        // ==================== Create Project Tests ====================

        @Test
        fun `createProject when valid should return 201`() {
                // Given
                val request =
                        CreateProjectRequest(name = "New Project", description = "New description")
                val response =
                        ProjectTestFixtures.createTestProjectResponse(
                                id = 3L,
                                name = "New Project",
                                description = "New description"
                        )
                every { projectService.createProject(any()) } returns response

                // When & Then
                mockMvc.perform(
                                post("/api/projects")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isCreated)
                        .andExpect(jsonPath("$.id").value(3))
                        .andExpect(jsonPath("$.name").value("New Project"))
                        .andExpect(jsonPath("$.description").value("New description"))
        }

        @Test
        fun `createProject when name is blank should return 400`() {
                // Given
                val request = CreateProjectRequest(name = "", description = "Description")

                // When & Then
                mockMvc.perform(
                                post("/api/projects")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isBadRequest)
                        .andExpect(jsonPath("$.status").value(400))
                        .andExpect(jsonPath("$.error").value("Validation Failed"))
        }

        @Test
        fun `createProject when name is too long should return 400`() {
                // Given
                val longName = "a".repeat(256)
                val request = CreateProjectRequest(name = longName, description = "Description")

                // When & Then
                mockMvc.perform(
                                post("/api/projects")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isBadRequest)
                        .andExpect(jsonPath("$.status").value(400))
        }

        @Test
        fun `createProject when description is too long should return 400`() {
                // Given
                val longDescription = "a".repeat(5001)
                val request =
                        CreateProjectRequest(name = "Valid Name", description = longDescription)

                // When & Then
                mockMvc.perform(
                                post("/api/projects")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isBadRequest)
                        .andExpect(jsonPath("$.status").value(400))
        }

        // ==================== Update Project Tests ====================

        @Test
        fun `updateProject when valid should return 200`() {
                // Given
                val request =
                        UpdateProjectRequest(
                                name = "Updated Name",
                                description = "Updated description",
                                genre = "Sci-Fi"
                        )
                val response =
                        ProjectTestFixtures.createTestProjectResponse(
                                id = 1L,
                                name = "Updated Name",
                                description = "Updated description",
                                genre = "Sci-Fi"
                        )
                every { projectService.updateProject(any(), any()) } returns response

                // When & Then
                mockMvc.perform(
                                put("/api/projects/1")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isOk)
                        .andExpect(jsonPath("$.id").value(1))
                        .andExpect(jsonPath("$.name").value("Updated Name"))
                        .andExpect(jsonPath("$.description").value("Updated description"))
                        .andExpect(jsonPath("$.genre").value("Sci-Fi"))
        }

        @Test
        fun `updateProject with partial data should return 200`() {
                // Given
                val request = UpdateProjectRequest(name = "Only Name", description = null)
                val response =
                        ProjectTestFixtures.createTestProjectResponse(id = 1L, name = "Only Name")
                every { projectService.updateProject(any(), any()) } returns response

                // When & Then
                mockMvc.perform(
                                put("/api/projects/1")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isOk)
                        .andExpect(jsonPath("$.name").value("Only Name"))
        }

        @Test
        fun `updateProject when name is too long should return 400`() {
                // Given
                val longName = "a".repeat(256)
                val request = UpdateProjectRequest(name = longName, description = null)

                // When & Then
                mockMvc.perform(
                                put("/api/projects/1")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isBadRequest)
        }

        @Test
        fun `updateProject when not found should return 404`() {
                // Given
                val request = UpdateProjectRequest(name = "Updated Name")
                every { projectService.updateProject(any(), any()) } throws
                        ProjectNotFoundException(999L)

                // When & Then
                mockMvc.perform(
                                put("/api/projects/999")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isNotFound)
                        .andExpect(jsonPath("$.status").value(404))
        }

        @Test
        fun `updateProject when access denied should return 403`() {
                // Given
                val request = UpdateProjectRequest(name = "Hacked Name")
                every { projectService.updateProject(any(), any()) } throws
                        ProjectAccessDeniedException(2L)

                // When & Then
                mockMvc.perform(
                                put("/api/projects/2")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isForbidden)
                        .andExpect(jsonPath("$.status").value(403))
        }

        // ==================== Delete Project Tests ====================

        @Test
        fun `deleteProject when valid should return 204`() {
                // Given
                every { projectService.deleteProject(1L) } just runs

                // When & Then
                mockMvc.perform(delete("/api/projects/1")).andExpect(status().isNoContent)
        }

        @Test
        fun `deleteProject when not found should return 404`() {
                // Given
                every { projectService.deleteProject(999L) } throws ProjectNotFoundException(999L)

                // When & Then
                mockMvc.perform(delete("/api/projects/999"))
                        .andExpect(status().isNotFound)
                        .andExpect(jsonPath("$.status").value(404))
        }

        @Test
        fun `deleteProject when access denied should return 403`() {
                // Given
                every { projectService.deleteProject(2L) } throws ProjectAccessDeniedException(2L)

                // When & Then
                mockMvc.perform(delete("/api/projects/2"))
                        .andExpect(status().isForbidden)
                        .andExpect(jsonPath("$.status").value(403))
        }
}
