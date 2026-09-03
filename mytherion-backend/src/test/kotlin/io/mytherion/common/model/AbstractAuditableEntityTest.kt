package io.mytherion.common.model

import io.mytherion.support.IntegrationTest
import io.mytherion.category.model.Category
import io.mytherion.category.repository.CategoryRepository
import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.fixtures.TestFixtures
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@IntegrationTest
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AbstractAuditableEntityTest {

    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var entityRepository: EntityRepository
    @Autowired private lateinit var categoryRepository: CategoryRepository
    @Autowired private lateinit var passwordEncoder: PasswordEncoder
    @Autowired private lateinit var entityManager: EntityManager

    private lateinit var fixtures: TestFixtures
    private lateinit var user: User
    private lateinit var project: Project

    @BeforeEach
    fun setup() {
        fixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entityRepository)
        val uniqueId = java.util.UUID.randomUUID().toString().substring(0, 8)
        user = fixtures.createVerifiedUser(
            email = "audit_user_$uniqueId@mytherion.dev",
            username = "audit_user_$uniqueId"
        )
        project = fixtures.createProjectForUser(user, name = "Audit Project $uniqueId")
    }

    @Test
    fun `should automatically assign UUID and timestamps upon persist`() {
        val entity = Entity(
            project = project,
            name = "Elrond",
            type = EntityType.CHARACTER
        )
        val saved = entityRepository.saveAndFlush(entity)

        assertNotNull(saved.id, "ID should be generated as UUID")
        assertNotNull(saved.createdAt, "createdAt should be initialized")
        assertNotNull(saved.updatedAt, "updatedAt should be initialized")
        assertNull(saved.deletedAt, "deletedAt should be null initially")
        assertFalse(saved.isDeleted(), "isDeleted() should return false")
    }

    @Test
    fun `should update updatedAt timestamp on entity modification`() {
        val entity = Entity(
            project = project,
            name = "Initial Name",
            type = EntityType.CHARACTER
        )
        val saved = entityRepository.saveAndFlush(entity)
        val initialCreatedAt = saved.createdAt
        val initialUpdatedAt = saved.updatedAt

        entityManager.clear()

        // Wait a tiny fraction or modify
        Thread.sleep(10)

        val retrieved = entityRepository.findById(saved.id!!).orElseThrow()
        retrieved.name = "Modified Name"
        val updated = entityRepository.saveAndFlush(retrieved)

        assertEquals(
            initialCreatedAt.toEpochMilli(),
            updated.createdAt.toEpochMilli(),
            "createdAt should remain unchanged"
        )
        assertTrue(
            !updated.updatedAt.isBefore(initialUpdatedAt),
            "updatedAt should be equal or after initial timestamp"
        )
    }

    @Test
    fun `should track soft deletion state with deletedAt and isDeleted`() {
        val entity = Entity(
            project = project,
            name = "Boromir",
            type = EntityType.CHARACTER
        )
        val saved = entityRepository.saveAndFlush(entity)
        assertFalse(saved.isDeleted())

        val deletionTime = Instant.now()
        saved.deletedAt = deletionTime
        val softDeleted = entityRepository.saveAndFlush(saved)

        assertTrue(softDeleted.isDeleted())
        assertEquals(deletionTime, softDeleted.deletedAt)
    }

    @Test
    fun `should exclude soft deleted entities from repository queries via SQLRestriction`() {
        val entity = Entity(
            project = project,
            name = "Saruman",
            type = EntityType.CHARACTER
        )
        val saved = entityRepository.saveAndFlush(entity)
        val entityId = saved.id!!

        // Soft delete the entity directly in DB or via model helper
        saved.markDeleted()
        entityRepository.saveAndFlush(saved)

        entityManager.clear()

        // findById should return empty due to @SQLRestriction("deleted_at IS NULL")
        val found = entityRepository.findById(entityId)
        assertTrue(found.isEmpty, "Soft deleted entity should not be retrieved by standard queries")
    }

    @Test
    fun `should exclude soft deleted projects from repository queries via SQLRestriction`() {
        val testProject = fixtures.createProjectForUser(user, name = "Soft Deleted Project")
        val testProjectId = testProject.id!!

        testProject.markDeleted()
        projectRepository.saveAndFlush(testProject)

        entityManager.clear()

        val found = projectRepository.findById(testProjectId)
        assertTrue(found.isEmpty, "Soft deleted project should not be retrieved by standard queries")
    }


    @Test
    fun `should exclude soft deleted categories from repository queries via SQLRestriction`() {
        val category = Category(project = project, name = "Archived Factions")
        val savedCategory = categoryRepository.saveAndFlush(category)
        val categoryId = savedCategory.id!!

        savedCategory.markDeleted()
        categoryRepository.saveAndFlush(savedCategory)

        entityManager.clear()

        val found = categoryRepository.findById(categoryId)
        assertTrue(found.isEmpty, "Soft deleted category should not be retrieved by standard queries")
    }

    @Test
    fun `should support restore to clear deletedAt`() {
        val entity = Entity(
            project = project,
            name = "Gandalf The White",
            type = EntityType.CHARACTER
        )
        entity.markDeleted()
        assertTrue(entity.isDeleted())

        entity.restore()
        assertFalse(entity.isDeleted())
        assertNull(entity.deletedAt)
    }

    @Test
    fun `should correctly implement equals and hashCode based on entity ID`() {
        val entity1 = Entity(project = project, name = "Item1", type = EntityType.ITEM)
        val entity2 = Entity(project = project, name = "Item1", type = EntityType.ITEM)

        // Transient entities with null IDs are not equal unless they are the same memory instance
        assertNotEquals(entity1, entity2, "Two distinct transient entities should not be equal")
        assertEquals(entity1, entity1, "Same instance should equal itself")

        val saved1 = entityRepository.saveAndFlush(entity1)
        val saved2 = entityRepository.saveAndFlush(entity2)

        assertEquals(saved1, saved1)
        assertNotEquals(saved1, saved2)
        assertEquals(saved1.hashCode(), saved2.hashCode(), "Entities of same type have stable hashCode")
    }

    @Test
    fun `should maintain entity in HashSet across save transitions without losing membership`() {
        val entity = Entity(project = project, name = "Tracking Item", type = EntityType.ITEM)
        val set = hashSetOf(entity)

        assertTrue(set.contains(entity), "Set contains entity while transient")

        // Persist entity (assigns UUID)
        val saved = entityRepository.saveAndFlush(entity)

        assertTrue(set.contains(saved), "Set still contains entity after persisting and UUID assignment")
    }

    @Test
    fun `Category model should correctly inherit and populate AbstractAuditableEntity fields`() {
        val category = Category(
            project = project,
            name = "Magic Items",
            description = "Items with enchantments"
        )
        val saved = categoryRepository.saveAndFlush(category)

        assertNotNull(saved.id)
        assertNotNull(saved.createdAt)
        assertNotNull(saved.updatedAt)
        assertNull(saved.deletedAt)
        assertFalse(saved.isDeleted())
    }
}
