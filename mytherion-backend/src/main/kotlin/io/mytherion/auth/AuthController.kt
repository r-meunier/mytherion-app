package io.mytherion.auth

import io.mytherion.auth.dto.AuthDTO
import io.mytherion.auth.util.CookieUtil
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService, private val cookieUtil: CookieUtil) {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
            @RequestBody @Valid req: AuthDTO.RegisterRequest,
            response: HttpServletResponse
    ): AuthDTO.UserResponse {
        val authResponse = authService.register(req)
        cookieUtil.addJwtCookie(response, authResponse.accessToken)
        return authResponse.user
    }

    @PostMapping("/login")
    fun login(
            @RequestBody @Valid req: AuthDTO.LoginRequest,
            response: HttpServletResponse
    ): AuthDTO.UserResponse {
        val authResponse = authService.login(req)
        cookieUtil.addJwtCookie(response, authResponse.accessToken)
        return authResponse.user
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(response: HttpServletResponse) {
        cookieUtil.clearJwtCookie(response)
    }

    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal userId: Long?): AuthDTO.UserResponse {
        if (userId == null) {
            throw IllegalStateException("User not authenticated")
        }
        return authService.getUserById(userId)
    }
}
