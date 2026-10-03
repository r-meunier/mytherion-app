package io.mytherion.config.web

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import jakarta.validation.ConstraintViolationException
import jakarta.validation.Validation
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.authorization.AuthorizationDecision
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.RequestBuilder
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.util.unit.DataSize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MaxUploadSizeExceededException
import tools.jackson.databind.json.JsonMapper
import java.util.UUID
import java.util.stream.Stream

/**
 * Drives real requests through `DispatcherServlet` rather than calling handler methods directly.
 *
 * Most of what this class guards is *dispatch*: which of our handlers, or which of
 * `ResponseEntityExceptionHandler`'s, Spring picks for a given exception. Calling a handler method
 * by hand proves nothing about that — it is exactly how the original 500-for-malformed-JSON bug
 * stayed invisible.
 */
class GlobalExceptionHandlerTest {

    private class TestApiException : ApiException(HttpStatus.CONFLICT, ErrorCode.PROJECT_HAS_ENTRIES, "Still has entries")

    data class Body(@field:NotBlank(message = "Name is required") val name: String = "")

    @RestController
    class ProbeController {
        @PostMapping("/probe/body") fun body(@Valid @RequestBody body: Body) = body
        @GetMapping("/probe/id/{id}") fun byId(@PathVariable id: UUID) = id
        @GetMapping("/probe/param") fun param(@RequestParam token: String) = token
        @GetMapping("/probe/api") fun api(): Nothing = throw TestApiException()
        @GetMapping("/probe/denied") fun denied(): Nothing =
            throw AuthorizationDeniedException("Access Denied: hasRole('ADMIN')", AuthorizationDecision(false))
        @GetMapping("/probe/too-large") fun tooLarge(): Nothing = throw MaxUploadSizeExceededException(-1)
        @GetMapping("/probe/constraint") fun constraint(): Nothing =
            throw ConstraintViolationException(
                Validation.buildDefaultValidatorFactory().validator.validate(Body(name = ""))
            )
        @GetMapping("/probe/boom") fun boom(): Nothing = throw IllegalStateException("db password is hunter2")
        @GetMapping("/probe/iae") fun iae(): Nothing = throw IllegalArgumentException("internal detail")
    }

    private val mvc: MockMvc =
        MockMvcBuilders.standaloneSetup(ProbeController())
            .setControllerAdvice(GlobalExceptionHandler(DataSize.ofMegabytes(5)))
            .build()

    private fun expectError(request: RequestBuilder, status: HttpStatus, code: ErrorCode) =
        mvc.perform(request)
            .andExpect(status().`is`(status.value()))
            .andExpect(jsonPath("$.status").value(status.value()))
            .andExpect(jsonPath("$.error").value(status.reasonPhrase))
            .andExpect(jsonPath("$.code").value(code.name))
            .andExpect(jsonPath("$.timestamp").exists())

    // ── The contract: one shape, whatever the path ──

    @ParameterizedTest(name = "{0}")
    @MethodSource("everyErrorPath")
    fun `every error path returns the same set of fields`(
        label: String,
        request: RequestBuilder,
        status: HttpStatus,
        code: ErrorCode,
        hasFieldErrors: Boolean
    ) {
        val body = expectError(request, status, code).andReturn().response.contentAsString
        val expected = mutableSetOf("status", "error", "code", "message", "path", "timestamp")
        if (hasFieldErrors) expected += "errors"

        assertEquals(expected, JsonMapper.builder().build().readTree(body).propertyNames().toSet())
    }

    // ── What each path says ──

    @Test
    fun `ApiException renders its own status, code and message`() {
        expectError(get("/probe/api"), HttpStatus.CONFLICT, ErrorCode.PROJECT_HAS_ENTRIES)
            .andExpect(jsonPath("$.message").value("Still has entries"))
            .andExpect(jsonPath("$.path").value("/probe/api"))
    }

    @Test
    fun `method-security denial is 403 with the fixed message, not the exception's`() {
        expectError(get("/probe/denied"), HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED)
            .andExpect(jsonPath("$.message").value("Access denied"))
    }

