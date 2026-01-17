package io.mytherion.auth

import com.fasterxml.jackson.databind.ObjectMapper
import io.mytherion.auth.dto.AuthDTO
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired private lateinit var mockMvc: MockMvc

    @Autowired private lateinit var objectMapper: ObjectMapper

    @Autowired private lateinit var userRepository: UserRepository

    @AfterEach
    fun cleanup() {
        userRepository.deleteAll()
    }

    // ==================== Register Tests ====================

    @Test
    fun `POST register with valid data should return 201 and set cookie`() {
        // Given
        val request =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )

        // When & Then
        val result =
                mockMvc.perform(
                                post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                        )
                        .andExpect(status().isCreated)
                        .andExpect(jsonPath("$.id").exists())
                        .andExpect(jsonPath("$.email").value("test@example.com"))
                        .andExpect(jsonPath("$.username").value("testuser"))
                        .andExpect(jsonPath("$.role").value("USER"))
                        .andExpect(cookie().exists("mytherion_token"))
                        .andExpect(cookie().httpOnly("mytherion_token", true))
                        .andExpect(cookie().path("mytherion_token", "/"))
                        .andReturn()

        // Verify cookie is set
        val cookie = result.response.getCookie("mytherion_token")
        assertNotNull(cookie)
        assertNotNull(cookie!!.value)
        assertTrue(cookie.value.isNotEmpty())

        // Verify user is saved in database
        val savedUser = userRepository.findByEmailAndDeletedAtIsNull("test@example.com")
        assertNotNull(savedUser)
        assertEquals("testuser", savedUser!!.username)
        assertEquals(UserRole.USER, savedUser.role)
    }

    @Test
    fun `POST register with duplicate email should return 400`() {
        // Given - Create existing user
        val existingRequest =
                AuthDTO.RegisterRequest(
                        email = "existing@example.com",
                        username = "existinguser",
                        password = "password123"
                )
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(existingRequest))
        )

        // When & Then - Try to register with same email
        val duplicateRequest =
                AuthDTO.RegisterRequest(
                        email = "existing@example.com",
                        username = "newuser",
                        password = "password123"
                )

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(duplicateRequest))
                )
                .andExpect(status().isBadRequest)
                .andExpect(cookie().doesNotExist("mytherion_token"))
    }

    @Test
    fun `POST register with duplicate username should return 400`() {
        // Given - Create existing user
        val existingRequest =
                AuthDTO.RegisterRequest(
                        email = "existing@example.com",
                        username = "existinguser",
                        password = "password123"
                )
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(existingRequest))
        )

        // When & Then - Try to register with same username
        val duplicateRequest =
                AuthDTO.RegisterRequest(
                        email = "newuser@example.com",
                        username = "existinguser",
                        password = "password123"
                )

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(duplicateRequest))
                )
                .andExpect(status().isBadRequest)
                .andExpect(cookie().doesNotExist("mytherion_token"))
    }

    // ==================== Login Tests ====================

    @Test
    fun `POST login with valid credentials should return 200 and set cookie`() {
        // Given - Register a user first
        val registerRequest =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest))
        )

        // When & Then - Login with correct credentials
        val loginRequest =
                AuthDTO.LoginRequest(email = "test@example.com", password = "password123")

        val result =
                mockMvc.perform(
                                post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(loginRequest))
                        )
                        .andExpect(status().isOk)
                        .andExpect(jsonPath("$.id").exists())
                        .andExpect(jsonPath("$.email").value("test@example.com"))
                        .andExpect(jsonPath("$.username").value("testuser"))
                        .andExpect(jsonPath("$.role").value("USER"))
                        .andExpect(cookie().exists("mytherion_token"))
                        .andExpect(cookie().httpOnly("mytherion_token", true))
                        .andReturn()

        // Verify cookie is set
        val cookie = result.response.getCookie("mytherion_token")
        assertNotNull(cookie)
        assertNotNull(cookie!!.value)
    }

    @Test
    fun `POST login with wrong password should return 400`() {
        // Given - Register a user first
        val registerRequest =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest))
        )

        // When & Then - Login with wrong password
        val loginRequest =
                AuthDTO.LoginRequest(email = "test@example.com", password = "wrongpassword")

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest))
                )
                .andExpect(status().isBadRequest)
                .andExpect(cookie().doesNotExist("mytherion_token"))
    }

    @Test
    fun `POST login with non-existent email should return 400`() {
        // When & Then
        val loginRequest =
                AuthDTO.LoginRequest(email = "nonexistent@example.com", password = "password123")

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest))
                )
                .andExpect(status().isBadRequest)
                .andExpect(cookie().doesNotExist("mytherion_token"))
    }

    // ==================== Logout Tests ====================

    @Test
    fun `POST logout should clear cookie`() {
        // When & Then
        val result =
                mockMvc.perform(post("/api/auth/logout"))
                        .andExpect(status().isNoContent)
                        .andExpect(cookie().exists("mytherion_token"))
                        .andExpect(cookie().maxAge("mytherion_token", 0))
                        .andReturn()

        // Verify cookie is cleared (maxAge = 0)
        val cookie = result.response.getCookie("mytherion_token")
        assertNotNull(cookie)
        assertEquals(0, cookie!!.maxAge)
    }

    // ==================== Get Current User Tests ====================

    @Test
    fun `GET me with valid cookie should return user info`() {
        // Given - Register and get cookie
        val registerRequest =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )
        val registerResult =
                mockMvc.perform(
                                post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(registerRequest))
                        )
                        .andReturn()

        val cookie = registerResult.response.getCookie("mytherion_token")
        assertNotNull(cookie)

        // When & Then - Call /me with cookie
        mockMvc.perform(get("/api/auth/me").cookie(cookie!!))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("USER"))
    }

    @Test
    fun `GET me without cookie should return 401`() {
        // When & Then
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized)
    }

    @Test
    fun `GET me with invalid cookie should return 401`() {
        // Given - Invalid cookie
        val invalidCookie = Cookie("mytherion_token", "invalid-jwt-token")

        // When & Then
        mockMvc.perform(get("/api/auth/me").cookie(invalidCookie))
                .andExpect(status().isUnauthorized)
    }

    // ==================== CORS Tests ====================

    @Test
    fun `CORS should allow requests from localhost 3000`() {
        // When & Then
        mockMvc.perform(
                        options("/api/auth/login")
                                .header("Origin", "http://localhost:3000")
                                .header("Access-Control-Request-Method", "POST")
                )
                .andExpect(status().isOk)
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
    }

    @Test
    fun `CORS should allow requests from localhost 3001`() {
        // When & Then
        mockMvc.perform(
                        options("/api/auth/login")
                                .header("Origin", "http://localhost:3001")
                                .header("Access-Control-Request-Method", "POST")
                )
                .andExpect(status().isOk)
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3001"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
    }

    // ==================== Session Persistence Tests ====================

    @Test
    fun `Cookie should persist across multiple requests`() {
        // Given - Register and get cookie
        val registerRequest =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )
        val registerResult =
                mockMvc.perform(
                                post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(registerRequest))
                        )
                        .andReturn()

        val cookie = registerResult.response.getCookie("mytherion_token")
        assertNotNull(cookie)

        // When & Then - Use cookie in multiple requests
        // Request 1: Get user info
        mockMvc.perform(get("/api/auth/me").cookie(cookie!!))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.email").value("test@example.com"))

        // Request 2: Get user info again (same cookie)
        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.email").value("test@example.com"))
    }

    @Test
    fun `After logout cookie should be invalid`() {
        // Given - Register and get cookie
        val registerRequest =
                AuthDTO.RegisterRequest(
                        email = "test@example.com",
                        username = "testuser",
                        password = "password123"
                )
        val registerResult =
                mockMvc.perform(
                                post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(registerRequest))
                        )
                        .andReturn()

        val cookie = registerResult.response.getCookie("mytherion_token")
        assertNotNull(cookie)

        // Verify cookie works
        mockMvc.perform(get("/api/auth/me").cookie(cookie!!)).andExpect(status().isOk)

        // When - Logout
        val logoutResult = mockMvc.perform(post("/api/auth/logout")).andReturn()
        val clearedCookie = logoutResult.response.getCookie("mytherion_token")

        // Then - Cookie should be cleared (maxAge = 0)
        assertNotNull(clearedCookie)
        assertEquals(0, clearedCookie!!.maxAge)

        // Verify old cookie no longer works (using cleared cookie)
        mockMvc.perform(get("/api/auth/me").cookie(clearedCookie))
                .andExpect(status().isUnauthorized)
    }
}
