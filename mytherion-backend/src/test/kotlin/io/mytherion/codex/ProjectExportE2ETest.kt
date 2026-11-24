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
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.http.HttpHeaders
import org.springframework.web.client.RestClient
import java.io.ByteArrayInputStream
import java.util.UUID
import java.util.zip.ZipInputStream

/** The export endpoint, through the real security chain and ProjectAccessInterceptor. */
@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProjectExportE2ETest {

    @LocalServerPort
    private var port: Int = 0

    @Autowired private lateinit var entryRepository: CodexEntryRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var jwtService: JwtService

    private lateinit var restClient: RestClient
    private lateinit var owner: User
    private lateinit var stranger: User
    private lateinit var project: Project
    private lateinit var entry: CodexEntry

    @BeforeEach
    fun setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:$port").build()
        // Its own rows, so it neither depends on nor wipes anyone else's.
        val suffix = UUID.randomUUID().toString().take(8)
        owner = userRepository.save(User(username = "export_$suffix", email = "export_$suffix@test.dev", passwordHash = "hash"))
        stranger = userRepository.save(User(username = "other_$suffix", email = "other_$suffix@test.dev", passwordHash = "hash"))
        project = projectRepository.save(Project(name = "Export Test", description = null, owner = owner))
        entry = entryRepository.save(CodexEntry(name = "Mira Vell", type = EntryType.CHARACTER, project = project))
    }

    @AfterEach
    fun tearDown() {
        entryRepository.deleteById(entry.id!!)
        projectRepository.deleteById(project.id!!)
        userRepository.deleteById(owner.id!!)
        userRepository.deleteById(stranger.id!!)
    }

    private fun token(user: User) = jwtService.generateAccessToken(user.id!!, user.email, user.role.name)

    @Test
    fun `the owner downloads the project as a zip of the project folder`() {
        val (status, headers, body) = restClient.get()
            .uri("/api/projects/${project.id}/export")
            .header(HttpHeaders.AUTHORIZATION, "Bearer ${token(owner)}")
            .exchange { _, res -> Triple(res.statusCode.value(), res.headers, res.body.readAllBytes()) }

        assertEquals(200, status)
        assertEquals("application/zip", headers.contentType.toString())
        assertTrue(headers.contentDisposition.filename!!.matches(Regex("export-test-\\d{4}-\\d{2}-\\d{2}\\.zip")))
        val names = ZipInputStream(ByteArrayInputStream(body)).use { zip -> generateSequence { zip.nextEntry?.name }.toList() }
        assertEquals(listOf("export-test/project.json", "export-test/codex/characters/mira-vell.md"), names)
    }

    @Test
    fun `someone else's project is a 404, like any project that isn't yours`() {
        val status = restClient.get()
            .uri("/api/projects/${project.id}/export")
            .header(HttpHeaders.AUTHORIZATION, "Bearer ${token(stranger)}")
            .exchange { _, res -> res.statusCode.value() }

        assertEquals(404, status)
    }
}
