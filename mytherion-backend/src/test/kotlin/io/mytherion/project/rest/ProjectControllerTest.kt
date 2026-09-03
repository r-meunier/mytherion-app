package io.mytherion.project.rest

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mockk.verify
import io.mytherion.auth.CurrentUserProvider
import io.mytherion.auth.jwt.JwtAuthFilter
import io.mytherion.auth.jwt.JwtService
import io.mytherion.auth.util.CookieUtil
import io.mytherion.monitoring.PerformanceInterceptor
import io.mytherion.project.ProjectTestFixtures
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.project.rest.ProjectAccessInterceptor
import io.mytherion.project.service.ProjectService
import org.junit.jupiter.api.BeforeEach
import java.util.UUID
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.MediaType
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.ObjectMapper

@WebMvcTest(controllers = [ProjectController::class])
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = ["app.security.allowed-origins=http://localhost:3000"])
class ProjectControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockkBean
    private lateinit var projectService: ProjectService

    @MockkBean
    private lateinit var jwtService: JwtService

    @MockkBean
    private lateinit var cookieUtil: CookieUtil

    @MockkBean
    private lateinit var jwtAuthFilter: JwtAuthFilter

    @MockkBean
    private lateinit var projectAccessInterceptor: ProjectAccessInterceptor

    @MockkBean
    private lateinit var performanceInterceptor: PerformanceInterceptor

    @MockkBean
    private lateinit var projectRepository: ProjectRepository

    @MockkBean
    private lateinit var currentUserProvider: CurrentUserProvider

    @BeforeEach
    fun setUpInterceptors() {
        every { projectAccessInterceptor.preHandle(any(), any(), any()) } returns true
        every { projectAccessInterceptor.postHandle(any(), any(), any(), any()) } just runs
        every { projectAccessInterceptor.afterCompletion(any(), any(), any(), any()) } just runs
        
        every { performanceInterceptor.preHandle(any(), any(), any()) } returns true
        every { performanceInterceptor.postHandle(any(), any(), any(), any()) } just runs
        every { performanceInterceptor.afterCompletion(any(), any(), any(), any()) } just runs
    }

    // ==================== List Projects Tests ====================

    @Test
    fun `listProjects should return paginated results`() {
        // Given
        val projects =
            listOf(
                ProjectTestFixtures.createTestProjectResponse(
                    id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                    name = "Project 1"
                ),
                ProjectTestFixtures.createTestProjectResponse(
                    id = UUID.fromString("00000000-0000-0000-0000-000000000002"),
                    name = "Project 2"
                )
            )
        val page = PageImpl(projects, PageRequest.of(0, 10), projects.size.toLong())

        every { projectService.listProjectsForCurrentUser(0, 10, null, null) } returns page

        // When & Then
        mockMvc.perform(get("/api/projects").param("page", "0").param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.content[0].id").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.content[0].name").value("Project 1"))
            .andExpect(jsonPath("$.content[1].id").value("00000000-0000-0000-0000-000000000002"))
            .andExpect(jsonPath("$.content[1].name").value("Project 2"))
            .andExpect(jsonPath("$.content[1].genre").doesNotExist())
            .andExpect(jsonPath("$.totalElements").value(2))
    }

    @Test
    fun `listProjects with default pagination should use default values`() {
        // Given
        val page = PageImpl(emptyList<ProjectResponse>(), PageRequest.of(0, 20), 0)
        every { projectService.listProjectsForCurrentUser(0, 20, null, null) } returns page

        // When & Then
        mockMvc.perform(get("/api/projects"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.content.length()").value(0))
    }

    @Test
    fun `listProjects with search and genre should pass parameters to service`() {
        // Given
        val projects = listOf(ProjectTestFixtures.createTestProjectResponse(id = UUID.fromString("00000000-0000-0000-0000-000000000001"), name = "Sci-Fi Project"))
        val page = PageImpl(projects, PageRequest.of(0, 10), 1L)

        every { projectService.listProjectsForCurrentUser(0, 10, "Sci-Fi", "Sci-Fi") } returns page

        // When & Then
        mockMvc.perform(
            get("/api/projects")
                .param("page", "0")
                .param("size", "10")
                .param("search", "Sci-Fi")
                .param("genre", "Sci-Fi")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].name").value("Sci-Fi Project"))
    }

    @Test
    fun `listProjects with sort parameters should pass them to service`() {
        // Given
        val page = PageImpl(emptyList<ProjectResponse>(), PageRequest.of(0, 10), 0)
        every { projectService.listProjectsForCurrentUser(0, 10, null, null, "name", "asc") } returns page

        // When & Then
        mockMvc.perform(
            get("/api/projects")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "name")
                .param("sortDir", "asc")
        )
            .andExpect(status().isOk)

        verify { projectService.listProjectsForCurrentUser(0, 10, null, null, "name", "asc") }
    }

    // ==================== Get Project by ID Tests ====================

    @Test
    fun `getProjectById when exists should return 200`() {
        // Given
        val projectResponse =
            ProjectTestFixtures.createTestProjectResponse(
                id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                name = "Test Project",
                description = "Test description",
                ownerId = UUID.fromString("00000000-0000-0000-0000-000000000001")
            )
        every { projectService.getProjectById(UUID.fromString("00000000-0000-0000-0000-000000000001")) } returns projectResponse

        // When & Then
        mockMvc.perform(get("/api/projects/00000000-0000-0000-0000-000000000001"))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.name").value("Test Project"))
            .andExpect(jsonPath("$.description").value("Test description"))
            .andExpect(jsonPath("$.ownerId").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.ownerUsername").value("testuser"))
            .andExpect(jsonPath("$.genre").doesNotExist())
    }

    @Test
    fun `getProjectById when not found should return 404`() {
        // Given
        every { projectService.getProjectById(UUID.fromString("00000000-0000-0000-0000-000000000999")) } throws ProjectNotFoundException(UUID.fromString("00000000-0000-0000-0000-000000000999"))

        // When & Then
        mockMvc.perform(get("/api/projects/00000000-0000-0000-0000-000000000999"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").value("Project with id 00000000-0000-0000-0000-000000000999 not found"))
    }

    @Test
    fun `getProjectById when access denied should return 403`() {
        // Given
        every { projectService.getProjectById(UUID.fromString("00000000-0000-0000-0000-000000000002")) } throws ProjectAccessDeniedException(UUID.fromString("00000000-0000-0000-0000-000000000002"))

        // When & Then
        mockMvc.perform(get("/api/projects/00000000-0000-0000-0000-000000000002"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.error").value("Forbidden"))
            .andExpect(
                jsonPath("$.message").value("Access denied to project with id 00000000-0000-0000-0000-000000000002")
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
                id = UUID.fromString("00000000-0000-0000-0000-000000000003"),
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
            .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000003"))
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
                id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                name = "Updated Name",
                description = "Updated description",
                genre = "Sci-Fi"
            )
        every { projectService.updateProject(any(), any()) } returns response

        // When & Then
        mockMvc.perform(
            put("/api/projects/00000000-0000-0000-0000-000000000001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.name").value("Updated Name"))
            .andExpect(jsonPath("$.description").value("Updated description"))
            .andExpect(jsonPath("$.genre").value("Sci-Fi"))
    }

    @Test
    fun `updateProject with partial data should return 200`() {
        // Given
        val request = UpdateProjectRequest(name = "Only Name", description = null)
        val response =
            ProjectTestFixtures.createTestProjectResponse(id = UUID.fromString("00000000-0000-0000-0000-000000000001"), name = "Only Name")
        every { projectService.updateProject(any(), any()) } returns response

        // When & Then
        mockMvc.perform(
            put("/api/projects/00000000-0000-0000-0000-000000000001")
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
            put("/api/projects/00000000-0000-0000-0000-000000000001")
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
                ProjectNotFoundException(UUID.fromString("00000000-0000-0000-0000-000000000999"))

        // When & Then
        mockMvc.perform(
            put("/api/projects/00000000-0000-0000-0000-000000000999")
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
                ProjectAccessDeniedException(UUID.fromString("00000000-0000-0000-0000-000000000002"))

        // When & Then
        mockMvc.perform(
            put("/api/projects/00000000-0000-0000-0000-000000000002")
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
        every { projectService.deleteProject(UUID.fromString("00000000-0000-0000-0000-000000000001")) } just runs

        // When & Then
        mockMvc.perform(delete("/api/projects/00000000-0000-0000-0000-000000000001")).andExpect(status().isNoContent)
    }

    @Test
    fun `deleteProject when not found should return 404`() {
        // Given
        every { projectService.deleteProject(UUID.fromString("00000000-0000-0000-0000-000000000999")) } throws ProjectNotFoundException(UUID.fromString("00000000-0000-0000-0000-000000000999"))

        // When & Then
        mockMvc.perform(delete("/api/projects/00000000-0000-0000-0000-000000000999"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
    }

    @Test
    fun `deleteProject when access denied should return 403`() {
        // Given
        every { projectService.deleteProject(UUID.fromString("00000000-0000-0000-0000-000000000002")) } throws ProjectAccessDeniedException(UUID.fromString("00000000-0000-0000-0000-000000000002"))

        // When & Then
        mockMvc.perform(delete("/api/projects/00000000-0000-0000-0000-000000000002"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("$.status").value(403))
    }
}
