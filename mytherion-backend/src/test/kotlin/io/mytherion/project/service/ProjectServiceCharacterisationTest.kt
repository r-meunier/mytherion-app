package io.mytherion.project.service

import io.mockk.Runs
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.just
import io.mockk.verify
import io.mytherion.auth.CurrentUserProvider
import io.mytherion.project.ProjectTestFixtures
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import java.util.Optional
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
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
    private lateinit var entityQueryService: io.mytherion.entity.service.EntityQueryService

    @MockK
    private lateinit var metricsService: io.mytherion.monitoring.MetricsService

    @InjectMockKs
    private lateinit var projectService: ProjectService

    private lateinit var testUser: User
    private lateinit var otherUser: User
    private lateinit var testProject: Project

    @BeforeEach
    fun setUp() {
        testUser = ProjectTestFixtures.createTestUser(id = 1L, username = "testuser")
        otherUser =
            ProjectTestFixtures.createTestUser(
                id = 2L,
                username = "otheruser",
                email = "other@example.com"
            )
        testProject = ProjectTestFixtures.createTestProject(id = 1L, owner = testUser)

        // Mock CurrentUserProvider to return testUser
        every { currentUserProvider.getCurrentUser() } returns testUser

        // Stub metricsService calls (these methods return Unit)
        every { metricsService.recordProjectCreation(any(), any()) } just Runs
        every { metricsService.recordEntityQuery(any(), any(), any()) } just Runs
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `deleteProject should throw ProjectHasEntitiesException when project has entities`() {
        // Given - this locks down the cross-module EntityRepository access guard
        every { projectRepository.findById(1L) } returns Optional.of(testProject)
        every { entityQueryService.countByProject(testProject) } returns 3L

        // When & Then
        val exception =
            assertThrows<io.mytherion.project.exception.ProjectHasEntitiesException> {
                projectService.deleteProject(1L)
            }
        assertEquals(
            "Cannot delete project with id 1: it contains 3 entities. Delete all entities first.",
            exception.message
        )
        verify(exactly = 0) { projectRepository.delete(any()) }
    }
}
