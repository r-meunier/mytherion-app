package io.mytherion.project.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import java.util.UUID
import org.springframework.http.HttpStatus

/**
 * Exception thrown when a project is missing, deleted or someone else's: one 404 for all three,
 * so project ids cannot be probed. The id is for logs only.
 */
class ProjectNotFoundException(val projectId: UUID) :
    ApiException(HttpStatus.NOT_FOUND, ErrorCode.PROJECT_NOT_FOUND, "Project not found")
