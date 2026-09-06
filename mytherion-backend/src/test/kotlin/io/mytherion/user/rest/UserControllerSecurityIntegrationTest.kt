package io.mytherion.user.rest

import io.mytherion.auth.jwt.JwtService
import io.mytherion.common.web.ErrorMessages
import io.mytherion.support.IntegrationTest
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.web.client.RestClient
import java.util.UUID

/**
 * End-to-end coverage for the `@PreAuthorize("hasRole('ADMIN')")` guard on `GET /api/user`.
 *
 * Method security throws inside the controller invocation, so `DispatcherServlet` catches it and
 * offers it to `GlobalExceptionHandler` — it never reaches `RestAccessDeniedHandler`. Before
 * `handleAccessDenied` existed, the catch-all claimed it and a non-admin received
 * `500 An unexpected error occurred` instead of 403.
 *
 * A unit test on the handler cannot catch that, because the handler is never invoked. Only a real
 * request through the full filter chain and dispatcher can. Hence this test.
 *
 * Creates only the users it needs and deletes them again — it must not call `deleteAll()`, which
 * would destroy local development data.
 */
@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerSecurityIntegrationTest {

    @LocalServerPort private var port: Int = 0

    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var jwtService: JwtService

    private lateinit var client: RestClient
    private val created = mutableListOf<UUID>()

    @BeforeEach
    fun setUp() {
        client = RestClient.builder().baseUrl("http://localhost:$port").build()
    }

    @AfterEach
    fun tearDown() {
        created.forEach { userRepository.deleteById(it) }
        created.clear()
    }

    private fun createUser(role: UserRole): Pair<User, String> {
        val suffix = UUID.randomUUID().toString().take(8)
        val user = userRepository.save(
            User(
                username = "sec_${role.name.lowercase()}_$suffix",
                email = "sec_${role.name.lowercase()}_$suffix@security.dev",
                passwordHash = "hash",
                role = role,
                emailVerified = true
            )
        )
        created += user.id!!
        return user to jwtService.generateAccessToken(user.id!!, user.email, user.role.name)
    }

    private fun getUsers(token: String?) = client.get()
        .uri("/api/user")
        .apply { if (token != null) header(HttpHeaders.AUTHORIZATION, "Bearer $token") }
        .exchange { _, res ->
            res.statusCode to runCatching {
                res.bodyTo(object : ParameterizedTypeReference<Map<String, Any>>() {})
            }.getOrNull()
        }

    @Test
    fun `non-admin is denied with 403 and the standard error schema, not a 500`() {
        val (_, token) = createUser(UserRole.USER)

        val (status, body) = getUsers(token)

        // Regression guard: this returned 500 before GlobalExceptionHandler.handleAccessDenied,
        // because the catch-all @ExceptionHandler(Exception) claimed AccessDeniedException.
        assertEquals(HttpStatus.FORBIDDEN, status, "an authorization failure must not surface as a server error")

        assertNotNull(body, "403 should carry a parseable JSON body")
        assertEquals(403, (body!!["status"] as Number).toInt())
        assertEquals("Forbidden", body["error"])
        assertEquals(ErrorMessages.ACCESS_DENIED, body["message"])
        assertNotNull(body["timestamp"], "ErrorResponse should carry a timestamp")
    }

    @Test
    fun `unauthenticated caller is denied with 401 and the standard error schema`() {
        val (status, body) = getUsers(null)

        assertEquals(HttpStatus.UNAUTHORIZED, status)
        assertNotNull(body)
        assertEquals(401, (body!!["status"] as Number).toInt())
        assertEquals("Unauthorized", body["error"])
        assertEquals(ErrorMessages.UNAUTHENTICATED, body["message"])
    }

    @Test
    fun `admin is allowed through, so the guard is not simply denying everyone`() {
        val (_, token) = createUser(UserRole.ADMIN)

        val (status, _) = getUsers(token)

        assertEquals(HttpStatus.OK, status)
    }

    @Test
    fun `both 403 paths return an identical body shape`() {
        // Method security (this endpoint) and the filter chain (RestAccessDeniedHandler) are
        // different code paths. MYT-23 requires a caller cannot tell them apart, so assert the
        // exact keys and values the method-security path produces.
        val (_, token) = createUser(UserRole.USER)

        val (_, body) = getUsers(token)

        assertNotNull(body)
        assertEquals(
            setOf("status", "error", "message", "timestamp"),
            body!!.keys,
            "ErrorResponse shape drifted; the two 403 paths would no longer match"
        )
    }
}
