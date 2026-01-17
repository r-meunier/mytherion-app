package io.mytherion.auth

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mytherion.auth.dto.AuthDTO
import io.mytherion.auth.jwt.JwtService
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import java.util.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.security.crypto.password.PasswordEncoder

@ExtendWith(MockKExtension::class)
class AuthServiceTest {

        @MockK private lateinit var userRepository: UserRepository

        @MockK private lateinit var passwordEncoder: PasswordEncoder

        @MockK private lateinit var jwtService: JwtService

        @InjectMockKs private lateinit var authService: AuthService

        private lateinit var testUser: User

        @BeforeEach
        fun setUp() {
                testUser =
                        User(
                                id = 1L,
                                email = "test@example.com",
                                username = "testuser",
                                passwordHash = "hashedPassword",
                                role = UserRole.USER
                        )
        }

        // ==================== Register Tests ====================

        @Test
        fun `register with valid data should create user and return auth response`() {
                // Given
                val request =
                        AuthDTO.RegisterRequest(
                                email = "newuser@example.com",
                                username = "newuser",
                                password = "password123"
                        )

                every { userRepository.existsByEmail(request.email) } returns false
                every { userRepository.existsByUsername(request.username) } returns false
                every { passwordEncoder.encode(request.password) } returns "hashedPassword"
                every { userRepository.save(any<User>()) } returns testUser
                every { jwtService.generateAccessToken(any(), any(), any()) } returns "jwt-token"

                // When
                val result = authService.register(request)

                // Then
                assertNotNull(result)
                assertEquals("jwt-token", result.accessToken)
                assertEquals(testUser.id, result.user.id)
                assertEquals(testUser.email, result.user.email)
                assertEquals(testUser.username, result.user.username)
                assertEquals(testUser.role.name, result.user.role)

                verify { userRepository.existsByEmail(request.email) }
                verify { userRepository.existsByUsername(request.username) }
                verify { passwordEncoder.encode(request.password) }
                verify { userRepository.save(match { it.email == request.email.lowercase() }) }
                verify {
                        jwtService.generateAccessToken(
                                testUser.id!!,
                                testUser.email,
                                testUser.role.name
                        )
                }
        }

        @Test
        fun `register with existing email should throw exception`() {
                // Given
                val request =
                        AuthDTO.RegisterRequest(
                                email = "existing@example.com",
                                username = "newuser",
                                password = "password123"
                        )

                every { userRepository.existsByEmail(request.email) } returns true

                // When & Then
                val exception =
                        assertThrows<IllegalArgumentException> { authService.register(request) }

                assertEquals("Email already in use", exception.message)
                verify { userRepository.existsByEmail(request.email) }
                verify(exactly = 0) { userRepository.save(any()) }
        }

        @Test
        fun `register with existing username should throw exception`() {
                // Given
                val request =
                        AuthDTO.RegisterRequest(
                                email = "newuser@example.com",
                                username = "existinguser",
                                password = "password123"
                        )

                every { userRepository.existsByEmail(request.email) } returns false
                every { userRepository.existsByUsername(request.username) } returns true

                // When & Then
                val exception =
                        assertThrows<IllegalArgumentException> { authService.register(request) }

                assertEquals("Username already in use", exception.message)
                verify { userRepository.existsByUsername(request.username) }
                verify(exactly = 0) { userRepository.save(any()) }
        }

        @Test
        fun `register should lowercase email`() {
                // Given
                val request =
                        AuthDTO.RegisterRequest(
                                email = "NewUser@EXAMPLE.COM",
                                username = "newuser",
                                password = "password123"
                        )

                every { userRepository.existsByEmail(request.email) } returns false
                every { userRepository.existsByUsername(request.username) } returns false
                every { passwordEncoder.encode(request.password) } returns "hashedPassword"
                every { userRepository.save(any<User>()) } returns testUser
                every { jwtService.generateAccessToken(any(), any(), any()) } returns "jwt-token"

                // When
                authService.register(request)

                // Then
                verify { userRepository.save(match { it.email == "newuser@example.com" }) }
        }

        // ==================== Login Tests ====================