    @Test
    fun `bean validation lists each failing field`() {
        expectError(
            post("/probe/body").contentType(MediaType.APPLICATION_JSON).content("""{"name":""}"""),
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_FAILED
        )
            .andExpect(jsonPath("$.message").value("Request validation failed"))
            .andExpect(jsonPath("$.errors.name").value("Name is required"))
    }

    @Test
    fun `constraint violations outside MVC binding are 400 with field errors too`() {
        expectError(get("/probe/constraint"), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED)
            .andExpect(jsonPath("$.errors.name").value("Name is required"))
    }

    @Test
    fun `malformed JSON is 400 and does not echo the parser's message`() {
        expectError(
            post("/probe/body").contentType(MediaType.APPLICATION_JSON).content("{bad"),
            HttpStatus.BAD_REQUEST,
            ErrorCode.MALFORMED_REQUEST
        ).andExpect(jsonPath("$.message").value("Malformed request body"))
    }

    @Test
    fun `wrongly typed path variable is 400 naming the parameter, not the value`() {
        expectError(get("/probe/id/not-a-uuid"), HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER)
            .andExpect(jsonPath("$.message").value("Invalid value for parameter 'id'"))
    }

    @Test
    fun `missing query parameter is 400`() {
        expectError(get("/probe/param"), HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER)
            .andExpect(jsonPath("$.message").value("Missing required parameter 'token'"))
    }

    @Test
    fun `path never includes the query string`() {
        expectError(get("/probe/id/not-a-uuid?token=secret"), HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER)
            .andExpect(jsonPath("$.path").value("/probe/id/not-a-uuid"))
    }

    @Test
    fun `unmapped route is 404`() {
        expectError(get("/probe/nowhere"), HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND)
    }

    @Test
    fun `wrong method is 405`() {
        expectError(delete("/probe/param"), HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.METHOD_NOT_ALLOWED)
    }

    @Test
    fun `wrong content type is 415`() {
        expectError(
            post("/probe/body").contentType(MediaType.TEXT_PLAIN).content("x"),
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            ErrorCode.UNSUPPORTED_MEDIA_TYPE
        )
    }

    @Test
    fun `oversized upload is 413 quoting the configured limit`() {
        expectError(get("/probe/too-large"), HttpStatus.CONTENT_TOO_LARGE, ErrorCode.FILE_TOO_LARGE)
            .andExpect(jsonPath("$.message").value("File exceeds the 5MB upload limit"))
    }

    @Test
    fun `unexpected exception is a masked 500`() {
        expectError(get("/probe/boom"), HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR)
            .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
    }

    @Test
    fun `IllegalArgumentException is a bug, not a client error - masked 500`() {
        expectError(get("/probe/iae"), HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR)
            .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
    }

    companion object {
        @JvmStatic
        fun everyErrorPath(): Stream<org.junit.jupiter.params.provider.Arguments> = Stream.of(
            args("ApiException", get("/probe/api"), HttpStatus.CONFLICT, ErrorCode.PROJECT_HAS_ENTRIES),
            args("method security", get("/probe/denied"), HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED),
            args(
                "bean validation",
                post("/probe/body").contentType(MediaType.APPLICATION_JSON).content("""{"name":""}"""),
                HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, hasFieldErrors = true
            ),
            args(
                "malformed JSON",
                post("/probe/body").contentType(MediaType.APPLICATION_JSON).content("{bad"),
                HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST
            ),
            args("type mismatch", get("/probe/id/x"), HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER),
            args("unmapped route", get("/probe/nowhere"), HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND),
            args("wrong method", delete("/probe/param"), HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.METHOD_NOT_ALLOWED),
            args("oversized upload", get("/probe/too-large"), HttpStatus.CONTENT_TOO_LARGE, ErrorCode.FILE_TOO_LARGE),
            args("unexpected", get("/probe/boom"), HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR),
        )

        private fun args(
            label: String,
            request: RequestBuilder,
            status: HttpStatus,
            code: ErrorCode,
            hasFieldErrors: Boolean = false
        ) = org.junit.jupiter.params.provider.Arguments.of(label, request, status, code, hasFieldErrors)
    }
}
