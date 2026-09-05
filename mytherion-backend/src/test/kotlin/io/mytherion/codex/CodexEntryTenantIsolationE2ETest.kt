package io.mytherion.codex

import io.mytherion.support.IntegrationTest
import io.mytherion.auth.jwt.JwtService
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.client.RestClient

@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CodexEntryTenantIsolationE2ETest {

    @LocalServerPort
    private var port: Int = 0

    private lateinit var restClient: RestClient

    @Autowired
    private lateinit var entryRepository: CodexEntryRepository

    @Autowired
    private lateinit var projectRepository: ProjectRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var jwtService: JwtService

    private lateinit var user1: User
    private lateinit var user2: User

    private lateinit var user1Token: String
    private lateinit var user2Token: String

    private lateinit var project1User1: Project
    private lateinit var project2User1: Project
    private lateinit var projectUser2: Project

    private lateinit var entryInProject1: CodexEntry
    private lateinit var entry2InProject1: CodexEntry

    @BeforeEach
    fun setUp() {
        entryRepository.deleteAll()
        projectRepository.deleteAll()
        userRepository.deleteAll()

        restClient = RestClient.builder().baseUrl("http://localhost:$port").build()

        // Create User 1 and User 2
        user1 = userRepository.save(
            User(
                username = "user1_isolation",
                email = "user1@isolation.dev",
                passwordHash = "hash1"
            )
        )

        user2 = userRepository.save(
            User(
                username = "user2_isolation",
                email = "user2@isolation.dev",
                passwordHash = "hash2"
            )
        )

        user1Token = jwtService.generateAccessToken(user1.id!!, user1.email, user1.role.name)
        user2Token = jwtService.generateAccessToken(user2.id!!, user2.email, user2.role.name)

        // User 1 owns Project 1 and Project 2
        project1User1 = projectRepository.save(
            Project(
                name = "User 1 - Project Alpha",
                description = "Primary project for user 1",
                owner = user1
            )
        )

        project2User1 = projectRepository.save(
            Project(
                name = "User 1 - Project Beta",
                description = "Secondary project for user 1",
                owner = user1
            )
        )

        // User 2 owns a separate project
        projectUser2 = projectRepository.save(
            Project(
                name = "User 2 - Project Gamma",
                description = "Project belonging to user 2",
                owner = user2
            )
        )

        // Create CodexEntry belonging to Project 1 (User 1)
        entryInProject1 = entryRepository.save(
            CodexEntry(
                name = "E2E Test Character",
                description = "CodexEntry in Project 1",
                type = EntryType.CHARACTER,
                project = project1User1
            )
        )

        entry2InProject1 = entryRepository.save(
            CodexEntry(
                name = "E2E Test Second Entry",
                description = "Second entry in Project 1",
                type = EntryType.CHARACTER,
                project = project1User1
            )
        )
    }

    @AfterEach
    fun tearDown() {
        entryRepository.deleteAll()
        projectRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `user can successfully access entry through its correct project`() {
        val response = restClient.get()
            .uri("/api/projects/${project1User1.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user1Token")
            .exchange { _, res ->
                val body = if (res.statusCode == HttpStatus.OK) {
                    res.bodyTo(object : ParameterizedTypeReference<Map<String, Any>>() {})
                } else null
                res.statusCode to body
            }

        assertEquals(HttpStatus.OK, response.first)
        assertEquals("E2E Test Character", response.second?.get("name"))
        assertEquals(entryInProject1.id.toString(), response.second?.get("id"))
    }

    @Test
    fun `same user cannot access entry through a different project they own returning 404`() {
        // User 1 owns project2User1, but entryInProject1 belongs to project1User1
        val status = restClient.get()
            .uri("/api/projects/${project2User1.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user1Token")
            .exchange { _, res -> res.statusCode }

        assertEquals(HttpStatus.NOT_FOUND, status)
    }

    @Test
    fun `same user cannot update entry through a different project they own returning 404`() {
        val updatePayload = mapOf("name" to "Hacked Name")

        val status = restClient.patch()
            .uri("/api/projects/${project2User1.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user1Token")
            .contentType(MediaType.APPLICATION_JSON)
            .body(updatePayload)
            .exchange { _, res -> res.statusCode }

        assertEquals(HttpStatus.NOT_FOUND, status)

        // Verify entry in DB was NOT changed
        val entryFromDb = entryRepository.findById(entryInProject1.id!!).orElseThrow()
        assertEquals("E2E Test Character", entryFromDb.name)
    }

    @Test
    fun `same user cannot delete entry through a different project they own returning 404`() {
        val status = restClient.delete()
            .uri("/api/projects/${project2User1.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user1Token")
            .exchange { _, res -> res.statusCode }

        assertEquals(HttpStatus.NOT_FOUND, status)

        // Verify entry in DB was NOT soft-deleted
        val entryFromDb = entryRepository.findById(entryInProject1.id!!).orElseThrow()
        assertFalse(entryFromDb.isDeleted())
    }

    @Test
    fun `another user cannot access entry via victim project returning 403 Forbidden`() {
        // User 2 tries to access User 1's project -> ProjectAccessInterceptor returns 403
        val status = restClient.get()
            .uri("/api/projects/${project1User1.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user2Token")
            .exchange { _, res -> res.statusCode }

        assertEquals(HttpStatus.FORBIDDEN, status)
    }

    @Test
    fun `another user cannot probe victim entry via their own project returning 404 Not Found`() {
        // User 2 tries to query User 1's entry through User 2's project
        // Interceptor passes (User 2 owns projectUser2), but CodexEntryService asserts entry.project.id == projectId -> 404
        val status = restClient.get()
            .uri("/api/projects/${projectUser2.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user2Token")
            .exchange { _, res -> res.statusCode }

        assertEquals(HttpStatus.NOT_FOUND, status)
    }

    @Test
    fun `another user cannot delete victim entry via their own project returning 404 Not Found`() {
        val status = restClient.delete()
            .uri("/api/projects/${projectUser2.id}/entries/${entryInProject1.id}")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $user2Token")
            .exchange { _, res -> res.statusCode }

        assertEquals(HttpStatus.NOT_FOUND, status)

        // Verify entry is untouched
        val entryFromDb = entryRepository.findById(entryInProject1.id!!).orElseThrow()
        assertFalse(entryFromDb.isDeleted())
    }

        }
