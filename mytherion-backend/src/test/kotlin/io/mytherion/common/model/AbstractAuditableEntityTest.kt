package io.mytherion.common.model

import io.mytherion.support.IntegrationTest
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
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
    @Autowired private lateinit var entryRepository: CodexEntryRepository
    @Autowired private lateinit var passwordEncoder: PasswordEncoder
    @Autowired private lateinit var entityManager: EntityManager

    private lateinit var fixtures: TestFixtures
    private lateinit var user: User
    private lateinit var project: Project

    @BeforeEach
    fun setup() {
        fixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entryRepository)
        val uniqueId = java.util.UUID.randomUUID().toString().substring(0, 8)
        user = fixtures.createVerifiedUser(
            email = "audit_user_$uniqueId@mytherion.dev",
            username = "audit_user_$uniqueId"
        )
        project = fixtures.createProjectForUser(user, name = "Audit Project $uniqueId")
    }

    @Test
    fun `should automatically assign UUID and timestamps upon persist`() {
        val entry = CodexEntry(
            project = project,
            name = "Elrond",
            type = EntryType.CHARACTER
        )
        val saved = entryRepository.saveAndFlush(entry)

        assertNotNull(saved.id, "ID should be generated as UUID")
        assertNotNull(saved.createdAt, "createdAt should be initialized")
        assertNotNull(saved.updatedAt, "updatedAt should be initialized")
        assertNull(saved.deletedAt, "deletedAt should be null initially")
        assertFalse(saved.isDeleted(), "isDeleted() should return false")
    }

    @Test
    fun `should update updatedAt timestamp on entry modification`() {
        val entry = CodexEntry(
            project = project,
            name = "Initial Name",
            type = EntryType.CHARACTER
        )
        val saved = entryRepository.saveAndFlush(entry)
        val initialCreatedAt = saved.createdAt
        val initialUpdatedAt = saved.updatedAt

        entityManager.clear()

        // Wait a tiny fraction or modify
        Thread.sleep(10)

        val retrieved = entryRepository.findById(saved.id!!).orElseThrow()
        retrieved.name = "Modified Name"
        val updated = entryRepository.saveAndFlush(retrieved)

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
        val entry = CodexEntry(
            project = project,
            name = "Boromir",
            type = EntryType.CHARACTER
        )
        val saved = entryRepository.saveAndFlush(entry)
        assertFalse(saved.isDeleted())

        val deletionTime = Instant.now()
        saved.deletedAt = deletionTime
        val softDeleted = entryRepository.saveAndFlush(saved)

        assertTrue(softDeleted.isDeleted())
        assertEquals(deletionTime, softDeleted.deletedAt)
    }

    @Test
    fun `should exclude soft deleted entries from repository queries via SQLRestriction`() {
        val entry = CodexEntry(
            project = project,
            name = "Saruman",
            type = EntryType.CHARACTER
        )
        val saved = entryRepository.saveAndFlush(entry)
        val entryId = saved.id!!

        // Soft delete the entry directly in DB or via model helper
        saved.markDeleted()
        entryRepository.saveAndFlush(saved)

        entityManager.clear()

        // findById should return empty due to @SQLRestriction("deleted_at IS NULL")
        val found = entryRepository.findById(entryId)
        assertTrue(found.isEmpty, "Soft deleted entry should not be retrieved by standard queries")
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
    fun `should support restore to clear deletedAt`() {
        val entry = CodexEntry(
            project = project,
            name = "Gandalf The White",
            type = EntryType.CHARACTER
        )
        entry.markDeleted()
        assertTrue(entry.isDeleted())

        entry.restore()
        assertFalse(entry.isDeleted())
        assertNull(entry.deletedAt)
    }

    @Test
    fun `should correctly implement equals and hashCode based on entry ID`() {
        val entity1 = CodexEntry(project = project, name = "Item1", type = EntryType.ITEM)
        val entity2 = CodexEntry(project = project, name = "Item1", type = EntryType.ITEM)

        // Transient entries with null IDs are not equal unless they are the same memory instance
        assertNotEquals(entity1, entity2, "Two distinct transient entries should not be equal")
        assertEquals(entity1, entity1, "Same instance should equal itself")

        val saved1 = entryRepository.saveAndFlush(entity1)
        val saved2 = entryRepository.saveAndFlush(entity2)

        assertEquals(saved1, saved1)
        assertNotEquals(saved1, saved2)
        assertEquals(saved1.hashCode(), saved2.hashCode(), "Entities of same type have stable hashCode")
    }

    @Test
    fun `should maintain entry in HashSet across save transitions without losing membership`() {
        val entry = CodexEntry(project = project, name = "Tracking Item", type = EntryType.ITEM)
        val set = hashSetOf(entry)

        assertTrue(set.contains(entry), "Set contains entry while transient")

        // Persist entry (assigns UUID)
        val saved = entryRepository.saveAndFlush(entry)

        assertTrue(set.contains(saved), "Set still contains entry after persisting and UUID assignment")
    }

    }
