package io.mytherion.auth.jwt

import io.mytherion.auth.util.CookieUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(private val jwtService: JwtService, private val cookieUtil: CookieUtil) :
        OncePerRequestFilter() {

    override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
    ) {
        // Try to get token from cookie first
        var token = cookieUtil.getJwtFromCookie(request)

        // Fall back to Authorization header if no cookie
        if (token == null) {
            val header = request.getHeader("Authorization")
            if (header != null && header.startsWith("Bearer ")) {
                token = header.removePrefix("Bearer ").trim()
            }
        }

        // If no token found, continue without authentication
        if (token == null) {
            filterChain.doFilter(request, response)
            return
        }

        try {
            val claims = jwtService.parseAndValidate(token)
            val userId = claims.subject.toLong()
            val role = claims["role"]?.toString() ?: "USER"

            val auth =
                    UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            listOf(SimpleGrantedAuthority("ROLE_$role"))
                    )
            SecurityContextHolder.getContext().authentication = auth
        } catch (_: Exception) {
            // invalid token -> treat as anonymous
            SecurityContextHolder.clearContext()
        }

        filterChain.doFilter(request, response)
    }
}
