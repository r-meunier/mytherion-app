package io.mytherion.entity.service

import tools.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.entity.dto.EntityDTO
import io.mytherion.entity.dto.EntitySearchRequest
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.fixtures.TestFixtures
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.repository.UserRepository
import org.approvaltests.Approvals
import org.junit.jupiter.api.BeforeEach
import java.util.UUID
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(ObjectMapper::class)
class EntityServiceCharacterizationTest {

    @Autowired private lateinit var entityService: EntityService
    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var entityRepository: EntityRepository
    @Autowired private lateinit var passwordEncoder: PasswordEncoder
    @Autowired private lateinit var objectMapper: ObjectMapper

    @MockkBean private lateinit var currentUserProvider: CurrentUserProvider

    private lateinit var testFixtures: TestFixtures
    private lateinit var projectId: UUID

    @BeforeEach
    fun setup() {
        testFixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entityRepository)
        
        val uniqueSuffix = UUID.randomUUID().toString()
        val user = testFixtures.createVerifiedUser(
            username = "testuser-$uniqueSuffix",
            email = "test-$uniqueSuffix@example.com"
        )
        val project = testFixtures.createProjectForUser(user)
        projectId = requireNotNull(project.id)

        // Mock current user
        every { currentUserProvider.getCurrentUser() } returns user

        // Create realistic entities
        testFixtures.createEntity(
            project = project,
            type = EntityType.CHARACTER,
            name = "Elara Starweaver",
            tags = listOf("magic", "hero")
        )

        testFixtures.createEntity(
            project = project,
            type = EntityType.CHARACTER,
            name = "Garrick Stone",
            tags = listOf("melee", "hero")
        )

        testFixtures.createEntity(
            project = project,
            type = EntityType.LOCATION,
            name = "The Obsidian Tower",
            tags = listOf("magic", "headquarters")
        )
    }

    @Test
    fun `characterize searchEntities with empty filters`() {
        val request = EntitySearchRequest(page = 0, size = 10)
        val result = entityService.searchEntities(projectId, request)

        val scrubbedJson = scrubDynamicFields(stableOrder(result))
        Approvals.verify(scrubbedJson, org.approvaltests.core.Options().forFile().withExtension(".json"))
    }

    @Test
    fun `characterize searchEntities with tag and type filters`() {
        val request = EntitySearchRequest(
            page = 0, 
            size = 10, 
            type = EntityType.CHARACTER,
            tags = listOf("hero")
        )
        val result = entityService.searchEntities(projectId, request)

        val scrubbedJson = scrubDynamicFields(stableOrder(result))
        Approvals.verify(scrubbedJson, org.approvaltests.core.Options().forFile().withExtension(".json"))
    }

    // searchEntities orders by (createdAt DESC, id DESC). The fixture rows share a
    // createdAt, so the tiebreaker is the random UUID id, which varies per run. Sort
    // the page content by name here so the snapshot is deterministic — this only
    // affects the test, not production ordering.
    private fun stableOrder(page: Page<EntityDTO>): Page<EntityDTO> =
        PageImpl(page.content.sortedBy { it.name }, page.pageable, page.totalElements)

    private fun scrubDynamicFields(obj: Any): String {
        val json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj)
        return json.replace(Regex("\"id\" : \"[a-f0-9\\-]+\""), "\"id\" : \"999\"")
            .replace(Regex("\"projectId\" : \"[a-f0-9\\-]+\""), "\"projectId\" : \"999\"")
            .replace(Regex("\"ownerId\" : \"[a-f0-9\\-]+\""), "\"ownerId\" : \"999\"")
            .replace(Regex("\"createdAt\" : \"[^\"]+\""), "\"createdAt\" : \"2026-01-01T00:00:00Z\"")
            .replace(Regex("\"updatedAt\" : \"[^\"]+\""), "\"updatedAt\" : \"2026-01-01T00:00:00Z\"")
    }
}
