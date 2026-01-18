package io.mytherion.entity.controller

import com.fasterxml.jackson.databind.ObjectMapper
import io.mytherion.entity.dto.CreateEntityRequest
import io.mytherion.entity.dto.EntityDTO
import io.mytherion.entity.dto.UpdateEntityRequest
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.service.EntityService
import io.mytherion.storage.dto.UploadResponse
import java.time.Instant
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.data.domain.PageImpl
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(EntityController::class)
class EntityControllerTest {

    @Autowired private lateinit var mockMvc: MockMvc

    @Autowired private lateinit var objectMapper: ObjectMapper

    @MockBean private lateinit var entityService: EntityService

    @Test
    fun `listEntities should return paginated entities`() {
        // Given
        val entityDTO =
                EntityDTO(
                        id = 1L,
                        projectId = 1L,
                        type = EntityType.CHARACTER,
                        name = "Test Character",
                        summary = "Test summary",
                        description = "Test description",
                        tags = listOf("hero", "mage"),
                        imageUrl = null,
                        metadata = null,
                        createdAt = Instant.now(),
                        updatedAt = Instant.now()
                )

        val page = PageImpl(listOf(entityDTO))
        whenever(entityService.searchEntities(any(), any())).thenReturn(page)

        // When/Then
        mockMvc.perform(get("/api/projects/1/entities").param("page", "0").param("size", "20"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Test Character"))
    }

    @Test
    fun `createEntity should return created entity`() {
        // Given
        val request =
                CreateEntityRequest(
                        type = EntityType.CHARACTER,
                        name = "New Character",
                        summary = "A new character"
                )

        val entityDTO =
                EntityDTO(
                        id = 1L,
                        projectId = 1L,
                        type = EntityType.CHARACTER,
                        name = "New Character",
                        summary = "A new character",
                        description = null,
                        tags = null,
                        imageUrl = null,
                        metadata = null,
                        createdAt = Instant.now(),
                        updatedAt = Instant.now()
                )

        whenever(entityService.createEntity(any(), any())).thenReturn(entityDTO)

        // When/Then
        mockMvc.perform(
                        post("/api/projects/1/entities")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("New Character"))
    }

    @Test
    fun `getEntity should return entity`() {
        // Given
        val entityDTO =
                EntityDTO(
                        id = 1L,
                        projectId = 1L,
                        type = EntityType.CHARACTER,
                        name = "Test Character",
                        summary = "Test summary",
                        description = "Test description",
                        tags = listOf("hero"),
                        imageUrl = null,
                        metadata = null,
                        createdAt = Instant.now(),
                        updatedAt = Instant.now()
                )

        whenever(entityService.getEntity(1L)).thenReturn(entityDTO)

        // When/Then
        mockMvc.perform(get("/api/entities/1"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Character"))
    }

    @Test
    fun `updateEntity should return updated entity`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name", summary = "Updated summary")

        val entityDTO =
                EntityDTO(
                        id = 1L,
                        projectId = 1L,
                        type = EntityType.CHARACTER,
                        name = "Updated Name",
                        summary = "Updated summary",
                        description = null,
                        tags = null,
                        imageUrl = null,
                        metadata = null,
                        createdAt = Instant.now(),
                        updatedAt = Instant.now()
                )

        whenever(entityService.updateEntity(any(), any())).thenReturn(entityDTO)

        // When/Then
        mockMvc.perform(
                        patch("/api/entities/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.name").value("Updated Name"))
    }

    @Test
    fun `deleteEntity should return no content`() {
        // When/Then
        mockMvc.perform(delete("/api/entities/1")).andExpect(status().isNoContent)
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

        whenever(entityService.uploadImage(any(), any())).thenReturn(uploadResponse)

        // When/Then
        mockMvc.perform(multipart("/api/entities/1/image").file(file))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.url").value("test-bucket/entities/1/test.jpg"))
    }

    @Test
    fun `deleteImage should return no content`() {
        // When/Then
        mockMvc.perform(delete("/api/entities/1/image")).andExpect(status().isNoContent)
    }
}
