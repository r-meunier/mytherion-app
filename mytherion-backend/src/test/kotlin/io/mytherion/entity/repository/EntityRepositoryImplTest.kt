package io.mytherion.entity.repository

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.fixtures.TestFixtures
import io.mytherion.project.repository.ProjectRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
class EntityRepositoryImplTest {

    @Autowired private lateinit var entityRepository: EntityRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var userRepository: io.mytherion.user.repository.UserRepository
    @Autowired private lateinit var passwordEncoder: org.springframework.security.crypto.password.PasswordEncoder
    private lateinit var testFixtures: TestFixtures

    private var projectId: Long = 0

    @BeforeEach
    fun setup() {
        testFixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entityRepository)
        val user = testFixtures.createVerifiedUser()
        val project = testFixtures.createProjectForUser(user)
        projectId = project.id!!

        // Create some test entities
        val e1 = Entity(
            project = project,
            name = "Gandalf",
            description = "Grey wizard",
            type = EntityType.CHARACTER,
            tags = arrayOf("magic", "istari")
        )

        val e2 = Entity(
            project = project,
            name = "Frodo",
            description = "Ring bearer",
            type = EntityType.CHARACTER,
            tags = arrayOf("hobbit", "hero")
        )

        val e3 = Entity(
            project = project,
            name = "The Shire",
            description = "A peaceful land",
            type = EntityType.LOCATION,
            tags = arrayOf("peaceful")
        )

        entityRepository.saveAll(listOf(e1, e2, e3))
    }

    @AfterEach
    fun tearDown() {
        entityRepository.deleteAll()
        projectRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `searchEntities should filter by type`() {
        val pageable = PageRequest.of(0, 10)
        val result = entityRepository.searchEntities(projectId, EntityType.CHARACTER, null, null, null, pageable)

        assertEquals(2, result.totalElements)
        assertTrue(result.content.all { it.type == EntityType.CHARACTER })
    }

    @Test
    fun `searchEntities should filter by tags using overlap`() {
        val pageable = PageRequest.of(0, 10)
        val result = entityRepository.searchEntities(projectId, null, null, listOf("hero", "magic"), null, pageable)

        // Frodo has 'hero', Gandalf has 'magic'
        assertEquals(2, result.totalElements)
        assertTrue(result.content.any { it.name == "Frodo" })
        assertTrue(result.content.any { it.name == "Gandalf" })
    }

    @Test
    fun `searchEntities should filter by search term`() {
        val pageable = PageRequest.of(0, 10)
        val result = entityRepository.searchEntities(projectId, null, null, null, "wizard", pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Gandalf", result.content[0].name)
    }

    @Test
    fun `searchEntities should combine filters`() {
        val pageable = PageRequest.of(0, 10)
        val result = entityRepository.searchEntities(projectId, EntityType.CHARACTER, null, listOf("magic"), "wizard", pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Gandalf", result.content[0].name)
    }
}
