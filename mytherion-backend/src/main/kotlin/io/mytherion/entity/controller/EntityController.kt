package io.mytherion.entity.controller

import io.mytherion.entity.dto.*
import io.mytherion.entity.service.EntityService
import io.mytherion.logging.errorWith
import io.mytherion.logging.infoWith
import io.mytherion.logging.logger
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
    private val logger = logger()

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
        logger.infoWith(
                "List entities request",
                "projectId" to projectId,
                "type" to type,
                "tags" to tags,
                "search" to search,
                "page" to page,
                "size" to size
        )

        return try {
            val searchRequest =
                    EntitySearchRequest(
                            type = type,
                            tags = tags,
                            search = search,
                            page = page,
                            size = size
                    )
            entityService.searchEntities(projectId, searchRequest)
        } catch (e: Exception) {
            logger.errorWith("Failed to list entities", e, "projectId" to projectId)
            throw e
        }
    }

    /** Create a new entity in a project POST /api/projects/{projectId}/entities */
    @PostMapping("/projects/{projectId}/entities")
    @ResponseStatus(HttpStatus.CREATED)
    fun createEntity(
            @PathVariable projectId: Long,
            @Valid @RequestBody request: CreateEntityRequest
    ): EntityDTO {
        logger.infoWith(
                "Create entity request",
                "projectId" to projectId,
                "type" to request.type,
                "name" to request.name
        )

        return try {
            entityService.createEntity(projectId, request)
        } catch (e: Exception) {
            logger.errorWith(
                    "Failed to create entity",
                    e,
                    "projectId" to projectId,
                    "name" to request.name
            )
            throw e
        }
    }

    /** Get entity by ID GET /api/entities/{id} */
    @GetMapping("/entities/{id}")
    fun getEntity(@PathVariable id: Long): EntityDTO {
        logger.infoWith("Get entity request", "entityId" to id)

        return try {
            entityService.getEntity(id)
        } catch (e: Exception) {
            logger.errorWith("Failed to get entity", e, "entityId" to id)
            throw e
        }
    }

    /** Update entity PATCH /api/entities/{id} */
    @PatchMapping("/entities/{id}")
    fun updateEntity(
            @PathVariable id: Long,
            @Valid @RequestBody request: UpdateEntityRequest
    ): EntityDTO {
        logger.infoWith("Update entity request", "entityId" to id)

        return try {
            entityService.updateEntity(id, request)
        } catch (e: Exception) {
            logger.errorWith("Failed to update entity", e, "entityId" to id)
            throw e
        }
    }

    /** Delete entity (soft delete) DELETE /api/entities/{id} */
    @DeleteMapping("/entities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntity(@PathVariable id: Long) {
        logger.infoWith("Delete entity request", "entityId" to id)

        try {
            entityService.deleteEntity(id)
        } catch (e: Exception) {
            logger.errorWith("Failed to delete entity", e, "entityId" to id)
            throw e
        }
    }

    /** Upload image for entity POST /api/entities/{id}/image */
    @PostMapping("/entities/{id}/image", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadImage(
            @PathVariable id: Long,
            @RequestParam("file") file: MultipartFile
    ): UploadResponse {
        logger.infoWith(
                "Upload image request",
                "entityId" to id,
                "fileName" to file.originalFilename,
                "fileSize" to file.size,
                "contentType" to file.contentType
        )

        // Validate file
        if (file.isEmpty) {
            logger.errorWith("File is empty", null, "entityId" to id)
            throw IllegalArgumentException("File is empty")
        }

        val allowedTypes = listOf("image/jpeg", "image/png", "image/gif", "image/webp")
        if (file.contentType !in allowedTypes) {
            logger.errorWith(
                    "Invalid file type",
                    null,
                    "entityId" to id,
                    "contentType" to file.contentType
            )
            throw IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, GIF, WebP")
        }

        val maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            logger.errorWith(
                    "File size exceeds limit",
                    null,
                    "entityId" to id,
                    "fileSize" to file.size
            )
            throw IllegalArgumentException("File size exceeds 5MB limit")
        }

        return try {
            entityService.uploadImage(id, file)
        } catch (e: Exception) {
            logger.errorWith("Failed to upload image", e, "entityId" to id)
            throw e
        }
    }

    /** Delete image from entity DELETE /api/entities/{id}/image */
    @DeleteMapping("/entities/{id}/image")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteImage(@PathVariable id: Long) {
        logger.infoWith("Delete image request", "entityId" to id)

        try {
            entityService.deleteImage(id)
        } catch (e: Exception) {
            logger.errorWith("Failed to delete image", e, "entityId" to id)
            throw e
        }
    }
}
