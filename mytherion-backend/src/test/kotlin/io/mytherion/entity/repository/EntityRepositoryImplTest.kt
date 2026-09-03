package io.mytherion.entity.repository

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.fixtures.TestFixtures
import io.mytherion.project.repository.ProjectRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import java.util.UUID
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
    @Autowired private lateinit var categoryRepository: io.mytherion.category.repository.CategoryRepository
    @Autowired private lateinit var userRepository: io.mytherion.user.repository.UserRepository
    @Autowired private lateinit var passwordEncoder: org.springframework.security.crypto.password.PasswordEncoder
    private lateinit var testFixtures: TestFixtures

    private lateinit var projectId: UUID
    private lateinit var categoryId: UUID

    @BeforeEach
    fun setup() {
        testFixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entityRepository)
        val uniqueSuffix = UUID.randomUUID().toString()
        val user = testFixtures.createVerifiedUser(
            username = "testuser-$uniqueSuffix",
            email = "test-$uniqueSuffix@example.com"
        )
        val project = testFixtures.createProjectForUser(user)
        projectId = project.id!!

        val category = io.mytherion.category.model.Category(
            project = project,
            name = "Wizards",
            description = "Wizards and sages"
        )
        val savedCategory = categoryRepository.save(category)
        categoryId = savedCategory.id!!

        // Create some test entities
        val e1 = Entity(
            project = project,
            name = "Gandalf",
            description = "Grey wizard",
            type = EntityType.CHARACTER,
            tags = arrayOf("magic", "istari"),
            category = savedCategory
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
        categoryRepository.deleteAll()
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

    @Test
    fun `searchEntities should filter by categoryId`() {
        val pageable = PageRequest.of(0, 10)
        val result = entityRepository.searchEntities(projectId, null, categoryId, null, null, pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Gandalf", result.content[0].name)
        assertEquals(categoryId, result.content[0].category?.id)
    }

    @Test
    fun `searchEntities with non-matching categoryId should return empty page`() {
        val pageable = PageRequest.of(0, 10)
        val nonMatchingCategoryId = UUID.randomUUID()
        val result = entityRepository.searchEntities(projectId, null, nonMatchingCategoryId, null, null, pageable)

        assertEquals(0, result.totalElements)
        assertTrue(result.content.isEmpty())
    }
}
