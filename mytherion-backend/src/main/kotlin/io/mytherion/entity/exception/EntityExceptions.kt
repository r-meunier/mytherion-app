package io.mytherion.entity.exception

import io.mytherion.common.exception.ApiException
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when an entity is not found */
class EntityNotFoundException(id: UUID) :
    ApiException(HttpStatus.NOT_FOUND, "Not Found", "Entity not found with id: $id")

/** Exception thrown when a user tries to access or modify an entity they don't own */
class EntityAccessDeniedException(id: UUID) :
    ApiException(HttpStatus.FORBIDDEN, "Forbidden", "Access denied to entity with id: $id")

/** Exception thrown when an entity's image is not found */
class ImageNotFoundException(entityId: UUID) :
    ApiException(HttpStatus.NOT_FOUND, "Not Found", "Image not found for entity with id: $entityId")

/**
 * Exception thrown when an entity's image deletion fails.
 *
 * Deliberately *not* an [ApiException]: this signals an infrastructure failure in object storage,
 * not something the caller did wrong. Leaving it as a plain exception lets it fall through to the
 * generic handler, which logs the cause and returns a masked 500 rather than exposing storage
 * internals to the client.
 */
class ImageDeletionException(entityId: UUID, cause: Throwable) :
    RuntimeException("Failed to delete image for entity with id: $entityId", cause)
