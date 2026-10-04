package io.mytherion.config.web

import io.mytherion.auth.jwt.JwtService
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.support.IntegrationTest
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.junit.jupiter.params.provider.ValueSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.client.RestClient
import tools.jackson.core.type.TypeReference
import tools.jackson.databind.json.JsonMapper
import java.net.Socket
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.UUID
import java.util.stream.Stream

/**
 * Every failure path, against a real server, returns the same `ErrorResponse` shape and code.
 * Deletes only the user it creates: never `deleteAll()`, which would wipe local dev data.
 */
@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ErrorContractIntegrationTest {

    @LocalServerPort private var port: Int = 0

    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var jwtService: JwtService
    @Autowired private lateinit var projectRepository: ProjectRepository

    private lateinit var client: RestClient
    private lateinit var user: User
    private lateinit var token: String

    @BeforeAll
    fun setUp() {
        client = RestClient.builder().baseUrl("http://localhost:$port").build()
        val suffix = UUID.randomUUID().toString().take(8)
        user = userRepository.save(
            User(
                username = "contract_$suffix",
                email = "contract_$suffix@contract.dev",
                passwordHash = "hash",
                role = UserRole.USER,
                emailVerified = true
            )
        )
        token = jwtService.generateAccessToken(user.id!!, user.email, user.role.name)
    }

    @AfterAll
    fun tearDown() {
        userRepository.deleteById(user.id!!)
    }

    data class Case(
        val label: String,
        val method: HttpMethod,
        val path: String,
        val authenticated: Boolean,
        val status: HttpStatus,
        val code: String,
        val json: String? = null,
        val hasFieldErrors: Boolean = false
    ) {
        override fun toString() = label
    }

    fun cases(): Stream<Arguments> {
        val p = UUID.randomUUID()
        return Stream.of(
            Case("no session", HttpMethod.GET, "/api/projects", false, HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED"),
            Case("method security", HttpMethod.GET, "/api/user", true, HttpStatus.FORBIDDEN, "ACCESS_DENIED"),
            Case(
                "tenant isolation", HttpMethod.GET, "/api/projects/$p/entries", true,
                HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND"
            ),
            Case("missing project", HttpMethod.GET, "/api/projects/$p", true, HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND"),
            Case("unmapped route", HttpMethod.GET, "/api/nowhere", true, HttpStatus.NOT_FOUND, "NOT_FOUND"),
            Case(
                "malformed JSON", HttpMethod.POST, "/api/projects", true,
                HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", json = "{bad"
            ),
            Case(
                "bean validation", HttpMethod.POST, "/api/projects", true,
                HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", json = """{"name":""}""", hasFieldErrors = true
            ),
            Case(
                "path variable type", HttpMethod.GET, "/api/projects/not-a-uuid", true,
                HttpStatus.BAD_REQUEST, "INVALID_PARAMETER"
            ),
            Case(
                "wrong method", HttpMethod.PATCH, "/api/auth/me", true,
                HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED"
            ),
        ).map { Arguments.of(it) }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    fun `every failure returns the standard error contract`(case: Case) {
        val (status, body) = send(case)

        assertEquals(case.status, status, "wrong status for ${case.label}")
        assertNotNull(body, "${case.label}: no parseable JSON body")
        body!!

        val expectedKeys = mutableSetOf("status", "error", "code", "message", "path", "timestamp", "requestId")
        if (case.hasFieldErrors) expectedKeys += "errors"
        assertEquals(expectedKeys, body.keys, "${case.label}: ErrorResponse shape drifted")

        assertEquals(case.status.value(), (body["status"] as Number).toInt())
        assertEquals(case.status.reasonPhrase, body["error"])
        assertEquals(case.code, body["code"])
        assertEquals(case.path, body["path"])
        // Filter-chain and handler bodies are serialised separately; both must be ISO-8601.
        Instant.parse(body["timestamp"] as String)
    }

    @Test
    fun `a 401 from the security filter carries the same request id as the response header`() {
        client.get().uri("/api/projects").exchange { _, res ->
            val header = res.headers.getFirst("X-Request-Id")
            val body = res.bodyTo(object : ParameterizedTypeReference<Map<String, Any>>() {})

            assertEquals(401, res.statusCode.value())
            assertNotNull(header, "no X-Request-Id header")
            assertEquals(header, body!!["requestId"])
        }
    }

    @Test
    fun `a soft-deleted project gets the same 404 as a missing one`() {
        val project = projectRepository.save(Project(owner = user, name = "deleted").apply { markDeleted() })
        try {
            val id = project.id!!
            listOf(
                Case("get", HttpMethod.GET, "/api/projects/$id", true, HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND"),
                Case("stats", HttpMethod.GET, "/api/projects/$id/stats", true, HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND"),
                Case(
                    "update", HttpMethod.PUT, "/api/projects/$id", true, HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND",
                    json = """{"name":"revived"}"""
                ),
                Case("delete", HttpMethod.DELETE, "/api/projects/$id", true, HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND"),
            ).forEach { case ->
                val (status, body) = send(case)
                assertEquals(case.status, status, "wrong status for ${case.label}")
                assertEquals(case.code, body?.get("code"), "wrong code for ${case.label}")
            }
        } finally {
            projectRepository.deleteById(project.id!!)
        }
    }

    @Test
    fun `a deleted account's still-valid token is a dead session, 401`() {
        val suffix = UUID.randomUUID().toString().take(8)
        val gone = userRepository.save(
            User(username = "gone_$suffix", email = "gone_$suffix@contract.dev", passwordHash = "hash")
                .apply { emailVerified = true; markDeleted() }
        )
        try {
            val goneToken = jwtService.generateAccessToken(gone.id!!, gone.email, gone.role.name)
            listOf("/api/auth/me", "/api/projects").forEach { path ->
                val (status, body) = send(
                    Case(path, HttpMethod.GET, path, true, HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED"),
                    bearer = goneToken
                )
                assertEquals(HttpStatus.UNAUTHORIZED, status, "wrong status for $path")
                assertEquals("UNAUTHENTICATED", body?.get("code"), "wrong code for $path")
            }
        } finally {
            userRepository.deleteById(gone.id!!)
        }
    }

    /** Raw socket: Tomcat answers 413 mid-upload, which Java HTTP clients see as an I/O error. */
    @Test
    fun `oversized upload returns 413 with the standard error contract`() {
        // Just over 5MB, within Tomcat's 2MB swallow margin.
        val fileBytes = 5 * 1024 * 1024 + 64 * 1024
        val path = "/api/projects/${UUID.randomUUID()}/entries/${UUID.randomUUID()}/thumbnail"

        val (status, body) = rawMultipartUpload(path, fileBytes)

        assertEquals(413, status)
        assertEquals(setOf("status", "error", "code", "message", "path", "timestamp", "requestId"), body.keys)
        assertEquals("FILE_TOO_LARGE", body["code"])
        assertEquals("File exceeds the 5MB upload limit", body["message"])
        assertEquals(path, body["path"])
    }

    @ParameterizedTest(name = "{0}")
    @ValueSource(strings = ["/api/projects;x", "/api/projects/%2e%2e/x", "/api/projects//x"])
    fun `a URL the security firewall rejects is 400, not a 401 from the error page`(path: String) {
        val (status, body) = rawRequest("GET", path)

        assertEquals(400, status)
        assertEquals(setOf("status", "error", "code", "message", "path", "timestamp", "requestId"), body.keys)
        assertEquals("BAD_REQUEST", body["code"])
    }

    private fun rawMultipartUpload(path: String, fileBytes: Int): Pair<Int, Map<String, Any>> {
        val boundary = "contract-${UUID.randomUUID()}"
        val head = "--$boundary$CRLF" +
            "Content-Disposition: form-data; name=\"file\"; filename=\"big.png\"$CRLF" +
            "Content-Type: image/png$CRLF$CRLF"
        val tail = "$CRLF--$boundary--$CRLF"
        return rawRequest(
            "POST", path,
            listOf("Content-Type: multipart/form-data; boundary=$boundary"),
            head.toByteArray(StandardCharsets.US_ASCII) + ByteArray(fileBytes) +
                tail.toByteArray(StandardCharsets.US_ASCII)
        )
    }

    /** Raw so the path reaches the server byte for byte; HTTP clients normalise odd URLs. */
    private fun rawRequest(
        method: String,
        path: String,
        headers: List<String> = emptyList(),
        body: ByteArray = ByteArray(0)
    ): Pair<Int, Map<String, Any>> {
        Socket("localhost", port).use { socket ->
            socket.soTimeout = 30_000
            val out = socket.getOutputStream()
            val requestHead = "$method $path HTTP/1.0$CRLF" +
                "Host: localhost:$port$CRLF" +
                "Authorization: Bearer $token$CRLF" +
                headers.joinToString("") { "$it$CRLF" } +
                "Content-Length: ${body.size}$CRLF$CRLF"
            out.write(requestHead.toByteArray(StandardCharsets.US_ASCII))
            out.write(body)
            out.flush()

            // HTTP/1.0: the server closes after responding.
            val response = String(socket.getInputStream().readAllBytes(), StandardCharsets.UTF_8)
            val status = response.substringAfter(' ').take(3).toInt()
            val json = response.substringAfter("$CRLF$CRLF")
            return status to JsonMapper.builder().build()
                .readValue(json, object : TypeReference<Map<String, Any>>() {})
        }
    }

    private fun send(case: Case, bearer: String = token): Pair<HttpStatus, Map<String, Any>?> {
        val spec = client.method(case.method)
            .uri(case.path)
            .apply { if (case.authenticated) header(HttpHeaders.AUTHORIZATION, "Bearer $bearer") }

        if (case.json != null) spec.contentType(MediaType.APPLICATION_JSON).body(case.json)

        return spec.exchange { _, res ->
            HttpStatus.valueOf(res.statusCode.value()) to runCatching {
                res.bodyTo(object : ParameterizedTypeReference<Map<String, Any>>() {})
            }.getOrNull()
        }
    }

    private companion object {
        const val CRLF = "\r\n"
    }
}
