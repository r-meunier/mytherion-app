package io.mytherion.project.security

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.platform.logging.logger
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.repository.ProjectRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.HandlerMapping
import java.util.UUID

/**
 * Interceptor that ensures the authenticated user has access to the project
 * specified in the URL path (projectId).
 */
@Component
class ProjectAccessInterceptor(
    private val projectRepository: ProjectRepository,
    private val currentUserProvider: CurrentUserProvider
) : HandlerInterceptor {
    private val logger = logger()

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        // Extract path variables from the request
        val pathVariables = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) as? Map<*, *>
        val projectIdStr = pathVariables?.get("projectId") as? String
        
        if (projectIdStr != null) {
            val projectId = runCatching { java.util.UUID.fromString(projectIdStr) }.getOrNull()
            if (projectId != null) {
                val currentUser = currentUserProvider.getCurrentUser()
                
                // Verify that the project exists and belongs to the current user
                val projectExists = projectRepository.existsByIdAndOwnerAndDeletedAtIsNull(projectId, currentUser)
                
                if (!projectExists) {
                    logger.warn("Access denied to project {} for user {}", projectId, currentUser.email)
                    // Thrown rather than written with response.sendError: an exception from
                    // preHandle is routed through the HandlerExceptionResolver to
                    // GlobalExceptionHandler, so tenant-isolation denials return the same
                    // ErrorResponse shape as every other error. sendError would emit the
                    // servlet container's default body instead.
                    throw ProjectAccessDeniedException(projectId)
                }
            }
        }
        
        return true
    }
}
