package io.mytherion.user.exception

/** Exception thrown when a user is not found */
class UserNotFoundException(id: Long) : RuntimeException("User with id $id not found")

/** Exception thrown when a user tries to access another user's resources */
class UserAccessDeniedException(id: Long) : RuntimeException("Access denied for id $id user")
