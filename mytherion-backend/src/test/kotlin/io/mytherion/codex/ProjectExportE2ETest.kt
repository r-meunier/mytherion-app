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

/** The export endpoint, through the real server, security chain and ProjectAccessInterceptor. */
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
    private val createdEntries = mutableListOf<CodexEntry>()
    private val createdProjects = mutableListOf<Project>()

    private class Download(val status: Int, val headers: HttpHeaders, val body: ByteArray) {
        val fileNames: List<String>
            get() = ZipInputStream(ByteArrayInputStream(body)).use { zip -> generateSequence { zip.nextEntry?.name }.toList() }
    }

    @BeforeEach
    fun setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:$port").build()
        // Its own rows, so it neither depends on nor wipes anyone else's.
        val suffix = UUID.randomUUID().toString().take(8)
        owner = userRepository.save(User(username = "export_$suffix", email = "export_$suffix@test.dev", passwordHash = "hash"))
        stranger = userRepository.save(User(username = "other_$suffix", email = "other_$suffix@test.dev", passwordHash = "hash"))
        project = project("Export Test")
        entry("Mira Vell")
    }

    @AfterEach
    fun tearDown() {
        createdEntries.forEach { entryRepository.deleteById(it.id!!) }
        createdProjects.forEach { projectRepository.deleteById(it.id!!) }
        userRepository.deleteById(owner.id!!)
        userRepository.deleteById(stranger.id!!)
    }

    private fun project(name: String) =
        projectRepository.save(Project(name = name, description = null, owner = owner)).also { createdProjects += it }

    private fun entry(name: String, project: Project = this.project, thumbnail: String? = null) =
        entryRepository.save(CodexEntry(name = name, type = EntryType.CHARACTER, project = project, thumbnail = thumbnail))
            .also { createdEntries += it }

    private fun token(user: User) = jwtService.generateAccessToken(user.id!!, user.email, user.role.name)

    private fun download(project: Project = this.project, user: User = owner): Download =
        restClient.get()
            .uri("/api/projects/${project.id}/export")
            .header(HttpHeaders.AUTHORIZATION, "Bearer ${token(user)}")
            .exchange { _, res -> Download(res.statusCode.value(), res.headers, res.body.readAllBytes()) }

    @Test
    fun `the owner downloads the project as a zip of the project folder`() {
        val download = download()

        assertEquals(200, download.status)
        assertEquals("application/zip", download.headers.contentType.toString())
        assertTrue(download.headers.contentDisposition.filename!!.matches(Regex("export-test-\\d{4}-\\d{2}-\\d{2}\\.zip")))
        assertEquals(listOf("export-test/project.json", "export-test/codex/characters/mira-vell.md"), download.fileNames)
    }

    @Test
    fun `deleted entries are left out`() {
        entryRepository.save(entry("Kael").apply { markDeleted() })

        assertEquals(listOf("export-test/project.json", "export-test/codex/characters/mira-vell.md"), download().fileNames)
    }

    @Test
    fun `an image that can't be read fails the export with an error response instead of a partial zip`() {
        entry("Kael", thumbnail = "mytherion-uploads/entries/missing/0_kael.png")

        val download = download()

        assertEquals(502, download.status)
        assertEquals("application/json", download.headers.contentType?.let { "${it.type}/${it.subtype}" })
        val body = String(download.body, Charsets.UTF_8)
        assertTrue(body.contains("\"code\":\"EXPORT_FAILED\""), body)
        assertTrue(body.contains("Kael"), body)
    }

    @Test
    fun `a non-Latin project name keeps its file name`() {
        val tokyo = project("東京")

        val download = download(tokyo)

        assertEquals(200, download.status)
        assertTrue(download.headers.contentDisposition.filename!!.matches(Regex("東京-\\d{4}-\\d{2}-\\d{2}\\.zip")))
        assertEquals(listOf("東京/project.json"), download.fileNames)
    }

    @Test
    fun `someone else's project is a 404`() {
        assertEquals(404, download(user = stranger).status)
    }
}
