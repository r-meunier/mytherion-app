package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.access.AccessDeniedException
import tools.jackson.databind.ObjectMapper

class RestAccessDeniedHandlerTest {

    private val objectMapper = ObjectMapper()
    private val handler = RestAccessDeniedHandler(objectMapper)

    @Test
    fun `handle sets 403 status and writes ErrorResponse payload`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val exception = AccessDeniedException("Access denied to requested resource")

        handler.handle(request, response, exception)

        assertEquals(HttpStatus.FORBIDDEN.value(), response.status)
        assertTrue(response.contentType?.contains("application/json") == true)
        assertEquals("UTF-8", response.characterEncoding)

        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(403, error.status)
        assertEquals("Forbidden", error.error)
        assertEquals("Access denied to requested resource", error.message)
        assertNotNull(error.timestamp)
    }

    @Test
    fun `handle sets 403 status with default message when exception message is null`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val exception = object : AccessDeniedException("temp") {
            override val message: String? = null
        }

        handler.handle(request, response, exception)

        assertEquals(403, response.status)
        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(403, error.status)
        assertEquals("Forbidden", error.error)
        assertEquals("Access denied", error.message)
        assertNotNull(error.timestamp)
    }
}
