package io.mytherion.project.security

import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.web.servlet.HandlerMapping
import java.util.UUID

class ProjectAccessInterceptorTest {

    private lateinit var projectRepository: ProjectRepository
    private lateinit var currentUserProvider: CurrentUserProvider
    private lateinit var interceptor: ProjectAccessInterceptor

    private lateinit var request: HttpServletRequest
    private lateinit var response: HttpServletResponse
    private lateinit var testUser: User

    private val validProjectId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @BeforeEach
    fun setup() {
        projectRepository = mockk()
        currentUserProvider = mockk()
        request = mockk(relaxed = true)
        response = mockk(relaxed = true)

        interceptor = ProjectAccessInterceptor(projectRepository, currentUserProvider)

        testUser =
            User(
                username = "testuser",
                email = "test@example.com",
                passwordHash = "hashedpassword",
                emailVerified = true
            ).apply {
                this.id = UUID.fromString("00000000-0000-0000-0000-000000000001")
            }

        every { currentUserProvider.getCurrentUser() } returns testUser
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `preHandle when no URI template variables attribute should return true`() {
        every { request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) } returns null

        val result = interceptor.preHandle(request, response, Any())

        assertTrue(result)
        verify(exactly = 0) { response.sendError(any(), any()) }
    }

    @Test
    fun `preHandle when projectId path variable is missing should return true`() {
        every { request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) } returns mapOf("entryId" to "123")

        val result = interceptor.preHandle(request, response, Any())

        assertTrue(result)
        verify(exactly = 0) { response.sendError(any(), any()) }
    }

    @Test
    fun `preHandle when projectId is invalid UUID should return true and leave conversion to framework`() {
        every { request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) } returns mapOf("projectId" to "not-a-uuid")

        val result = interceptor.preHandle(request, response, Any())

        assertTrue(result)
        verify(exactly = 0) { response.sendError(any(), any()) }
    }

    @Test
    fun `preHandle when project exists and belongs to current user should return true`() {
        every { request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) } returns mapOf("projectId" to validProjectId.toString())
        every { projectRepository.existsByIdAndOwnerAndDeletedAtIsNull(validProjectId, testUser) } returns true

        val result = interceptor.preHandle(request, response, Any())

        assertTrue(result)
        verify(exactly = 0) { response.sendError(any(), any()) }
    }

    @Test
    fun `preHandle when project does not exist or does not belong to user should throw ProjectAccessDeniedException`() {
        every { request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) } returns mapOf("projectId" to validProjectId.toString())
        every { projectRepository.existsByIdAndOwnerAndDeletedAtIsNull(validProjectId, testUser) } returns false

        assertThrows<ProjectAccessDeniedException> {
            interceptor.preHandle(request, response, Any())
        }
    }

    @Test
    fun `denial carries the standard ApiException mapping rather than a container error`() {
        every { request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE) } returns mapOf("projectId" to validProjectId.toString())
        every { projectRepository.existsByIdAndOwnerAndDeletedAtIsNull(validProjectId, testUser) } returns false

        val thrown = assertThrows<ProjectAccessDeniedException> {
            interceptor.preHandle(request, response, Any())
        }

        // Routed through GlobalExceptionHandler, so tenant-isolation denials share the
        // ErrorResponse shape with every other error rather than the servlet default.
        assertEquals(HttpStatus.FORBIDDEN, thrown.status)
        assertEquals("Forbidden", thrown.error)
        assertEquals("Access denied to project with id $validProjectId", thrown.message)

        // The interceptor must not also write to the response, or the body would be committed
        // before the exception resolver can render the standard payload.
        verify(exactly = 0) { response.sendError(any(), any()) }
        verify(exactly = 0) { response.sendError(any()) }
    }
}
