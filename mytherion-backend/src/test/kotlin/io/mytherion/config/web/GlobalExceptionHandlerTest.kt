package io.mytherion.config.web

import io.mockk.every
import io.mockk.mockk
import io.mytherion.common.exception.ApiException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException

class GlobalExceptionHandlerTest {

    private val handler = GlobalExceptionHandler()

    private class TestApiException(
        status: HttpStatus,
        error: String,
        message: String
    ) : ApiException(status, error, message)

    @Test
    fun `handleApiException maps status, error, and message correctly`() {
        val ex = TestApiException(HttpStatus.NOT_FOUND, "Not Found", "Resource not found")
        val response = handler.handleApiException(ex)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        val body = response.body!!
        assertEquals(404, body.status)
        assertEquals("Not Found", body.error)
        assertEquals("Resource not found", body.message)
        assertNotNull(body.timestamp)
    }

    @Test
    fun `handleApiException handles 409 Conflict properly`() {
        val ex = TestApiException(HttpStatus.CONFLICT, "Conflict", "Entity has dependencies")
        val response = handler.handleApiException(ex)

        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        val body = response.body!!
        assertEquals(409, body.status)
        assertEquals("Conflict", body.error)
        assertEquals("Entity has dependencies", body.message)
        assertNotNull(body.timestamp)
    }

    @Test
    fun `handleIllegalArgument returns 400 Bad Request`() {
        val response = handler.handleIllegalArgument(IllegalArgumentException("Invalid payload provided"))

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        val body = response.body!!
        assertEquals(400, body.status)
        assertEquals("Bad Request", body.error)
        assertEquals("Invalid payload provided", body.message)
        assertNotNull(body.timestamp)
    }

    @Test
    fun `handleValidationErrors returns 400 with field errors`() {
        val bindingResult = mockk<BindingResult>()
        val fieldError1 = FieldError("request", "name", "Name is required")
        val fieldError2 = FieldError("request", "email", "Invalid email format")
        every { bindingResult.allErrors } returns listOf(fieldError1, fieldError2)

        val ex = mockk<MethodArgumentNotValidException>()
        every { ex.bindingResult } returns bindingResult

        val response = handler.handleValidationErrors(ex)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        val body = response.body!!
        assertEquals(400, body.status)
        assertEquals("Validation Failed", body.error)
        assertEquals("Request validation failed", body.message)
        assertEquals(2, body.errors.size)
        assertEquals("Name is required", body.errors["name"])
        assertEquals("Invalid email format", body.errors["email"])
        assertNotNull(body.timestamp)
    }

    @Test
    fun `handleGenericException masks internal details and returns 500`() {
        val response = handler.handleGenericException(IllegalStateException("Sensitive database connection timeout"))

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.statusCode)
        val body = response.body!!
        assertEquals(500, body.status)
        assertEquals("Internal Server Error", body.error)
        assertEquals("An unexpected error occurred", body.message)
        assertNotNull(body.timestamp)
    }
}
