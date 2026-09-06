package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.InsufficientAuthenticationException
import tools.jackson.databind.ObjectMapper

class RestAuthenticationEntryPointTest {

    private val objectMapper = ObjectMapper()
    private val entryPoint = RestAuthenticationEntryPoint(objectMapper)

    @Test
    fun `commence sets 401 status and writes ErrorResponse payload`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val exception = InsufficientAuthenticationException("Full authentication is required to access this resource")

        entryPoint.commence(request, response, exception)

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.status)
        assertTrue(response.contentType?.contains("application/json") == true)
        assertEquals("UTF-8", response.characterEncoding)

        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(401, error.status)
        assertEquals("Unauthorized", error.error)
        assertEquals("Full authentication is required to access this resource", error.message)
        assertNotNull(error.timestamp)
    }

    @Test
    fun `commence uses custom exception message when provided`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        val exception = BadCredentialsException("Invalid token signature")

        entryPoint.commence(request, response, exception)

        assertEquals(401, response.status)
        val error = objectMapper.readValue(response.contentAsString, ErrorResponse::class.java)
        assertEquals(401, error.status)
        assertEquals("Unauthorized", error.error)
        assertEquals("Invalid token signature", error.message)
        assertNotNull(error.timestamp)
    }
}
