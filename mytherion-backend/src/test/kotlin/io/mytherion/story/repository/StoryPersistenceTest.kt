package io.mytherion.story.repository

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.story.model.Act
import io.mytherion.story.model.Beat
import io.mytherion.story.model.Chapter
import io.mytherion.story.model.Scene
import io.mytherion.story.model.SceneStatus
import io.mytherion.support.IntegrationTest
import io.mytherion.fixtures.TestFixtures
import io.mytherion.user.repository.UserRepository
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/** The V3 migration and the story entities agree: a whole act → chapter → scene survives a reload. */
@IntegrationTest
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class StoryPersistenceTest {

    @Autowired private lateinit var actRepository: ActRepository
    @Autowired private lateinit var chapterRepository: ChapterRepository
    @Autowired private lateinit var sceneRepository: SceneRepository
    @Autowired private lateinit var entryRepository: CodexEntryRepository
    @Autowired private lateinit var projectRepository: ProjectRepository
    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var passwordEncoder: PasswordEncoder
    @Autowired private lateinit var entityManager: EntityManager

    @Test
    fun `acts with beats, chapters and scenes with their Scene Card survive a save and reload`() {
        val fixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entryRepository)
        val suffix = UUID.randomUUID().toString()
        val project = fixtures.createProjectForUser(
            fixtures.createVerifiedUser(username = "story-$suffix", email = "story-$suffix@example.com")
        )
        val mira = entryRepository.save(CodexEntry(project = project, type = EntryType.CHARACTER, name = "Mira Vell"))
        val kael = entryRepository.save(CodexEntry(project = project, type = EntryType.CHARACTER, name = "Kael"))
        val quarter = entryRepository.save(CodexEntry(project = project, type = EntryType.LOCATION, name = "The Drowned Quarter"))

        val hook = Beat(UUID.randomUUID(), "Hook", "Open strong.", 0.01)
        val act = actRepository.save(
            Act(project = project, position = 0, title = "Setup", structureId = "three-act", beats = mutableListOf(hook))
        )
        val chapter = chapterRepository.save(Chapter(act = act, position = 0, title = "The Drowned Quarter"))
        val scene = sceneRepository.save(
            Scene(
                chapter = chapter,
                position = 0,
                title = "Arrival",
                content = "The rain had not stopped for *three days*.\n\n***\n\nMorning.",
                wordCount = 9,
                status = SceneStatus.REVISED,
                summary = "Mira enters the Quarter.",
                goal = "Find the map.",
                povEntryId = mira.id,
                locationEntryId = quarter.id,
                characterIds = arrayOf(mira.id!!, kael.id!!),
                beatId = hook.id,
            )
        )
        entityManager.flush()
        entityManager.clear()

        val acts = actRepository.findAllByProjectOrderByPositionAsc(project)
        assertEquals(listOf("Setup"), acts.map { it.title })
        assertEquals(listOf(hook), acts.single().beats)
        assertEquals("three-act", acts.single().structureId)

        val chapters = chapterRepository.findAllByActInOrderByPositionAsc(acts)
        assertEquals(listOf("The Drowned Quarter"), chapters.map { it.title })

        val reloaded = sceneRepository.findAllByChapterInOrderByPositionAsc(chapters).single()
        assertEquals(scene.id, reloaded.id)
        assertEquals("The rain had not stopped for *three days*.\n\n***\n\nMorning.", reloaded.content)
        assertEquals(SceneStatus.REVISED, reloaded.status)
        assertEquals(mira.id, reloaded.povEntryId)
        assertEquals(quarter.id, reloaded.locationEntryId)
        assertEquals(listOf(mira.id, kael.id), reloaded.characterIds.toList())
        assertEquals(hook.id, reloaded.beatId)
    }

    @Test
    fun `deleted chapters and scenes are left out of the tree`() {
        val fixtures = TestFixtures(userRepository, passwordEncoder, projectRepository, entryRepository)
        val suffix = UUID.randomUUID().toString()
        val project = fixtures.createProjectForUser(
            fixtures.createVerifiedUser(username = "story-del-$suffix", email = "story-del-$suffix@example.com")
        )
        val act = actRepository.save(Act(project = project, position = 0, title = "Story"))
        val kept = chapterRepository.save(Chapter(act = act, position = 0))
        chapterRepository.save(Chapter(act = act, position = 1).apply { markDeleted() })
        sceneRepository.save(Scene(chapter = kept, position = 0))
        sceneRepository.save(Scene(chapter = kept, position = 1).apply { markDeleted() })
        entityManager.flush()
        entityManager.clear()

        val chapters = chapterRepository.findAllByActInOrderByPositionAsc(actRepository.findAllByProjectOrderByPositionAsc(project))
        assertEquals(listOf(0), chapters.map { it.position })
        val scenes = sceneRepository.findAllByChapterInOrderByPositionAsc(chapters)
        assertEquals(listOf(0), scenes.map { it.position })
        assertTrue(scenes.single().characterIds.isEmpty(), "an empty character list defaults to {}")
    }
}
