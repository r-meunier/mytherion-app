package io.mytherion.project.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when a project is not found */
class ProjectNotFoundException(id: UUID) :
    ApiException(HttpStatus.NOT_FOUND, ErrorCode.PROJECT_NOT_FOUND, "Project with id $id not found")

/** Exception thrown when a user accesses a project they don't own; the id is for logs only */
class ProjectAccessDeniedException(val projectId: UUID) :
    ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED)
