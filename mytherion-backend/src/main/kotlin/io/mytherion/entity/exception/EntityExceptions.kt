package io.mytherion.entity.exception

import java.util.UUID

/** Exception thrown when an entity is not found */
class EntityNotFoundException(id: UUID) : RuntimeException("Entity not found with id: $id")

/** Exception thrown when a user tries to access or modify an entity they don't own */
class EntityAccessDeniedException(id: UUID) :
    RuntimeException("Access denied to entity with id: $id")

/** Exception thrown when an entity's image is not found */
class ImageNotFoundException(entityId: UUID) :
    RuntimeException("Image not found for entity with id: $entityId")

/** Exception thrown when an entity's image deletion fails */
class ImageDeletionException(entityId: UUID, cause: Throwable) :
    RuntimeException("Failed to delete image for entity with id: $entityId", cause)
