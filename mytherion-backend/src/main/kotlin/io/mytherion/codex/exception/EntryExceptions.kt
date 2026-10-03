package io.mytherion.codex.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when an entry is not found */
class EntryNotFoundException(id: UUID) :
    ApiException(HttpStatus.NOT_FOUND, ErrorCode.ENTRY_NOT_FOUND, "CodexEntry not found with id: $id")

/** Exception thrown when a user accesses an entry they don't own; the id is for logs only */
class EntryAccessDeniedException(val entryId: UUID) :
    ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED)

/** Exception thrown when an entry's image is not found */
class ThumbnailNotFoundException(entryId: UUID) :
    ApiException(HttpStatus.NOT_FOUND, ErrorCode.THUMBNAIL_NOT_FOUND, "Image not found for entry with id: $entryId")

/** Exception thrown when an uploaded file is empty or not an accepted image type */
class InvalidFileException(message: String) :
    ApiException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_FILE, message)

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
