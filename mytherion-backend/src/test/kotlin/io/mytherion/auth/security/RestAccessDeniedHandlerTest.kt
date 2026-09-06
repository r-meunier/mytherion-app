package io.mytherion.auth.security

import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponse
import io.mytherion.common.web.ErrorResponseWriter
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.access.AccessDeniedException
import tools.jackson.databind.ObjectMapper

/**
 * Covers serialisation only. Whether Spring actually invokes this handler is a separate
 * question, answered by `UserControllerSecurityIntegrationTest` — method security never
 * reaches here, which is precisely how a 500 hid behind green unit tests.
 */
class RestAccessDeniedHandlerTest {

    private val objectMapper = ObjectMapper()
    private val handler = RestAccessDeniedHandler(ErrorResponseWriter(objectMapper))

    @Test
    fun `handle sets 403 status and writes ErrorResponse payload`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        handler.handle(request, response, AccessDeniedException("Access denied to requested resource"))

        assertEquals(HttpStatus.FORBIDDEN.value(), response.status)
        assertTrue(response.contentType?.contains("application/json") == true)
        assertEquals("UTF-8", response.characterEncoding)

        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(403, error.status)
        assertEquals("Forbidden", error.error)
        assertEquals(ErrorMessages.ACCESS_DENIED, error.message)
        assertNotNull(error.timestamp)
    }

    @Test
    fun `message is fixed and does not echo the exception`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        // The cause varies (missing role, denied voter, method security). Echoing it would make
        // the body differ between the two 403 paths and tell an unauthorised caller why.
        handler.handle(request, response, AccessDeniedException("user lacks ROLE_ADMIN on /api/user"))

        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(ErrorMessages.ACCESS_DENIED, error.message)
    }

    @Test
    fun `null exception message does not produce a null body`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val exception = object : AccessDeniedException("temp") {
            override val message: String? = null
        }

        handler.handle(request, response, exception)

        assertEquals(403, response.status)
        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(ErrorMessages.ACCESS_DENIED, error.message)
        assertNotNull(error.timestamp)
    }
}
