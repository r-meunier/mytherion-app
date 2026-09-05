package io.mytherion.user.exception

import io.mytherion.common.exception.ApiException
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when a user is not found */
class UserNotFoundException(id: UUID) :
    ApiException(HttpStatus.NOT_FOUND, "Not Found", "User with id $id not found")

/** Exception thrown when a user tries to access another user's resources */
class UserAccessDeniedException(id: UUID) :
    ApiException(HttpStatus.FORBIDDEN, "Forbidden", "Access denied for id $id user")
