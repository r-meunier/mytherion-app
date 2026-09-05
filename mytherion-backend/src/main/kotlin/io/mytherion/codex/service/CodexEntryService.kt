package io.mytherion.codex.service

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.dto.*
import io.mytherion.codex.exception.*
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.platform.logging.debugWith
import io.mytherion.platform.logging.errorWith
import io.mytherion.platform.logging.infoWith
import io.mytherion.platform.logging.measureTime
import io.mytherion.platform.monitoring.MetricsService
import io.mytherion.project.service.ProjectService
import io.mytherion.platform.storage.StorageService
import io.mytherion.platform.storage.dto.UploadResponse
import io.mytherion.user.model.User
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class CodexEntryService(
    private val entryRepository: CodexEntryRepository,
    private val projectService: ProjectService,
    private val currentUserProvider: CurrentUserProvider,
    private val storageService: StorageService,
    private val metricsService: MetricsService,
    @Value("\${minio.bucket-name}") private val bucketName: String
) {

    private val logger = LoggerFactory.getLogger(CodexEntryService::class.java)

    private fun getCurrentUser(): User = currentUserProvider.getCurrentUser()

    /** Verify that the current user owns the project that contains this entry */
    private fun verifyEntryAccess(entry: CodexEntry, currentUser: User) {
        if (entry.project.owner.id != currentUser.id) {
            throw EntryAccessDeniedException(requireNotNull(entry.id) { "CodexEntry ID is missing" })
        }
    }

    /** Fetch and verify that the entry exists, belongs to the given projectId, and the user has access. */
    private fun getVerifiedEntry(projectId: UUID, id: UUID, user: User): CodexEntry {
        // 1. Verify user access to the project
        projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })

        // 2. Fetch entry and verify existence and not deleted
        val entry = entryRepository.findById(id).orElseThrow { EntryNotFoundException(id) }
        if (entry.isDeleted()) {
            throw EntryNotFoundException(id)
        }

        // 3. Verify entry belongs to the specified projectId
        if (entry.project.id != projectId) {
            logger.warn(
                "CodexEntry project mismatch: entryId={}, entryProjectId={}, requestedProjectId={}, userId={}",
                id,
                entry.project.id,
                projectId,
                user.id
            )
            throw EntryNotFoundException(id)
        }

        // 4. Verify user owns the project containing this entry (defense-in-depth)
        verifyEntryAccess(entry, user)

        return entry
    }

    /** Create a new entry */
    @Transactional
    fun createEntry(projectId: UUID, request: CreateEntryRequest): EntryDTO {
        val user = getCurrentUser()
        logger.infoWith(
            "Creating entry",
            "projectId" to projectId,
            "userId" to user.id,
            "type" to request.type.name,
            "name" to request.name
        )

        return logger.measureTime("Create entry") {
            val project = projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })

            val entry =
                CodexEntry(
                    project = project,
                    type = request.type,
                    name = request.name,
                    description = request.description,
                    notes = request.notes,
                    tags = request.tags?.toTypedArray(),
                    thumbnail = request.thumbnail,
                    content = request.content
                )

            val saved = entryRepository.save(entry)
            logger.infoWith(
                "CodexEntry created successfully",
                "entryId" to saved.id,
                "projectId" to projectId,
                "type" to saved.type.name,
                "name" to saved.name
            )
            EntryDTO.from(saved)
        }
    }

    /** Get entry by ID */
    @Transactional(readOnly = true)
    fun getEntry(projectId: UUID, id: UUID): EntryDTO {
        val user = getCurrentUser()
        logger.debugWith("Fetching entry", "projectId" to projectId, "entryId" to id, "userId" to user.id)

        val entry = getVerifiedEntry(projectId, id, user)
        logger.debugWith("CodexEntry fetched", "entryId" to id, "type" to entry.type.name)
        return EntryDTO.from(entry)
    }

    /** Update entry */
    @Transactional
    fun updateEntry(projectId: UUID, id: UUID, request: UpdateEntryRequest): EntryDTO {
        val user = getCurrentUser()
        logger.infoWith(
            "Updating entry",
            "projectId" to projectId,
            "entryId" to id,
            "userId" to user.id,
            "updates" to
                    listOfNotNull(
                        request.type?.let { "type" },
                        request.name?.let { "name" },
                        request.description?.let { "description" },
                        request.notes?.let { "notes" },
                        request.tags?.let { "tags" },
                        request.content?.let { "content" }
                    )
        )

        val entry = getVerifiedEntry(projectId, id, user)

        // Optimistic locking check
        if (request.version != null && entry.version != request.version) {
            throw org.springframework.orm.ObjectOptimisticLockingFailureException(CodexEntry::class.java, id)
        }

        // Update only provided fields
        request.type?.let { entry.type = it }
        request.name?.let { entry.name = it }
        request.description?.let { entry.description = it }
        request.notes?.let { entry.notes = it }
        request.tags?.let { entry.tags = it.toTypedArray() }
        request.thumbnail?.let { entry.thumbnail = it }
        request.content?.let { entry.content = it }

        val saved = entryRepository.save(entry)
        logger.infoWith("CodexEntry updated successfully", "projectId" to projectId, "entryId" to id)
        return EntryDTO.from(saved)
    }

    /** Soft delete entry */
    @Transactional
    fun deleteEntry(projectId: UUID, id: UUID) {
        val user = getCurrentUser()
        logger.infoWith("Deleting entry", "projectId" to projectId, "entryId" to id, "userId" to user.id)

        val entry = getVerifiedEntry(projectId, id, user)

        // Soft delete
        entry.markDeleted()
        entryRepository.save(entry)
        logger.infoWith(
            "CodexEntry soft deleted successfully",
            "projectId" to projectId,
            "entryId" to id,
            "type" to entry.type.name
        )
    }

    /** Search/filter entries in a project */
    @Transactional(readOnly = true)
    fun searchEntries(projectId: UUID, searchRequest: EntrySearchRequest): Page<EntryDTO> {
        val user = getCurrentUser()
        logger.debugWith(
            "Searching entries",
            "projectId" to projectId,
            "userId" to user.id,
            "type" to (searchRequest.type?.name ?: "all"),
            "tags" to (searchRequest.tags ?: emptyList()),
            "search" to (searchRequest.search ?: "none"),
            "page" to searchRequest.page,
            "size" to searchRequest.size
        )

        val startTime = System.currentTimeMillis()

        return logger.measureTime("Search entries") {
            // Ensure user has access to the project
            projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })

            val pageable =
                PageRequest.of(
                    searchRequest.page,
                    searchRequest.size,
                    Sort.by(Sort.Direction.DESC, "createdAt")
                )

            val entriesPage = entryRepository.searchEntries(
                projectId = projectId,
                type = searchRequest.type,
                tags = searchRequest.tags,
                search = searchRequest.search,
                pageable = pageable
            )

            logger.infoWith(
                "CodexEntry search completed",
                "projectId" to projectId,
                "totalResults" to entriesPage.totalElements,
                "pageResults" to entriesPage.content.size
            )

            val duration = System.currentTimeMillis() - startTime
            metricsService.recordEntrySearch(
                projectId = projectId,
                totalResults = entriesPage.totalElements.toInt(),
                pageResults = entriesPage.content.size,
                durationMs = duration
            )

            entriesPage.map { EntryDTO.from(it) }
        }
    }

    /** Upload image for entry */
    @Transactional
    fun uploadThumbnail(projectId: UUID, id: UUID, file: MultipartFile): UploadResponse {
        val user = getCurrentUser()
        val entry = getVerifiedEntry(projectId, id, user)

        // Delete old image if exists
        entry.thumbnail?.let { oldUrl ->
            try {
                storageService.deleteFile(bucketName, oldUrl.substringAfter("$bucketName/"))
            } catch (e: Exception) {
                logger.warn("Failed to delete old image: ${entry.thumbnail}", e)
            }
        }

        // Upload new image
        val objectKey =
            "entries/${entry.id}/${System.currentTimeMillis()}_${file.originalFilename}"
        val uploadStart = System.currentTimeMillis()
        var uploadSuccess = false

        val url =
            try {
                storageService.uploadFile(
                    bucketName,
                    objectKey,
                    file.inputStream,
                    file.contentType ?: "application/octet-stream",
                    file.size
                )
                    .also { uploadSuccess = true }
            } finally {
                val uploadDuration = System.currentTimeMillis() - uploadStart
                metricsService.recordStorageUpload(
                    bucket = bucketName,
                    sizeBytes = file.size,
                    durationMs = uploadDuration,
                    success = uploadSuccess
                )
            }

        // Update entry
        entry.thumbnail = url
        entryRepository.save(entry)

        logger.infoWith(
            "Image uploaded successfully",
            "projectId" to projectId,
            "entryId" to id,
            "size" to file.size,
            "contentType" to (file.contentType ?: "unknown")
        )
        return UploadResponse(
            url = url,
            objectKey = objectKey,
            bucketName = bucketName,
            contentType = file.contentType ?: "application/octet-stream",
            size = file.size
        )
    }

    /** Delete image from entry */
    @Transactional
    fun deleteThumbnail(projectId: UUID, id: UUID) {
        val user = getCurrentUser()
        val entry = getVerifiedEntry(projectId, id, user)

        entry.thumbnail?.let { url ->
            try {
                val objectKey = url.substringAfter("$bucketName/")
                storageService.deleteFile(bucketName, objectKey)
                entry.thumbnail = null
                entryRepository.save(entry)
                logger.infoWith("Image deleted successfully", "projectId" to projectId, "entryId" to id)
            } catch (e: Exception) {
                logger.errorWith("Failed to delete image", e, "projectId" to projectId, "entryId" to id)
                throw ThumbnailDeletionException(id, e)
            }
        }
            ?: throw ThumbnailNotFoundException(id)
    }
}
