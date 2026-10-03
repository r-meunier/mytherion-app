package io.mytherion.common.web

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.springframework.http.HttpStatusCode

class ErrorResponseTest {

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource(
        "400, BAD_REQUEST, Bad Request",
        "401, UNAUTHENTICATED, Unauthorized",
        "403, ACCESS_DENIED, Forbidden",
        "404, NOT_FOUND, Not Found",
        "405, METHOD_NOT_ALLOWED, Method Not Allowed",
        "406, NOT_ACCEPTABLE, Not Acceptable",
        "413, FILE_TOO_LARGE, Content Too Large",
        "415, UNSUPPORTED_MEDIA_TYPE, Unsupported Media Type",
        "503, SERVICE_UNAVAILABLE, An unexpected error occurred",
        "500, INTERNAL_ERROR, An unexpected error occurred",
        "502, INTERNAL_ERROR, An unexpected error occurred",
    )
    fun `generic maps a bare status to its code and a safe message`(status: Int, code: ErrorCode, message: String) {
        assertEquals(code to message, ErrorResponse.generic(HttpStatusCode.valueOf(status)))
    }
}
