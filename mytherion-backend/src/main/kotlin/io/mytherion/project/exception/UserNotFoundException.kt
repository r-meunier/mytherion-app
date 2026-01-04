package io.mytherion.project.exception

class UserNotFoundException(id: Long) : RuntimeException("User with id $id not found")

class UserAccessDeniedException(id: Long) : RuntimeException("Access denied for id $id user")