package io.mytherion.project.exception

import io.mytherion.common.exception.ApiException
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when a project is not found */
class ProjectNotFoundException(id: UUID) :
    ApiException(HttpStatus.NOT_FOUND, "Not Found", "Project with id $id not found")

/** Exception thrown when a user tries to access or modify a project they don't own */
class ProjectAccessDeniedException(id: UUID) :
    ApiException(HttpStatus.FORBIDDEN, "Forbidden", "Access denied to project with id $id")
