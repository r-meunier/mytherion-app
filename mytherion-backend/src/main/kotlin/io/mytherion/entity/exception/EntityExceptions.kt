package io.mytherion.entity.exception

/** Exception thrown when an entity is not found */
class EntityNotFoundException(id: Long) : RuntimeException("Entity not found with id: $id")

/** Exception thrown when a user tries to access or modify an entity they don't own */
class EntityAccessDeniedException(id: Long) :
        RuntimeException("Access denied to entity with id: $id")

/** Exception thrown when an entity's image is not found */
class ImageNotFoundException(entityId: Long) :
        RuntimeException("No image found for entity with id: $entityId")

/** Exception thrown when an entity's image deletion fails */
class ImageDeletionException(entityId: Long, cause: Throwable) :
        RuntimeException("Failed to delete image for entity with id: $entityId", cause)
