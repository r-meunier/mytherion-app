package io.mytherion.entity.service

import io.mytherion.entity.dto.*
import io.mytherion.entity.model.Entity
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.storage.StorageService
import io.mytherion.storage.dto.UploadResponse
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
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
        private val projectRepository: ProjectRepository,
        private val userRepository: UserRepository,
        private val storageService: StorageService,
        @Value("\${minio.bucket-name}") private val bucketName: String
) {

    private val logger = LoggerFactory.getLogger(EntityService::class.java)

    // TEMP: hard-coded user until auth is in place
    private fun getCurrentUser(): User {
        return userRepository.findById(1L).orElseThrow {
            IllegalStateException("Demo user with id=1 not found. Create it manually for now.")
        }
    }

    /** Verify that the current user owns the project that contains this entity */
    private fun verifyEntityAccess(entity: Entity, currentUser: User) {
        if (entity.project.owner.id != currentUser.id) {
            throw EntityAccessDeniedException(entity.id!!)
        }
    }

    /** Create a new entity */
    @Transactional
    fun createEntity(projectId: Long, request: CreateEntityRequest): EntityDTO {
        val user = getCurrentUser()
        val project =
                projectRepository.findByIdAndDeletedAtIsNull(projectId)
                        ?: throw ProjectNotFoundException(projectId)

        // Verify user owns the project
        if (project.owner.id != user.id) {
            throw ProjectAccessDeniedException(projectId)
        }

        val entity =
                Entity(
                        project = project,
                        type = request.type,
                        name = request.name,
                        summary = request.summary,
                        description = request.description,
                        tags = request.tags?.toTypedArray(),
                        metadata = request.metadata
                )

        val saved = entityRepository.save(entity)
        logger.info("Created entity: ${saved.id} in project: $projectId")
        return EntityDTO.from(saved)
    }

    /** Get entity by ID */
    @Transactional(readOnly = true)
    fun getEntity(id: Long): EntityDTO {
        val user = getCurrentUser()
        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)
        return EntityDTO.from(entity)
    }

    /** Update entity */
    @Transactional
    fun updateEntity(id: Long, request: UpdateEntityRequest): EntityDTO {
        val user = getCurrentUser()
        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)

        // Update only provided fields
        request.type?.let { entity.type = it }
        request.name?.let { entity.name = it }
        request.summary?.let { entity.summary = it }
        request.description?.let { entity.description = it }
        request.tags?.let { entity.tags = it.toTypedArray() }
        request.metadata?.let { entity.metadata = it }

        val saved = entityRepository.save(entity)
        logger.info("Updated entity: $id")
        return EntityDTO.from(saved)
    }

    /** Soft delete entity */
    @Transactional
    fun deleteEntity(id: Long) {
        val user = getCurrentUser()
        val entity = entityRepository.findById(id).orElseThrow { EntityNotFoundException(id) }

        if (entity.isDeleted()) {
            throw EntityNotFoundException(id)
        }

        verifyEntityAccess(entity, user)

        // Soft delete
        entity.deletedAt = Instant.now()
        entityRepository.save(entity)
        logger.info("Soft deleted entity: $id")
    }

    /** Search/filter entities in a project */
    @Transactional(readOnly = true)
    fun searchEntities(projectId: Long, searchRequest: EntitySearchRequest): Page<EntityDTO> {
        val user = getCurrentUser()
        val project =
                projectRepository.findByIdAndDeletedAtIsNull(projectId)
                        ?: throw ProjectNotFoundException(projectId)

        if (project.owner.id != user.id) {
            throw ProjectAccessDeniedException(projectId)
        }

        val pageable =
                PageRequest.of(
                        searchRequest.page,
                        searchRequest.size,
                        Sort.by(Sort.Direction.DESC, "createdAt")
                )

        // TODO: Implement custom query with filters (type, tags, search)
        // For now, return all entities in project
        val entities = entityRepository.findAllByProjectAndDeletedAtIsNull(project)

        // Apply filters manually for now
        var filtered = entities.asSequence()

        searchRequest.type?.let { type -> filtered = filtered.filter { it.type == type } }

        searchRequest.tags?.let { tags ->
            filtered =
                    filtered.filter { entity ->
                        entity.tags?.any { tag -> tags.contains(tag) } == true
                    }
        }

        searchRequest.search?.let { search ->
            val searchLower = search.lowercase()
            filtered =
                    filtered.filter { entity ->
                        entity.name.lowercase().contains(searchLower) ||
                                entity.summary?.lowercase()?.contains(searchLower) == true ||
                                entity.description?.lowercase()?.contains(searchLower) == true
                    }
        }

        val result = filtered.toList()
        val start = searchRequest.page * searchRequest.size
        val end = minOf(start + searchRequest.size, result.size)
        val pageContent = if (start < result.size) result.subList(start, end) else emptyList()

        return org.springframework.data.domain.PageImpl(
                pageContent.map { EntityDTO.from(it) },
                pageable,
                result.size.toLong()
        )
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
        entity.imageUrl?.let { oldUrl ->
            try {
                val objectKey = oldUrl.substringAfter("$bucketName/")
                storageService.deleteFile(bucketName, objectKey)
            } catch (e: Exception) {
                logger.warn("Failed to delete old image: ${entity.imageUrl}", e)
            }
        }

        // Upload new image
        val objectKey =
                "entities/${entity.id}/${System.currentTimeMillis()}_${file.originalFilename}"
        val url =
                storageService.uploadFile(
                        bucketName,
                        objectKey,
                        file.inputStream,
                        file.contentType ?: "application/octet-stream",
                        file.size
                )

        // Update entity
        entity.imageUrl = url
        entityRepository.save(entity)

        logger.info("Uploaded image for entity: $id")
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

        entity.imageUrl?.let { url ->
            try {
                val objectKey = url.substringAfter("$bucketName/")
                storageService.deleteFile(bucketName, objectKey)
                entity.imageUrl = null
                entityRepository.save(entity)
                logger.info("Deleted image for entity: $id")
            } catch (e: Exception) {
                logger.error("Failed to delete image for entity: $id", e)
                throw ImageDeletionException(id, e)
            }
        }
                ?: throw ImageNotFoundException(id)
    }
}

// Custom exceptions
class EntityNotFoundException(id: Long) : RuntimeException("Entity not found with id: $id")

class EntityAccessDeniedException(id: Long) :
        RuntimeException("Access denied to entity with id: $id")

class ProjectAccessDeniedException(id: Long) :
        RuntimeException("Access denied to project with id: $id")

class ImageNotFoundException(entityId: Long) :
        RuntimeException("No image found for entity with id: $entityId")

class ImageDeletionException(entityId: Long, cause: Throwable) :
        RuntimeException("Failed to delete image for entity with id: $entityId", cause)
