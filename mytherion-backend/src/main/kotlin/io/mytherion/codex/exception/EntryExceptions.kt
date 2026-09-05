package io.mytherion.codex.exception

import io.mytherion.common.exception.ApiException
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when an entry is not found */
class EntryNotFoundException(id: UUID) :
    ApiException(HttpStatus.NOT_FOUND, "Not Found", "CodexEntry not found with id: $id")

/** Exception thrown when a user tries to access or modify an entry they don't own */
class EntryAccessDeniedException(id: UUID) :
    ApiException(HttpStatus.FORBIDDEN, "Forbidden", "Access denied to entry with id: $id")

/** Exception thrown when an entry's image is not found */
class ThumbnailNotFoundException(entryId: UUID) :
    ApiException(HttpStatus.NOT_FOUND, "Not Found", "Image not found for entry with id: $entryId")

/**
 * Exception thrown when an entry's image deletion fails.
 *
 * Deliberately *not* an [ApiException]: this signals an infrastructure failure in object storage,
 * not something the caller did wrong. Leaving it as a plain exception lets it fall through to the
 * generic handler, which logs the cause and returns a masked 500 rather than exposing storage
 * internals to the client.
 */
class ThumbnailDeletionException(entryId: UUID, cause: Throwable) :
    RuntimeException("Failed to delete image for entry with id: $entryId", cause)
