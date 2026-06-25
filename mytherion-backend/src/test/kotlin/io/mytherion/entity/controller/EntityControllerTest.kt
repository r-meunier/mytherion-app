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
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.service.EntityService
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
                id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                projectId = UUID.fromString("00000000-0000-0000-0000-000000000001"),
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
            get("/api/projects/1/entities")
                .param("page", "0")
                .param("size", "20")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].id").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.content[0].name").value("Test Character"))
    }

    @Test
    fun `createEntity should return created entity`() {
        // Given
        val request =
            CreateEntityRequest(
                type = EntityType.CHARACTER,
                name = "New Character",
            )

        val entityDTO =
            EntityDTO(
                id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                projectId = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                type = EntityType.CHARACTER,
                name = "New Character",
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

        every { entityService.createEntity(any(), any()) } returns entityDTO

        // When/Then
        mockMvc.perform(
            post("/api/projects/1/entities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.name").value("New Character"))
    }

    @Test
    fun `getEntity should return entity`() {
        // Given
        val entityDTO =
            EntityDTO(
                id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                projectId = UUID.fromString("00000000-0000-0000-0000-000000000001"),
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

        every { entityService.getEntity(UUID.fromString("00000000-0000-0000-0000-000000000001")) } returns entityDTO

        // When/Then
        mockMvc.perform(get("/api/projects/1/entities/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.name").value("Test Character"))
    }

    @Test
    fun `updateEntity should return updated entity`() {
        // Given
        val request =
            UpdateEntityRequest(name = "Updated Name",)

        val entityDTO =
            EntityDTO(
                id = UUID.fromString("00000000-0000-0000-0000-000000000001"),
                projectId = UUID.fromString("00000000-0000-0000-0000-000000000001"),
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

        every { entityService.updateEntity(any(), any()) } returns entityDTO

        // When/Then
        mockMvc.perform(
            patch("/api/projects/1/entities/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Updated Name"))
    }

    @Test
    fun `deleteEntity should return no content`() {
        // Given
        every { entityService.deleteEntity(UUID.fromString("00000000-0000-0000-0000-000000000001")) } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/projects/1/entities/1")).andExpect(status().isNoContent)
    }

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

        every { entityService.uploadImage(any(), any()) } returns uploadResponse

        // When/Then
        mockMvc.perform(multipart("/api/projects/1/entities/1/image").file(file))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.url").value("test-bucket/entities/1/test.jpg"))
    }

    @Test
    fun `deleteImage should return no content`() {
        // Given
        every { entityService.deleteImage(UUID.fromString("00000000-0000-0000-0000-000000000001")) } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/projects/1/entities/1/image")).andExpect(status().isNoContent)
    }
}
