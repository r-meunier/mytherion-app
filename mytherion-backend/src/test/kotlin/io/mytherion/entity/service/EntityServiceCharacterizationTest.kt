package io.mytherion.entity.service

import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mytherion.auth.CurrentUserProvider
import io.mytherion.entity.dto.CreateEntityRequest
import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.monitoring.MetricsService
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.service.ProjectService
import io.mytherion.storage.StorageService
import io.mytherion.user.model.User
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class EntityServiceCharacterizationTest {

    private lateinit var entityService: EntityService
    private lateinit var entityRepository: EntityRepository
    private lateinit var projectService: ProjectService
    private lateinit var currentUserProvider: CurrentUserProvider
    private lateinit var storageService: StorageService
    private lateinit var metricsService: MetricsService

    private lateinit var testUser: User
    private lateinit var testProject: Project
    private lateinit var testEntity: Entity

    @BeforeEach
    fun setup() {
        entityRepository = mockk()
        projectService = mockk()
        currentUserProvider = mockk()
        storageService = mockk()
        metricsService = mockk()

        entityService =
                EntityService(
                        entityRepository,
                        projectService,
                        currentUserProvider,
                        storageService,
                        metricsService,
                        "test-bucket"
                )

        // Setup test data
        testUser =
                User(
                        id = 1L,
                        username = "testuser",
                        email = "test@example.com",
                        passwordHash = "hashedpassword",
                        emailVerified = true
                )

        testProject =
                Project(
                        id = 1L,
                        owner = testUser,
                        name = "Test Project",
                        description = "Test Description"
                )

        testEntity =
                Entity(
                        id = 1L,
                        project = testProject,
                        type = EntityType.CHARACTER,
                        name = "Test Character",
                        summary = "A test character",
                        description = "Detailed description"
                )

        // Mock current user provider to return test user
        every { currentUserProvider.getCurrentUser() } returns testUser
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `createEntity should throw ProjectAccessDeniedException when user does not own project`() {
        // Given - ownership check is now delegated to ProjectService.getVerifiedProject
        val request = CreateEntityRequest(type = EntityType.CHARACTER, name = "Intruder")

        every { projectService.getVerifiedProject(2L, 1L) } throws ProjectAccessDeniedException(2L)

        // When/Then
        assertThrows<ProjectAccessDeniedException> { entityService.createEntity(2L, request) }
    }

    @Test
    fun `searchEntities should return results for valid project owner`() {
        // Given - this locks down the full search flow including ProjectService access
        every { projectService.getVerifiedProject(1L, 1L) } returns testProject
        every { entityRepository.findAllByProjectAndDeletedAtIsNull(testProject) } returns
                listOf(testEntity)
        every { metricsService.recordEntitySearch(any(), any(), any(), any()) } returns Unit

        // When
        val result =
                entityService.searchEntities(
                        1L,
                        io.mytherion.entity.dto.EntitySearchRequest(page = 0, size = 20)
                )

        // Then
        assertEquals(1, result.totalElements)
        assertEquals("Test Character", result.content[0].name)
    }

    @Test
    fun `searchEntities should throw ProjectNotFoundException when project does not exist`() {
        // Given
        every { projectService.getVerifiedProject(999L, 1L) } throws ProjectNotFoundException(999L)

        // When/Then
        assertThrows<ProjectNotFoundException> {
            entityService.searchEntities(
                    999L,
                    io.mytherion.entity.dto.EntitySearchRequest(page = 0, size = 20)
            )
        }
    }

    @Test
    fun `searchEntities should throw ProjectAccessDeniedException when user does not own project`() {
        // Given - ownership check is now delegated to ProjectService.getVerifiedProject
        every { projectService.getVerifiedProject(2L, 1L) } throws ProjectAccessDeniedException(2L)

        // When/Then
        assertThrows<ProjectAccessDeniedException> {
            entityService.searchEntities(
                    2L,
                    io.mytherion.entity.dto.EntitySearchRequest(page = 0, size = 20)
            )
        }
    }
}
