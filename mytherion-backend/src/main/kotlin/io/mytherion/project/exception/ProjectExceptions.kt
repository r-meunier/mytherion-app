package io.mytherion.project.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import java.util.UUID
import org.springframework.http.HttpStatus

/**
 * Exception thrown when a project is missing, deleted or someone else's: one 403 for all three,
 * so project ids cannot be probed. The id is for logs only.
 */
class ProjectAccessDeniedException(val projectId: UUID) :
    ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED)
