package io.mytherion.codex.rest

import io.mytherion.codex.dto.*
import io.mytherion.codex.service.CodexEntryService
import io.mytherion.platform.logging.errorWith
import io.mytherion.platform.logging.infoWith
import io.mytherion.platform.logging.logger
import io.mytherion.platform.storage.dto.UploadResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@RequestMapping("/api/projects/{projectId}/entries")
class CodexEntryController(private val entryService: CodexEntryService) {
    private val logger = logger()

    /**
     * List entries in a project with optional filters GET
     * /api/projects/{projectId}/entries?type=CHARACTER&tags=hero,mage&search=gandalf&page=0&size=20
     */
    @GetMapping
    fun listEntries(
        @PathVariable projectId: UUID,
        @RequestParam(required = false) type: io.mytherion.codex.model.EntryType?,
        @RequestParam(required = false) tags: List<String>?,
        @RequestParam(required = false) search: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<EntryDTO> {
        logger.infoWith(
            "List entries request",
            "projectId" to projectId,
            "type" to type,
            "tags" to tags,
            "search" to search,
            "page" to page,
            "size" to size
        )

        return try {
            val searchRequest =
                EntrySearchRequest(
                    type = type,
                    tags = tags,
                    search = search,
                    page = page,
                    size = size
                )
            entryService.searchEntries(projectId, searchRequest)
        } catch (e: Exception) {
            logger.errorWith("Failed to list entries", e, "projectId" to projectId)
            throw e
        }
    }

    /** Create a new entry in a project POST /api/projects/{projectId}/entries */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createEntry(
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: CreateEntryRequest
    ): EntryDTO {
        logger.infoWith(
            "Create entry request",
            "projectId" to projectId,
            "type" to request.type,
            "name" to request.name
        )

        return try {
            entryService.createEntry(projectId, request)
        } catch (e: Exception) {
            logger.errorWith(
                "Failed to create entry",
                e,
                "projectId" to projectId,
                "name" to request.name
            )
            throw e
        }
    }

    /** Get entry by ID GET /api/projects/{projectId}/entries/{id} */
    @GetMapping("/{id}")
    fun getEntry(
        @PathVariable projectId: UUID,
        @PathVariable id: UUID
    ): EntryDTO {
        logger.infoWith("Get entry request", "projectId" to projectId, "entryId" to id)

        return try {
            entryService.getEntry(projectId, id)
        } catch (e: Exception) {
            logger.errorWith("Failed to get entry", e, "projectId" to projectId, "entryId" to id)
            throw e
        }
    }

    /** Update entry PATCH /api/projects/{projectId}/entries/{id} */
    @PatchMapping("/{id}")
    fun updateEntry(
        @PathVariable projectId: UUID,
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateEntryRequest
    ): EntryDTO {
        logger.infoWith("Update entry request", "projectId" to projectId, "entryId" to id)

        return try {
            entryService.updateEntry(projectId, id, request)
        } catch (e: Exception) {
            logger.errorWith("Failed to update entry", e, "projectId" to projectId, "entryId" to id)
            throw e
        }
    }

    /** Delete entry (soft delete) DELETE /api/projects/{projectId}/entries/{id} */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntry(
        @PathVariable projectId: UUID,
        @PathVariable id: UUID
    ) {
        logger.infoWith("Delete entry request", "projectId" to projectId, "entryId" to id)

        try {
            entryService.deleteEntry(projectId, id)
        } catch (e: Exception) {
            logger.errorWith("Failed to delete entry", e, "projectId" to projectId, "entryId" to id)
            throw e
        }
    }

    /** Upload image for entry POST /api/projects/{projectId}/entries/{id}/image */
    @PostMapping("/{id}/image", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadThumbnail(
        @PathVariable projectId: UUID,
        @PathVariable id: UUID,
        @RequestParam("file") file: MultipartFile
    ): UploadResponse {
        logger.infoWith(
            "Upload image request",
            "projectId" to projectId,
            "entryId" to id,
            "fileName" to file.originalFilename,
            "fileSize" to file.size,
            "contentType" to file.contentType
        )

        // Validate file
        if (file.isEmpty) {
            logger.errorWith("File is empty", null, "projectId" to projectId, "entryId" to id)
            throw IllegalArgumentException("File is empty")
        }

        val allowedTypes = listOf("image/jpeg", "image/png", "image/gif", "image/webp")
        if (file.contentType !in allowedTypes) {
            logger.errorWith(
                "Invalid file type",
                null,
                "projectId" to projectId,
                "entryId" to id,
                "contentType" to file.contentType
            )
            throw IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, GIF, WebP")
        }

        val maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            logger.errorWith(
                "File size exceeds limit",
                null,
                "projectId" to projectId,
                "entryId" to id,
                "fileSize" to file.size
            )
            throw IllegalArgumentException("File size exceeds 5MB limit")
        }

        return try {
            entryService.uploadThumbnail(projectId, id, file)
        } catch (e: Exception) {
            logger.errorWith("Failed to upload image", e, "projectId" to projectId, "entryId" to id)
            throw e
        }
    }

    /** Delete image from entry DELETE /api/projects/{projectId}/entries/{id}/image */
    @DeleteMapping("/{id}/image")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteThumbnail(
        @PathVariable projectId: UUID,
        @PathVariable id: UUID
    ) {
        logger.infoWith("Delete image request", "projectId" to projectId, "entryId" to id)

        try {
            entryService.deleteThumbnail(projectId, id)
        } catch (e: Exception) {
            logger.errorWith("Failed to delete image", e, "projectId" to projectId, "entryId" to id)
            throw e
        }
    }
}
