package io.mytherion.project.service

import io.mockk.Runs
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.just
import io.mockk.verify
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.fixtures.ProjectTestFixtures
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import java.util.Optional
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import java.util.UUID
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(MockKExtension::class)
class ProjectServiceCharacterisationTest {

    @MockK
    private lateinit var projectRepository: ProjectRepository

    @MockK
    private lateinit var currentUserProvider: CurrentUserProvider

    @MockK
    private lateinit var entryQueryService: io.mytherion.codex.service.CodexEntryQueryService

    @MockK
    private lateinit var metricsService: io.mytherion.platform.monitoring.MetricsService

    @InjectMockKs
    private lateinit var projectService: ProjectService

    private lateinit var testUser: User
    private lateinit var otherUser: User
    private lateinit var testProject: Project

    @BeforeEach
    fun setUp() {
        testUser = ProjectTestFixtures.createTestUser(id = UUID.fromString("00000000-0000-0000-0000-000000000001"), username = "testuser")
        otherUser =
            ProjectTestFixtures.createTestUser(
                id = UUID.fromString("00000000-0000-0000-0000-000000000002"),
                username = "otheruser",
                email = "other@example.com"
            )
        testProject = ProjectTestFixtures.createTestProject(id = UUID.fromString("00000000-0000-0000-0000-000000000001"), owner = testUser)

        // Mock CurrentUserProvider to return testUser
        every { currentUserProvider.getCurrentUser() } returns testUser

        // Stub metricsService calls (these methods return Unit)
        every { metricsService.recordProjectCreation(any(), any()) } just Runs
        every { metricsService.recordEntryQuery(any(), any(), any()) } just Runs
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `deleteProject should throw ProjectHasEntriesException when project has entries`() {
        // Given - this locks down the cross-module CodexEntryRepository access guard
        every { projectRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000001")) } returns Optional.of(testProject)
        every { entryQueryService.countByProject(testProject) } returns 3L

        // When & Then
        val exception =
            assertThrows<io.mytherion.project.exception.ProjectHasEntriesException> {
                projectService.deleteProject(UUID.fromString("00000000-0000-0000-0000-000000000001"))
            }
        assertEquals(
            "Cannot delete project with id 00000000-0000-0000-0000-000000000001: it contains 3 entries. Delete all entries first.",
            exception.message
        )
        verify(exactly = 0) { projectRepository.delete(any()) }
    }
}
