package io.mytherion.codex.repository

import io.mytherion.support.IntegrationTest
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
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

@IntegrationTest
@SpringBootTest
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
class CodexEntryRepositoryImplTest {

    @Autowired private lateinit var entryRepository: CodexEntryRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var userRepository: io.mytherion.user.repository.UserRepository
    @Autowired private lateinit var passwordEncoder: org.springframework.security.crypto.password.PasswordEncoder
    private lateinit var testFixtures: TestFixtures

    private lateinit var projectId: UUID

    @BeforeEach
    fun setup() {
        testFixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entryRepository)
        val uniqueSuffix = UUID.randomUUID().toString()
        val user = testFixtures.createVerifiedUser(
            username = "testuser-$uniqueSuffix",
            email = "test-$uniqueSuffix@example.com"
        )
        val project = testFixtures.createProjectForUser(user)
        projectId = project.id!!

        // Create some test entries
        val e1 = CodexEntry(
            project = project,
            name = "Gandalf",
            description = "Grey wizard",
            type = EntryType.CHARACTER,
            tags = arrayOf("magic", "istari"),
        )

        val e2 = CodexEntry(
            project = project,
            name = "Frodo",
            description = "Ring bearer",
            type = EntryType.CHARACTER,
            tags = arrayOf("hobbit", "hero")
        )

        val e3 = CodexEntry(
            project = project,
            name = "The Shire",
            description = "A peaceful land",
            type = EntryType.LOCATION,
            tags = arrayOf("peaceful")
        )

        entryRepository.saveAll(listOf(e1, e2, e3))
    }

    @AfterEach
    fun tearDown() {
        entryRepository.deleteAll()
        projectRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `searchEntries should filter by type`() {
        val pageable = PageRequest.of(0, 10)
        val result = entryRepository.searchEntries(projectId, EntryType.CHARACTER, null, null, pageable)
        assertEquals(2, result.totalElements)
        assertTrue(result.content.all { it.type == EntryType.CHARACTER })
    }

    @Test
    fun `searchEntries should filter by tags using overlap`() {
        val pageable = PageRequest.of(0, 10)
        val result = entryRepository.searchEntries(projectId, null, listOf("hero", "magic"), null, pageable)
        // Frodo has 'hero', Gandalf has 'magic'
        assertEquals(2, result.totalElements)
        assertTrue(result.content.any { it.name == "Frodo" })
        assertTrue(result.content.any { it.name == "Gandalf" })
    }

    @Test
    fun `searchEntries should filter by search term`() {
        val pageable = PageRequest.of(0, 10)
        val result = entryRepository.searchEntries(projectId, null, null, "wizard", pageable)
        assertEquals(1, result.totalElements)
        assertEquals("Gandalf", result.content[0].name)
    }

    @Test
    fun `searchEntries should combine filters`() {
        val pageable = PageRequest.of(0, 10)
        val result = entryRepository.searchEntries(projectId, EntryType.CHARACTER, listOf("magic"), "wizard", pageable)
        assertEquals(1, result.totalElements)
        assertEquals("Gandalf", result.content[0].name)
    }

        }
