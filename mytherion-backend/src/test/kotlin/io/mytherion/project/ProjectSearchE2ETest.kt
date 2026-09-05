package io.mytherion.project

import io.mytherion.support.IntegrationTest
import io.mytherion.auth.jwt.JwtService
import io.mytherion.fixtures.ProjectTestFixtures
import io.mytherion.project.repository.ProjectRepository
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
import org.springframework.http.HttpStatus
import org.springframework.web.client.RestClient

@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProjectSearchE2ETest {

    @LocalServerPort
    private var port: Int = 0

    private lateinit var restClient: RestClient

    @Autowired
    private lateinit var projectRepository: ProjectRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var jwtService: JwtService

    private lateinit var testUser: User
    private lateinit var jwtToken: String

    @BeforeEach
    fun setUp() {
        // Clean up before each test to ensure predictable state
        projectRepository.deleteAll()
        userRepository.deleteAll()

        // Create a test user
        testUser = userRepository.save(
            User(
                username = "e2esearch",
                email = "e2e@mytherion.dev",
                passwordHash = "hashed"
            )
        )

        // Generate valid JWT
        jwtToken = jwtService.generateAccessToken(testUser.id!!, testUser.email, testUser.role.name)

        // Initialize RestClient
        restClient = RestClient.builder().baseUrl("http://localhost:$port").build()

        // Seed some projects
        val p1 = ProjectTestFixtures.createTestProject(
            id = null,
            name = "Space Odyssey",
            genre = "Sci-Fi",
            owner = testUser
        )
        val p2 = ProjectTestFixtures.createTestProject(
            id = null,
            name = "Fantasy World",
            genre = "Fantasy",
            owner = testUser
        )
        val p3 = ProjectTestFixtures.createTestProject(
            id = null,
            name = "Space Invaders",
            genre = "Arcade",
            owner = testUser
        )
        
        projectRepository.saveAll(listOf(p1, p2, p3))
    }

    @AfterEach
    fun tearDown() {
        projectRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `test project search with query and genre filters`() {

        // 1. Test search query
        var response = restClient.get()
            .uri("/api/projects?search=space")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $jwtToken")
            .retrieve()
            .toEntity(object : ParameterizedTypeReference<Map<String, Any>>() {})

        assertEquals(HttpStatus.OK, response.statusCode)
        var body = response.body!!
        var content = body["content"] as List<*>
        assertEquals(2, content.size, "Should find 2 projects with 'space'")

        // 2. Test genre filter
        response = restClient.get()
            .uri("/api/projects?genre=Fantasy")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $jwtToken")
            .retrieve()
            .toEntity(object : ParameterizedTypeReference<Map<String, Any>>() {})

        assertEquals(HttpStatus.OK, response.statusCode)
        body = response.body!!
        content = body["content"] as List<*>
        assertEquals(1, content.size, "Should find 1 project in 'Fantasy' genre")
        assertEquals("Fantasy World", (content[0] as Map<*, *>)["name"])

        // 3. Test both search and genre
        response = restClient.get()
            .uri("/api/projects?search=space&genre=Sci-Fi")
            .header(HttpHeaders.AUTHORIZATION, "Bearer $jwtToken")
            .retrieve()
            .toEntity(object : ParameterizedTypeReference<Map<String, Any>>() {})

        assertEquals(HttpStatus.OK, response.statusCode)
        body = response.body!!
        content = body["content"] as List<*>
        assertEquals(1, content.size, "Should find 1 project matching 'space' and 'Sci-Fi'")
        assertEquals("Space Odyssey", (content[0] as Map<*, *>)["name"])
    }
}
