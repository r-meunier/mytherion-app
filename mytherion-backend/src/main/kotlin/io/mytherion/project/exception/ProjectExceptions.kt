package io.mytherion.project.exception

/** Exception thrown when a project is not found */
class ProjectNotFoundException(id: Long) : RuntimeException("Project with id $id not found")

/** Exception thrown when a user tries to access or modify a project they don't own */
class ProjectAccessDeniedException(id: Long) :
        RuntimeException("Access denied to project with id $id")
