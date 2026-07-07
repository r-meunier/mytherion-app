package io.mytherion.project.exception

import java.util.UUID

/** Exception thrown when a project is not found */
class ProjectNotFoundException(id: UUID) : RuntimeException("Project with id $id not found")

/** Exception thrown when a user tries to access or modify a project they don't own */
class ProjectAccessDeniedException(id: UUID) :
    RuntimeException("Access denied to project with id $id")
