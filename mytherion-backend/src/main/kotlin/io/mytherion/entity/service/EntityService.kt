package io.mytherion.entity.service

import io.mytherion.auth.CurrentUserProvider
import io.mytherion.category.repository.CategoryRepository
import io.mytherion.entity.dto.*
import io.mytherion.entity.exception.*
import io.mytherion.entity.model.Entity
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.logging.debugWith
import io.mytherion.logging.errorWith
import io.mytherion.logging.infoWith
import io.mytherion.logging.measureTime
import io.mytherion.monitoring.MetricsService
import io.mytherion.project.service.ProjectService
import io.mytherion.storage.StorageService
import io.mytherion.storage.dto.UploadResponse
import io.mytherion.user.model.User
import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class EntityService(
    private val entityRepository: EntityRepository,
    private val categoryRepository: CategoryRepository,
    private val projectService: ProjectService,
    private val currentUserProvider: CurrentUserProvider,
    private val storageService: StorageService,
    private val metricsService: MetricsService,
    @Value("\${minio.bucket-name}") private val bucketName: String
) {

    private val logger = LoggerFactory.getLogger(EntityService::class.java)

    private fun getCurrentUser(): User = currentUserProvider.getCurrentUser()

    /** Verify that the current user owns the project that contains this entity */
    private fun verifyEntityAccess(entity: Entity, currentUser: User) {
        if (entity.project.owner.id != currentUser.id) {
            throw EntityAccessDeniedException(requireNotNull(entity.id) { "Entity ID is missing" })
        }
    }

    /** Create a new entity */
    @Transactional
    fun createEntity(projectId: Long, request: CreateEntityRequest): EntityDTO {
        val user = getCurrentUser()
        logger.infoWith(
            "Creating entity",
            "projectId" to projectId,
            "userId" to user.id,
            "type" to request.type.name,
            "name" to request.name
        )

        return logger.measureTime("Create entity") {
            val project = projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })

            val category = request.categoryId?.let { 
                categoryRepository.findById(it).orElseThrow { IllegalArgumentException("Category not found") } 
            }

            val entity =
                Entity(
                    project = project,
                    type = request.type,
                    name = request.name,
                    category = category,
                    description = request.description,
                    notes = request.notes,
                    tags = request.tags?.toTypedArray(),
                    thumbnail = request.thumbnail,
                    metadata = request.metadata
                )

            val saved = entityRepository.save(entity)
            logger.infoWith(
                "Entity created successfully",
                "entityId" to saved.id,
                "projectId" to projectId,
                "type" to saved.type.name,
                "name" to saved.name
            )
            EntityDTO.from(saved)
        }
    }

    /** Get entity by ID */
    @Transactional(readOnly = true)
    fun getEntity(id: Long): EntityDTO {
        val user = getCurrentUser()
        logger.debugWith("Fetching entity", "entityId" to id, "userId" to user.id)

        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)
        logger.debugWith("Entity fetched", "entityId" to id, "type" to entity.type.name)
        return EntityDTO.from(entity)
    }

    /** Update entity */
    @Transactional
    fun updateEntity(id: Long, request: UpdateEntityRequest): EntityDTO {
        val user = getCurrentUser()
        logger.infoWith(
            "Updating entity",
            "entityId" to id,
            "userId" to user.id,
            "updates" to
                    listOfNotNull(
                        request.type?.let { "type" },
                        request.name?.let { "name" },
                        request.description?.let { "description" },
                        request.notes?.let { "notes" },
                        request.tags?.let { "tags" },
                        request.metadata?.let { "metadata" }
                    )
        )

        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)

        // Update only provided fields
        request.type?.let { entity.type = it }
        request.name?.let { entity.name = it }
        request.categoryId?.let { id -> 
            entity.category = categoryRepository.findById(id).orElseThrow { IllegalArgumentException("Category not found") }
        }
        request.description?.let { entity.description = it }
        request.notes?.let { entity.notes = it }
        request.tags?.let { entity.tags = it.toTypedArray() }
        request.thumbnail?.let { entity.thumbnail = it }
        request.metadata?.let { entity.metadata = it }

        val saved = entityRepository.save(entity)
        logger.infoWith("Entity updated successfully", "entityId" to id)
        return EntityDTO.from(saved)
    }

    /** Soft delete entity */
    @Transactional
    fun deleteEntity(id: Long) {
        val user = getCurrentUser()
        logger.infoWith("Deleting entity", "entityId" to id, "userId" to user.id)

        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)

        // Soft delete
        entity.deletedAt = Instant.now()
        entityRepository.save(entity)
        logger.infoWith(
            "Entity soft deleted successfully",
            "entityId" to id,
            "type" to entity.type.name
        )
    }

    /** Search/filter entities in a project */
    @Transactional(readOnly = true)
    fun searchEntities(projectId: Long, searchRequest: EntitySearchRequest): Page<EntityDTO> {
        val user = getCurrentUser()
        logger.debugWith(
            "Searching entities",
            "projectId" to projectId,
            "userId" to user.id,
            "type" to (searchRequest.type?.name ?: "all"),
            "tags" to (searchRequest.tags ?: emptyList()),
            "search" to (searchRequest.search ?: "none"),
            "page" to searchRequest.page,
            "size" to searchRequest.size
        )

        val startTime = System.currentTimeMillis()

        return logger.measureTime("Search entities") {
            // Ensure user has access to the project
            projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })

            val pageable =
                PageRequest.of(
                    searchRequest.page,
                    searchRequest.size,
                    Sort.by(Sort.Direction.DESC, "createdAt")
                )

            val entitiesPage = entityRepository.searchEntities(
                projectId = projectId,
                type = searchRequest.type,
                categoryId = searchRequest.categoryId,
                tags = searchRequest.tags,
                search = searchRequest.search,
                pageable = pageable
            )

            logger.infoWith(
                "Entity search completed",
                "projectId" to projectId,
                "totalResults" to entitiesPage.totalElements,
                "pageResults" to entitiesPage.content.size
            )

            val duration = System.currentTimeMillis() - startTime
            metricsService.recordEntitySearch(
                projectId = projectId,
                totalResults = entitiesPage.totalElements.toInt(),
                pageResults = entitiesPage.content.size,
                durationMs = duration
            )

            entitiesPage.map { EntityDTO.from(it) }
        }
    }

    /** Upload image for entity */
    @Transactional
    fun uploadImage(id: Long, file: MultipartFile): UploadResponse {
        val user = getCurrentUser()
        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)

        // Delete old image if exists
        entity.thumbnail?.let { oldUrl ->
            try {
                storageService.deleteFile(bucketName, oldUrl.substringAfter("$bucketName/"))
            } catch (e: Exception) {
                logger.warn("Failed to delete old image: ${entity.thumbnail}", e)
            }
        }

        // Upload new image
        val objectKey =
            "entities/${entity.id}/${System.currentTimeMillis()}_${file.originalFilename}"
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

        // Update entity
        entity.thumbnail = url
        entityRepository.save(entity)

        logger.infoWith(
            "Image uploaded successfully",
            "entityId" to id,
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

    /** Delete image from entity */
    @Transactional
    fun deleteImage(id: Long) {
        val user = getCurrentUser()
        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)

        entity.thumbnail?.let { url ->
            try {
                val objectKey = url.substringAfter("$bucketName/")
                storageService.deleteFile(bucketName, objectKey)
                entity.thumbnail = null
                entityRepository.save(entity)
                logger.infoWith("Image deleted successfully", "entityId" to id)
            } catch (e: Exception) {
                logger.errorWith("Failed to delete image", e, "entityId" to id)
                throw ImageDeletionException(id, e)
            }
        }
            ?: throw ImageNotFoundException(id)
    }
}
