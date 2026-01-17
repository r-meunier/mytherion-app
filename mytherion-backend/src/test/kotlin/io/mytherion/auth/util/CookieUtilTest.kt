package io.mytherion.auth.util

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*

class CookieUtilTest {

    private lateinit var cookieUtil: CookieUtil
    private lateinit var request: HttpServletRequest
    private lateinit var response: HttpServletResponse

    @BeforeEach
    fun setUp() {
        cookieUtil = CookieUtil(accessTokenMinutes = 1440) // 24 hours
        request = mock(HttpServletRequest::class.java)
        response = mock(HttpServletResponse::class.java)
    }

    // ==================== Create JWT Cookie Tests ====================

    @Test
    fun `createJwtCookie should create cookie with correct properties`() {
        // Given
        val token = "test-jwt-token"

        // When
        val cookie = cookieUtil.createJwtCookie(token)

        // Then
        assertEquals(CookieUtil.JWT_COOKIE_NAME, cookie.name)
        assertEquals(token, cookie.value)
        assertTrue(cookie.isHttpOnly)
        assertFalse(cookie.secure) // Development mode
        assertEquals("/", cookie.path)
        assertEquals(86400, cookie.maxAge) // 1440 minutes = 86400 seconds
    }

    // ==================== Get JWT From Cookie Tests ====================

    @Test
    fun `getJwtFromCookie should return token when cookie exists`() {
        // Given
        val expectedToken = "test-jwt-token"
        val cookies =
                arrayOf(
                        Cookie("other_cookie", "other_value"),
                        Cookie(CookieUtil.JWT_COOKIE_NAME, expectedToken),
                        Cookie("another_cookie", "another_value")
                )
        `when`(request.cookies).thenReturn(cookies)

        // When
        val result = cookieUtil.getJwtFromCookie(request)

        // Then
        assertEquals(expectedToken, result)
    }

    @Test
    fun `getJwtFromCookie should return null when cookie does not exist`() {
        // Given
        val cookies =
                arrayOf(
                        Cookie("other_cookie", "other_value"),
                        Cookie("another_cookie", "another_value")
                )
        `when`(request.cookies).thenReturn(cookies)

        // When
        val result = cookieUtil.getJwtFromCookie(request)

        // Then
        assertNull(result)
    }

    @Test
    fun `getJwtFromCookie should return null when no cookies present`() {
        // Given
        `when`(request.cookies).thenReturn(null)

        // When
        val result = cookieUtil.getJwtFromCookie(request)

        // Then
        assertNull(result)
    }

    @Test
    fun `getJwtFromCookie should return null when cookies array is empty`() {
        // Given
        `when`(request.cookies).thenReturn(emptyArray())

        // When
        val result = cookieUtil.getJwtFromCookie(request)

        // Then
        assertNull(result)
    }

    // ==================== Add JWT Cookie Tests ====================

    @Test
    fun `addJwtCookie should add cookie to response`() {
        // Given
        val token = "test-jwt-token"

        // When
        cookieUtil.addJwtCookie(response, token)

        // Then
        verify(response, atLeastOnce()).addCookie(any(Cookie::class.java))
        verify(response, atLeastOnce()).addHeader(eq("Set-Cookie"), anyString())
    }

    // ==================== Clear JWT Cookie Tests ====================

    @Test
    fun `clearJwtCookie should set cookie with max age 0`() {
        // When
        cookieUtil.clearJwtCookie(response)

        // Then
        verify(response, atLeastOnce()).addCookie(any(Cookie::class.java))
        verify(response, atLeastOnce()).addHeader(eq("Set-Cookie"), contains("Max-Age=0"))
    }

    @Test
    fun `clearJwtCookie should include HttpOnly in header`() {
        // When
        cookieUtil.clearJwtCookie(response)

        // Then
        verify(response, atLeastOnce()).addHeader(eq("Set-Cookie"), contains("HttpOnly"))
    }

    @Test
    fun `clearJwtCookie should include SameSite=Strict in header`() {
        // When
        cookieUtil.clearJwtCookie(response)

        // Then
        verify(response, atLeastOnce()).addHeader(eq("Set-Cookie"), contains("SameSite=Strict"))
    }
}
