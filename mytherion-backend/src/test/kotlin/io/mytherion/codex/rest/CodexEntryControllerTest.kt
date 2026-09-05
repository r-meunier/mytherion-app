package io.mytherion.codex.rest

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mytherion.auth.jwt.JwtAuthFilter
import io.mytherion.auth.jwt.JwtService
import io.mytherion.auth.util.CookieUtil
import io.mytherion.codex.dto.CreateEntryRequest
import io.mytherion.codex.dto.EntryDTO
import io.mytherion.codex.dto.UpdateEntryRequest
import io.mytherion.codex.exception.EntryNotFoundException
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.service.CodexEntryService
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.platform.storage.dto.UploadResponse
import java.time.Instant
import java.util.UUID
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.data.domain.PageImpl
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import tools.jackson.databind.ObjectMapper

@WebMvcTest(CodexEntryController::class)
@AutoConfigureMockMvc(addFilters = false)
@org.springframework.test.context.TestPropertySource(properties = ["app.security.allowed-origins=http://localhost:3000"])
class CodexEntryControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockkBean
    private lateinit var entryService: CodexEntryService

    @MockkBean
    private lateinit var jwtService: JwtService

    @MockkBean
    private lateinit var cookieUtil: CookieUtil

    @MockkBean
    private lateinit var jwtAuthFilter: JwtAuthFilter

    @MockkBean
    private lateinit var projectAccessInterceptor: io.mytherion.project.security.ProjectAccessInterceptor

    @MockkBean
    private lateinit var performanceInterceptor: io.mytherion.platform.monitoring.PerformanceInterceptor

    @MockkBean
    private lateinit var projectRepository: io.mytherion.project.repository.ProjectRepository

    @MockkBean
    private lateinit var currentUserProvider: io.mytherion.auth.service.CurrentUserProvider

    private val projectId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val entryId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @org.junit.jupiter.api.BeforeEach
    fun setUpInterceptors() {
        every { projectAccessInterceptor.preHandle(any(), any(), any()) } returns true
        every { projectAccessInterceptor.postHandle(any(), any(), any(), any()) } just runs
        every { projectAccessInterceptor.afterCompletion(any(), any(), any(), any()) } just runs
        
        every { performanceInterceptor.preHandle(any(), any(), any()) } returns true
        every { performanceInterceptor.postHandle(any(), any(), any(), any()) } just runs
        every { performanceInterceptor.afterCompletion(any(), any(), any(), any()) } just runs
    }

    @Test
    fun `listEntries should return paginated entries`() {
        // Given
        val entryDTO =
            EntryDTO(
                id = entryId,
                projectId = projectId,
                type = EntryType.CHARACTER,
                name = "Test Character",
                description = "Test description",
                notes = null,
                tags = listOf("hero", "mage"),
                thumbnail = null,
                content = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        val page = PageImpl(listOf(entryDTO))
        every { entryService.searchEntries(any(), any()) } returns page

        // When/Then
        mockMvc.perform(
            get("/api/projects/$projectId/entries")
                .param("page", "0")
                .param("size", "20")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.content[0].id").value(entryId.toString()))
            .andExpect(jsonPath("$.content[0].name").value("Test Character"))
    }

    @Test
    fun `listEntries with filters should pass filters to service`() {
        // Given
        val entryDTO =
            EntryDTO(
                id = entryId,
                projectId = projectId,
                type = EntryType.CHARACTER,
                name = "Test Character",
                description = "Test description",
                notes = null,
                tags = listOf("hero"),
                thumbnail = null,
                content = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        val page = PageImpl(listOf(entryDTO))
        every { entryService.searchEntries(any(), any()) } returns page

        // When/Then
        mockMvc.perform(
            get("/api/projects/$projectId/entries")
                .param("type", "CHARACTER")
                .param("tags", "hero,mage")
                .param("search", "test")
                .param("page", "0")
                .param("size", "20")
        )
            .andExpect(status().isOk)
    }

        @Test
    fun `createEntry should return created entry`() {
        // Given
        val request =
            CreateEntryRequest(
                type = EntryType.CHARACTER,
                name = "New Character",
                description = "Detailed description",
                tags = listOf("hero")
            )

        val entryDTO =
            EntryDTO(
                id = entryId,
                projectId = projectId,
                type = EntryType.CHARACTER,
                name = "New Character",
                description = "Detailed description",
                notes = null,
                tags = listOf("hero"),
                thumbnail = null,
                content = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        every { entryService.createEntry(any(), any()) } returns entryDTO

        // When/Then
        mockMvc.perform(
            post("/api/projects/$projectId/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(entryId.toString()))
            .andExpect(jsonPath("$.name").value("New Character"))
    }

    // ==================== Get CodexEntry Tests ====================

    @Test
    fun `getEntry should return entry`() {
        // Given
        val entryDTO =
            EntryDTO(
                id = entryId,
                projectId = projectId,
                type = EntryType.CHARACTER,
                name = "Test Character",
                description = "Test description",
                notes = null,
                tags = listOf("hero"),
                thumbnail = null,
                content = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        every { entryService.getEntry(projectId, entryId) } returns entryDTO

        // When/Then
        mockMvc.perform(get("/api/projects/$projectId/entries/$entryId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(entryId.toString()))
            .andExpect(jsonPath("$.name").value("Test Character"))
    }

    @Test
    fun `getEntry should return 404 when entry not found or does not belong to project`() {
        // Given
        every { entryService.getEntry(projectId, entryId) } throws EntryNotFoundException(entryId)

        // When/Then
        mockMvc.perform(get("/api/projects/$projectId/entries/$entryId"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("Not Found"))
    }

    @Test
    fun `getEntry should return 403 when user lacks project access`() {
        // Given
        every { entryService.getEntry(projectId, entryId) } throws ProjectAccessDeniedException(projectId)

        // When/Then
        mockMvc.perform(get("/api/projects/$projectId/entries/$entryId"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("$.error").value("Forbidden"))
    }

    // ==================== Update CodexEntry Tests ====================

    @Test
    fun `updateEntry should return updated entry`() {
        // Given
        val request = UpdateEntryRequest(name = "Updated Name")

        val entryDTO =
            EntryDTO(
                id = entryId,
                projectId = projectId,
                type = EntryType.CHARACTER,
                name = "Updated Name",
                description = null,
                notes = null,
                tags = null,
                thumbnail = null,
                content = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        every { entryService.updateEntry(projectId, entryId, any()) } returns entryDTO

        // When/Then
        mockMvc.perform(
            patch("/api/projects/$projectId/entries/$entryId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Updated Name"))
    }

    @Test
    fun `updateEntry should return 404 when entry does not belong to project`() {
        // Given
        val request = UpdateEntryRequest(name = "Updated Name")
        every { entryService.updateEntry(projectId, entryId, any()) } throws EntryNotFoundException(entryId)

        // When/Then
        mockMvc.perform(
            patch("/api/projects/$projectId/entries/$entryId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    // ==================== Delete CodexEntry Tests ====================

    @Test
    fun `deleteEntry should return no content`() {
        // Given
        every { entryService.deleteEntry(projectId, entryId) } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entries/$entryId"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `deleteEntry should return 404 when entry does not belong to project`() {
        // Given
        every { entryService.deleteEntry(projectId, entryId) } throws EntryNotFoundException(entryId)

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entries/$entryId"))
            .andExpect(status().isNotFound)
    }

    // ==================== Image Tests ====================

    @Test
    fun `uploadThumbnail should return upload response`() {
        // Given
        val file =
            MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".toByteArray()
            )

        val uploadResponse =
            UploadResponse(
                url = "test-bucket/entries/1/test.jpg",
                objectKey = "entries/1/test.jpg",
                bucketName = "test-bucket",
                contentType = "image/jpeg",
                size = file.size
            )

        every { entryService.uploadThumbnail(projectId, entryId, any()) } returns uploadResponse

        // When/Then
        mockMvc.perform(multipart("/api/projects/$projectId/entries/$entryId/thumbnail").file(file))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.url").value("test-bucket/entries/1/test.jpg"))
    }

    @Test
    fun `uploadThumbnail should return 404 when entry does not belong to project`() {
        // Given
        val file = MockMultipartFile("file", "test.jpg", "image/jpeg", "test image content".toByteArray())
        every { entryService.uploadThumbnail(projectId, entryId, any()) } throws EntryNotFoundException(entryId)

        // When/Then
        mockMvc.perform(multipart("/api/projects/$projectId/entries/$entryId/thumbnail").file(file))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `deleteThumbnail should return no content`() {
        // Given
        every { entryService.deleteThumbnail(projectId, entryId) } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entries/$entryId/thumbnail"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `deleteThumbnail should return 404 when entry does not belong to project`() {
        // Given
        every { entryService.deleteThumbnail(projectId, entryId) } throws EntryNotFoundException(entryId)

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entries/$entryId/thumbnail"))
            .andExpect(status().isNotFound)
    }
}
