package io.mytherion.entity.service

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.category.repository.CategoryRepository
import io.mytherion.entity.dto.*
import io.mytherion.entity.exception.*
import io.mytherion.entity.model.Entity
import io.mytherion.entity.repository.EntityRepository
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

    /** Fetch and verify that the entity exists, belongs to the given projectId, and the user has access. */
    private fun getVerifiedEntity(projectId: UUID, id: UUID, user: User): Entity {
        // 1. Verify user access to the project
        projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })

        // 2. Fetch entity and verify existence and not deleted
        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }
        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        // 3. Verify entity belongs to the specified projectId
        if (entity.project.id != projectId) {
            logger.warn(
                "Entity project mismatch: entityId={}, entityProjectId={}, requestedProjectId={}, userId={}",
                id,
                entity.project.id,
                projectId,
                user.id
            )
            throw EntityNotFoundException(id)
        }

        // 4. Verify user owns the project containing this entity (defense-in-depth)
        verifyEntityAccess(entity, user)

        return entity
    }

    /** Create a new entity */
    @Transactional
    fun createEntity(projectId: UUID, request: CreateEntityRequest): EntityDTO {
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
                val cat = categoryRepository.findById(it).orElseThrow { IllegalArgumentException("Category not found") }
                if (cat.project.id != projectId) throw IllegalArgumentException("Category does not belong to this project")
                cat
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
    fun getEntity(projectId: UUID, id: UUID): EntityDTO {
        val user = getCurrentUser()
        logger.debugWith("Fetching entity", "projectId" to projectId, "entityId" to id, "userId" to user.id)

        val entity = getVerifiedEntity(projectId, id, user)
        logger.debugWith("Entity fetched", "entityId" to id, "type" to entity.type.name)
        return EntityDTO.from(entity)
    }

    /** Update entity */
    @Transactional
    fun updateEntity(projectId: UUID, id: UUID, request: UpdateEntityRequest): EntityDTO {
        val user = getCurrentUser()
        logger.infoWith(
            "Updating entity",
            "projectId" to projectId,
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

        val entity = getVerifiedEntity(projectId, id, user)

        // Optimistic locking check
        if (request.version != null && entity.version != request.version) {
            throw org.springframework.orm.ObjectOptimisticLockingFailureException(Entity::class.java, id)
        }

        // Update only provided fields
        request.type?.let { entity.type = it }
        request.name?.let { entity.name = it }
        request.categoryId?.let { catId -> 
            val cat = categoryRepository.findById(catId).orElseThrow { IllegalArgumentException("Category not found") }
            if (cat.project.id != projectId) throw IllegalArgumentException("Category does not belong to this project")
            entity.category = cat
        }
        request.description?.let { entity.description = it }
        request.notes?.let { entity.notes = it }
        request.tags?.let { entity.tags = it.toTypedArray() }
        request.thumbnail?.let { entity.thumbnail = it }
        request.metadata?.let { entity.metadata = it }

        val saved = entityRepository.save(entity)
        logger.infoWith("Entity updated successfully", "projectId" to projectId, "entityId" to id)
        return EntityDTO.from(saved)
    }

    /** Soft delete entity */
    @Transactional
    fun deleteEntity(projectId: UUID, id: UUID) {
        val user = getCurrentUser()
        logger.infoWith("Deleting entity", "projectId" to projectId, "entityId" to id, "userId" to user.id)

        val entity = getVerifiedEntity(projectId, id, user)

        // Soft delete
        entity.markDeleted()
        entityRepository.save(entity)
        logger.infoWith(
            "Entity soft deleted successfully",
            "projectId" to projectId,
            "entityId" to id,
            "type" to entity.type.name
        )
    }

    /** Search/filter entities in a project */
    @Transactional(readOnly = true)
    fun searchEntities(projectId: UUID, searchRequest: EntitySearchRequest): Page<EntityDTO> {
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
    fun uploadImage(projectId: UUID, id: UUID, file: MultipartFile): UploadResponse {
        val user = getCurrentUser()
        val entity = getVerifiedEntity(projectId, id, user)

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
            "projectId" to projectId,
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
    fun deleteImage(projectId: UUID, id: UUID) {
        val user = getCurrentUser()
        val entity = getVerifiedEntity(projectId, id, user)

        entity.thumbnail?.let { url ->
            try {
                val objectKey = url.substringAfter("$bucketName/")
                storageService.deleteFile(bucketName, objectKey)
                entity.thumbnail = null
                entityRepository.save(entity)
                logger.infoWith("Image deleted successfully", "projectId" to projectId, "entityId" to id)
            } catch (e: Exception) {
                logger.errorWith("Failed to delete image", e, "projectId" to projectId, "entityId" to id)
                throw ImageDeletionException(id, e)
            }
        }
            ?: throw ImageNotFoundException(id)
    }
}
