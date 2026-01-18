package io.mytherion.auth.util

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class CookieUtil(
        @Value("\${app.security.jwt.access-token-minutes}") private val accessTokenMinutes: Long
) {
    companion object {
        const val JWT_COOKIE_NAME = "mytherion_token"
    }

    /** Creates an httpOnly JWT cookie with security flags */
    fun createJwtCookie(token: String): Cookie {
        return Cookie(JWT_COOKIE_NAME, token).apply {
            isHttpOnly = true
            secure = false // Set to true in production with HTTPS
            path = "/"
            maxAge = (accessTokenMinutes * 60).toInt() // Convert minutes to seconds
            // SameSite=Strict is set via response header in addJwtCookie
        }
    }

    /** Adds JWT cookie to response with SameSite attribute */
    fun addJwtCookie(response: HttpServletResponse, token: String) {
        val cookie = createJwtCookie(token)

        // Set cookie via header to include SameSite attribute
        // Note: We use addHeader instead of addCookie to have full control over attributes
        val cookieHeader = buildString {
            append("${cookie.name}=${cookie.value}; ")
            append("Path=${cookie.path}; ")
            append("Max-Age=${cookie.maxAge}; ")
            append("HttpOnly; ")
            if (cookie.secure) append("Secure; ")
            append("SameSite=Strict")
        }
        response.addHeader("Set-Cookie", cookieHeader)
    }

    /** Extracts JWT token from cookie */
    fun getJwtFromCookie(request: HttpServletRequest): String? {
        return request.cookies?.firstOrNull { it.name == JWT_COOKIE_NAME }?.value
    }

    /** Clears the JWT cookie (for logout) */
    fun clearJwtCookie(response: HttpServletResponse) {
        // Clear cookie via header
        response.addHeader(
                "Set-Cookie",
                "${JWT_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict"
        )
    }
}
