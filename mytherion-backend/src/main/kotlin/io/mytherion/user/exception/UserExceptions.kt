package io.mytherion.user.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when a user is not found */
class UserNotFoundException private constructor(message: String) :
    ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, message) {

    constructor(id: UUID) : this("User with id $id not found")

    /** For lookups by email, where echoing the address back would add nothing. */
    constructor() : this("User not found")
}

/**
 * Exception thrown when a user tries to read or change another user's account, or to change a
 * role without being an administrator. The id is kept for logging and never reaches the
 * response; see [ErrorMessages].
 */
class UserAccessDeniedException(val userId: UUID) :
    ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED)

/** Exception thrown when the requested role does not exist */
class InvalidRoleException(roleName: String) :
    ApiException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_ROLE, "Invalid role: $roleName")

/** Exception thrown when the requested username already belongs to another account */
class UsernameAlreadyInUseException :
    ApiException(HttpStatus.CONFLICT, ErrorCode.USERNAME_ALREADY_IN_USE, "Username already in use")
