package io.mytherion.codex

import io.mytherion.auth.jwt.JwtService
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.support.IntegrationTest
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.web.client.RestClient
import java.util.UUID

/**
 * The entry page saves one field at a time, each PATCH carrying the version the previous one
 * returned. That only works if the PATCH response holds the version actually stored: it used to
 * return the pre-update version, so every second save in a row got a 409.
 */
@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CodexEntryVersionE2ETest {

    @LocalServerPort
    private var port: Int = 0

    @Autowired private lateinit var entryRepository: CodexEntryRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var jwtService: JwtService

    private lateinit var restClient: RestClient
    private lateinit var user: User
    private lateinit var token: String
    private lateinit var project: Project
    private lateinit var entry: CodexEntry

    @BeforeEach
    fun setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:$port").build()
        // Its own rows, so it neither depends on nor wipes anyone else's.
        val suffix = UUID.randomUUID().toString().take(8)
        user = userRepository.save(
            User(username = "version_$suffix", email = "version_$suffix@test.dev", passwordHash = "hash")
        )
        token = jwtService.generateAccessToken(user.id!!, user.email, user.role.name)
        project = projectRepository.save(Project(name = "Version project", description = null, owner = user))
        entry = entryRepository.save(CodexEntry(name = "Mira Vell", type = EntryType.CHARACTER, project = project))
    }

    @AfterEach
    fun tearDown() {
        entryRepository.deleteById(entry.id!!)
        projectRepository.deleteById(project.id!!)
        userRepository.deleteById(user.id!!)
    }

    private fun patch(body: Map<String, Any>): Pair<HttpStatusCode, Map<String, Any>?> =
        restClient.patch()
            .uri("/api/projects/${project.id}/entries/${entry.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .exchange { _, res -> res.statusCode to res.bodyTo(object : ParameterizedTypeReference<Map<String, Any>>() {}) }

    @Test
    fun `PATCH returns the stored version, so saves in a row each succeed`() {
        val start = entryRepository.findById(entry.id!!).orElseThrow().version

        val (firstStatus, first) = patch(mapOf("name" to "Mira", "version" to start))
        assertEquals(200, firstStatus.value())
        val afterFirst = (first!!["version"] as Number).toLong()
        assertEquals(entryRepository.findById(entry.id!!).orElseThrow().version, afterFirst)

        val (secondStatus, second) = patch(mapOf("description" to "A cartographer.", "version" to afterFirst))
        assertEquals(200, secondStatus.value())
        assertEquals(afterFirst + 1, (second!!["version"] as Number).toLong())
    }

    @Test
    fun `PATCH with a stale version is refused with 409`() {
        val start = entryRepository.findById(entry.id!!).orElseThrow().version
        patch(mapOf("name" to "Mira", "version" to start))

        val (status, body) = patch(mapOf("name" to "Mira Vell-Arden", "version" to start))

        assertEquals(409, status.value())
        assertEquals("CONCURRENT_MODIFICATION", body!!["code"])
    }
}
