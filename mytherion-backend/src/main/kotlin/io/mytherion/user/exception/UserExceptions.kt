package io.mytherion.user.exception

import java.util.UUID

/** Exception thrown when a user is not found */
class UserNotFoundException(id: UUID) : RuntimeException("User with id $id not found")

/** Exception thrown when a user tries to access another user's resources */
class UserAccessDeniedException(id: UUID) : RuntimeException("Access denied for id $id user")
