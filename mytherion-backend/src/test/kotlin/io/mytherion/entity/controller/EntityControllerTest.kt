package io.mytherion.entity.controller

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mytherion.auth.jwt.JwtAuthFilter
import io.mytherion.auth.jwt.JwtService
import io.mytherion.auth.util.CookieUtil
import io.mytherion.entity.dto.CreateEntityRequest
import io.mytherion.entity.dto.EntityDTO
import io.mytherion.entity.dto.UpdateEntityRequest
import io.mytherion.entity.exception.EntityNotFoundException
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.service.EntityService
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.storage.dto.UploadResponse
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

@WebMvcTest(EntityController::class)
@AutoConfigureMockMvc(addFilters = false)
@org.springframework.test.context.TestPropertySource(properties = ["app.security.allowed-origins=http://localhost:3000"])
class EntityControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockkBean
    private lateinit var entityService: EntityService

    @MockkBean
    private lateinit var jwtService: JwtService

    @MockkBean
    private lateinit var cookieUtil: CookieUtil

    @MockkBean
    private lateinit var jwtAuthFilter: JwtAuthFilter

    @MockkBean
    private lateinit var projectAccessInterceptor: io.mytherion.project.rest.ProjectAccessInterceptor

    @MockkBean
    private lateinit var performanceInterceptor: io.mytherion.monitoring.PerformanceInterceptor

    @MockkBean
    private lateinit var projectRepository: io.mytherion.project.repository.ProjectRepository

    @MockkBean
    private lateinit var currentUserProvider: io.mytherion.auth.CurrentUserProvider

    private val projectId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val entityId = UUID.fromString("00000000-0000-0000-0000-000000000001")

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
    fun `listEntities should return paginated entities`() {
        // Given
        val entityDTO =
            EntityDTO(
                id = entityId,
                projectId = projectId,
                type = EntityType.CHARACTER,
                name = "Test Character",
                categoryId = null,
                description = "Test description",
                notes = null,
                tags = listOf("hero", "mage"),
                thumbnail = null,
                metadata = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        val page = PageImpl(listOf(entityDTO))
        every { entityService.searchEntities(any(), any()) } returns page

        // When/Then
        mockMvc.perform(
            get("/api/projects/$projectId/entities")
                .param("page", "0")
                .param("size", "20")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.content[0].id").value(entityId.toString()))
            .andExpect(jsonPath("$.content[0].name").value("Test Character"))
    }

    @Test
    fun `listEntities with filters should pass filters to service`() {
        // Given
        val entityDTO =
            EntityDTO(
                id = entityId,
                projectId = projectId,
                type = EntityType.CHARACTER,
                name = "Test Character",
                categoryId = null,
                description = "Test description",
                notes = null,
                tags = listOf("hero"),
                thumbnail = null,
                metadata = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        val page = PageImpl(listOf(entityDTO))
        every { entityService.searchEntities(any(), any()) } returns page

        // When/Then
        mockMvc.perform(
            get("/api/projects/$projectId/entities")
                .param("type", "CHARACTER")
                .param("tags", "hero,mage")
                .param("search", "test")
                .param("page", "0")
                .param("size", "20")
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `createEntity should return created entity`() {
        // Given
        val request =
            CreateEntityRequest(
                type = EntityType.CHARACTER,
                name = "New Character",
                description = "Detailed description",
                tags = listOf("hero")
            )

        val entityDTO =
            EntityDTO(
                id = entityId,
                projectId = projectId,
                type = EntityType.CHARACTER,
                name = "New Character",
                categoryId = null,
                description = "Detailed description",
                notes = null,
                tags = listOf("hero"),
                thumbnail = null,
                metadata = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        every { entityService.createEntity(any(), any()) } returns entityDTO

        // When/Then
        mockMvc.perform(
            post("/api/projects/$projectId/entities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(entityId.toString()))
            .andExpect(jsonPath("$.name").value("New Character"))
    }

    // ==================== Get Entity Tests ====================

    @Test
    fun `getEntity should return entity`() {
        // Given
        val entityDTO =
            EntityDTO(
                id = entityId,
                projectId = projectId,
                type = EntityType.CHARACTER,
                name = "Test Character",
                categoryId = null,
                description = "Test description",
                notes = null,
                tags = listOf("hero"),
                thumbnail = null,
                metadata = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        every { entityService.getEntity(projectId, entityId) } returns entityDTO

        // When/Then
        mockMvc.perform(get("/api/projects/$projectId/entities/$entityId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(entityId.toString()))
            .andExpect(jsonPath("$.name").value("Test Character"))
    }

    @Test
    fun `getEntity should return 404 when entity not found or does not belong to project`() {
        // Given
        every { entityService.getEntity(projectId, entityId) } throws EntityNotFoundException(entityId)

        // When/Then
        mockMvc.perform(get("/api/projects/$projectId/entities/$entityId"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("Not Found"))
    }

    @Test
    fun `getEntity should return 403 when user lacks project access`() {
        // Given
        every { entityService.getEntity(projectId, entityId) } throws ProjectAccessDeniedException(projectId)

        // When/Then
        mockMvc.perform(get("/api/projects/$projectId/entities/$entityId"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("$.error").value("Forbidden"))
    }

    // ==================== Update Entity Tests ====================

    @Test
    fun `updateEntity should return updated entity`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name")

        val entityDTO =
            EntityDTO(
                id = entityId,
                projectId = projectId,
                type = EntityType.CHARACTER,
                name = "Updated Name",
                categoryId = null,
                description = null,
                notes = null,
                tags = null,
                thumbnail = null,
                metadata = null,
                version = 0L,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

        every { entityService.updateEntity(projectId, entityId, any()) } returns entityDTO

        // When/Then
        mockMvc.perform(
            patch("/api/projects/$projectId/entities/$entityId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Updated Name"))
    }

    @Test
    fun `updateEntity should return 404 when entity does not belong to project`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name")
        every { entityService.updateEntity(projectId, entityId, any()) } throws EntityNotFoundException(entityId)

        // When/Then
        mockMvc.perform(
            patch("/api/projects/$projectId/entities/$entityId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    // ==================== Delete Entity Tests ====================

    @Test
    fun `deleteEntity should return no content`() {
        // Given
        every { entityService.deleteEntity(projectId, entityId) } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entities/$entityId"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `deleteEntity should return 404 when entity does not belong to project`() {
        // Given
        every { entityService.deleteEntity(projectId, entityId) } throws EntityNotFoundException(entityId)

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entities/$entityId"))
            .andExpect(status().isNotFound)
    }

    // ==================== Image Tests ====================

    @Test
    fun `uploadImage should return upload response`() {
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
                url = "test-bucket/entities/1/test.jpg",
                objectKey = "entities/1/test.jpg",
                bucketName = "test-bucket",
                contentType = "image/jpeg",
                size = file.size
            )

        every { entityService.uploadImage(projectId, entityId, any()) } returns uploadResponse

        // When/Then
        mockMvc.perform(multipart("/api/projects/$projectId/entities/$entityId/image").file(file))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.url").value("test-bucket/entities/1/test.jpg"))
    }

    @Test
    fun `uploadImage should return 404 when entity does not belong to project`() {
        // Given
        val file = MockMultipartFile("file", "test.jpg", "image/jpeg", "test image content".toByteArray())
        every { entityService.uploadImage(projectId, entityId, any()) } throws EntityNotFoundException(entityId)

        // When/Then
        mockMvc.perform(multipart("/api/projects/$projectId/entities/$entityId/image").file(file))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `deleteImage should return no content`() {
        // Given
        every { entityService.deleteImage(projectId, entityId) } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entities/$entityId/image"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `deleteImage should return 404 when entity does not belong to project`() {
        // Given
        every { entityService.deleteImage(projectId, entityId) } throws EntityNotFoundException(entityId)

        // When/Then
        mockMvc.perform(delete("/api/projects/$projectId/entities/$entityId/image"))
            .andExpect(status().isNotFound)
    }
}