        @Test
        fun `login with valid credentials should return auth response`() {
                // Given
                val request =
                        AuthDTO.LoginRequest(email = "test@example.com", password = "password123")

                every {
                        userRepository.findByEmailAndDeletedAtIsNull(request.email.lowercase())
                } returns testUser
                every { passwordEncoder.matches(request.password, testUser.passwordHash) } returns
                        true
                every { jwtService.generateAccessToken(any(), any(), any()) } returns "jwt-token"

                // When
                val result = authService.login(request)

                // Then
                assertNotNull(result)
                assertEquals("jwt-token", result.accessToken)
                assertEquals(testUser.id, result.user.id)
                assertEquals(testUser.email, result.user.email)
                assertEquals(testUser.username, result.user.username)

                verify { userRepository.findByEmailAndDeletedAtIsNull(request.email.lowercase()) }
                verify { passwordEncoder.matches(request.password, testUser.passwordHash) }
                verify {
                        jwtService.generateAccessToken(
                                testUser.id!!,
                                testUser.email,
                                testUser.role.name
                        )
                }
        }

        @Test
        fun `login with non-existent email should throw exception`() {
                // Given
                val request =
                        AuthDTO.LoginRequest(
                                email = "nonexistent@example.com",
                                password = "password123"
                        )

                every {
                        userRepository.findByEmailAndDeletedAtIsNull(request.email.lowercase())
                } returns null

                // When & Then
                val exception =
                        assertThrows<IllegalArgumentException> { authService.login(request) }

                assertEquals("Invalid credentials", exception.message)
                verify { userRepository.findByEmailAndDeletedAtIsNull(request.email.lowercase()) }
                verify(exactly = 0) { passwordEncoder.matches(any(), any()) }
        }

        @Test
        fun `login with wrong password should throw exception`() {
                // Given
                val request =
                        AuthDTO.LoginRequest(email = "test@example.com", password = "wrongpassword")

                every {
                        userRepository.findByEmailAndDeletedAtIsNull(request.email.lowercase())
                } returns testUser
                every { passwordEncoder.matches(request.password, testUser.passwordHash) } returns
                        false

                // When & Then
                val exception =
                        assertThrows<IllegalArgumentException> { authService.login(request) }

                assertEquals("Invalid credentials", exception.message)
                verify { passwordEncoder.matches(request.password, testUser.passwordHash) }
                verify(exactly = 0) { jwtService.generateAccessToken(any(), any(), any()) }
        }

        @Test
        fun `login should lowercase email`() {
                // Given
                val request =
                        AuthDTO.LoginRequest(email = "TEST@EXAMPLE.COM", password = "password123")

                every { userRepository.findByEmailAndDeletedAtIsNull("test@example.com") } returns
                        testUser
                every { passwordEncoder.matches(request.password, testUser.passwordHash) } returns
                        true
                every { jwtService.generateAccessToken(any(), any(), any()) } returns "jwt-token"

                // When
                authService.login(request)

                // Then
                verify { userRepository.findByEmailAndDeletedAtIsNull("test@example.com") }
        }

        // ==================== Get User By ID Tests ====================

        @Test
        fun `getUserById with valid id should return user response`() {
                // Given
                every { userRepository.findById(1L) } returns Optional.of(testUser)

                // When
                val result = authService.getUserById(1L)

                // Then
                assertNotNull(result)
                assertEquals(testUser.id, result.id)
                assertEquals(testUser.email, result.email)
                assertEquals(testUser.username, result.username)
                assertEquals(testUser.role.name, result.role)

                verify { userRepository.findById(1L) }
        }

        @Test
        fun `getUserById with non-existent id should throw exception`() {
                // Given
                every { userRepository.findById(999L) } returns Optional.empty()

                // When & Then
                val exception =
                        assertThrows<IllegalArgumentException> { authService.getUserById(999L) }

                assertEquals("User not found", exception.message)
                verify { userRepository.findById(999L) }
        }

        @Test
        fun `getUserById with deleted user should throw exception`() {
                // Given
                val deletedUser =
                        User(
                                id = 1L,
                                email = "test@example.com",
                                username = "testuser",
                                passwordHash = "hashedPassword",
                                role = UserRole.USER,
                                deletedAt = java.time.Instant.now()
                        )

                every { userRepository.findById(1L) } returns Optional.of(deletedUser)

                // When & Then
                val exception =
                        assertThrows<IllegalArgumentException> { authService.getUserById(1L) }

                assertEquals("User not found", exception.message)
                verify { userRepository.findById(1L) }
        }
}
