package io.mytherion.auth

import io.mytherion.auth.dto.AuthDTO
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(@RequestBody @Valid req: AuthDTO.RegisterRequest): AuthDTO.AuthResponse =
        authService.register(req)

    @PostMapping("/login")
    fun login(@RequestBody @Valid req: AuthDTO.LoginRequest): AuthDTO.AuthResponse =
        authService.login(req)
}
