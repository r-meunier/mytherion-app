package io.mytherion.common.model

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

        // Soft delete the entity directly in DB or via model
        saved.deletedAt = Instant.now()
        entityRepository.saveAndFlush(saved)

        entityManager.clear()

        // findById should return empty due to @SQLRestriction("deleted_at IS NULL")
        val found = entityRepository.findById(entityId)
        assertTrue(found.isEmpty, "Soft deleted entity should not be retrieved by standard queries")
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
