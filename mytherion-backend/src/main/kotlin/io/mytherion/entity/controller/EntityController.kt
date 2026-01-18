package io.mytherion.entity.controller

import io.mytherion.entity.dto.*
import io.mytherion.entity.service.EntityService
import io.mytherion.storage.dto.UploadResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api")
class EntityController(private val entityService: EntityService) {

    /**
     * List entities in a project with optional filters GET
     * /api/projects/{projectId}/entities?type=CHARACTER&tags=hero,mage&search=gandalf&page=0&size=20
     */
    @GetMapping("/projects/{projectId}/entities")
    fun listEntities(
            @PathVariable projectId: Long,
            @RequestParam(required = false) type: io.mytherion.entity.model.EntityType?,
            @RequestParam(required = false) tags: List<String>?,
            @RequestParam(required = false) search: String?,
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "20") size: Int
    ): Page<EntityDTO> {
        val searchRequest =
                EntitySearchRequest(
                        type = type,
                        tags = tags,
                        search = search,
                        page = page,
                        size = size
                )
        return entityService.searchEntities(projectId, searchRequest)
    }

    /** Create a new entity in a project POST /api/projects/{projectId}/entities */
    @PostMapping("/projects/{projectId}/entities")
    @ResponseStatus(HttpStatus.CREATED)
    fun createEntity(
            @PathVariable projectId: Long,
            @Valid @RequestBody request: CreateEntityRequest
    ): EntityDTO {
        return entityService.createEntity(projectId, request)
    }

    /** Get entity by ID GET /api/entities/{id} */
    @GetMapping("/entities/{id}")
    fun getEntity(@PathVariable id: Long): EntityDTO {
        return entityService.getEntity(id)
    }

    /** Update entity PATCH /api/entities/{id} */
    @PatchMapping("/entities/{id}")
    fun updateEntity(
            @PathVariable id: Long,
            @Valid @RequestBody request: UpdateEntityRequest
    ): EntityDTO {
        return entityService.updateEntity(id, request)
    }

    /** Delete entity (soft delete) DELETE /api/entities/{id} */
    @DeleteMapping("/entities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntity(@PathVariable id: Long) {
        entityService.deleteEntity(id)
    }

    /** Upload image for entity POST /api/entities/{id}/image */
    @PostMapping("/entities/{id}/image", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadImage(
            @PathVariable id: Long,
            @RequestParam("file") file: MultipartFile
    ): UploadResponse {
        // Validate file
        if (file.isEmpty) {
            throw IllegalArgumentException("File is empty")
        }

        val allowedTypes = listOf("image/jpeg", "image/png", "image/gif", "image/webp")
        if (file.contentType !in allowedTypes) {
            throw IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, GIF, WebP")
        }

        val maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            throw IllegalArgumentException("File size exceeds 5MB limit")
        }

        return entityService.uploadImage(id, file)
    }

    /** Delete image from entity DELETE /api/entities/{id}/image */
    @DeleteMapping("/entities/{id}/image")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteImage(@PathVariable id: Long) {
        entityService.deleteImage(id)
    }
}
