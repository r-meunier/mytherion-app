package io.mytherion.codex.repository

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.ContextRole
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryDetail
import io.mytherion.codex.model.EntryType
import io.mytherion.fixtures.TestFixtures
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.support.IntegrationTest
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Round-trips entry details and aliases through Postgres: the jsonb mapping (UUID ids, enum roles,
 * null values) and the text[] aliases column. Flush + clear forces a real read from the database.
 */
@IntegrationTest
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CodexEntryContentPersistenceTest {

    @Autowired private lateinit var entryRepository: CodexEntryRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var userRepository: io.mytherion.user.repository.UserRepository
    @Autowired private lateinit var passwordEncoder: org.springframework.security.crypto.password.PasswordEncoder
    @Autowired private lateinit var entityManager: EntityManager

    @Test
    fun `details and aliases survive a save and reload`() {
        val fixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entryRepository)
        val suffix = UUID.randomUUID().toString()
        val project = fixtures.createProjectForUser(
            fixtures.createVerifiedUser(username = "persist-$suffix", email = "persist-$suffix@example.com")
        )
        val details = mutableListOf(
            EntryDetail(UUID.randomUUID(), "Voice", "Clipped, dry humour", hint = "How do they talk?", role = ContextRole.VOICE),
            EntryDetail(UUID.randomUUID(), "Pronouns")
        )
        val saved = entryRepository.save(
            CodexEntry(
                project = project,
                type = EntryType.CHARACTER,
                name = "Mira Vell",
                aliases = arrayOf("The Cartographer", "Mira of the Drowned Quarter"),
                content = EntryContent(templateId = "character-basic", details = details)
            )
        )
        entityManager.flush()
        entityManager.clear()

        val reloaded = entryRepository.findById(saved.id!!).orElseThrow()

        assertEquals(listOf("The Cartographer", "Mira of the Drowned Quarter"), reloaded.aliases?.toList())
        assertEquals("character-basic", reloaded.content?.templateId)
        assertEquals(details, reloaded.content?.details)
        assertNull(reloaded.content?.details?.get(1)?.value)
    }
}
