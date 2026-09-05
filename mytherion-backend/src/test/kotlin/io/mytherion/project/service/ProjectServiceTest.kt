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
import io.mytherion.entity.service.EntityQueryService
import io.mytherion.platform.monitoring.MetricsService
import io.mytherion.fixtures.ProjectTestFixtures
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import java.util.UUID
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import java.util.Optional

@ExtendWith(MockKExtension::class)
class ProjectServiceTest {

  @MockK
  private lateinit var projectRepository: ProjectRepository

  @MockK
  private lateinit var currentUserProvider: CurrentUserProvider

  @MockK
  private lateinit var entityQueryService: EntityQueryService

  @MockK
  private lateinit var metricsService: MetricsService

  @InjectMockKs
  private lateinit var projectService: ProjectService

  private lateinit var testUser: User
  private lateinit var otherUser: User
  private lateinit var testProject: Project
  private val testUserId = UUID.randomUUID()
  private val otherUserId = UUID.randomUUID()
  private val testProjectId = UUID.randomUUID()
  private val otherProjectId = UUID.randomUUID()

  @BeforeEach
  fun setUp() {
    testUser = ProjectTestFixtures.createTestUser(id = testUserId, username = "testuser")
    otherUser =
      ProjectTestFixtures.createTestUser(
        id = otherUserId,
        username = "otheruser",
        email = "other@example.com"
      )
    testProject = ProjectTestFixtures.createTestProject(id = testProjectId, owner = testUser)

    // Mock CurrentUserProvider to return testUser
    every { currentUserProvider.getCurrentUser() } returns testUser

    // Stub metricsService calls (these methods return Unit)
    every { metricsService.recordProjectCreation(any(), any()) } just Runs
    every { metricsService.recordEntityQuery(any(), any(), any()) } just Runs
    every { metricsService.recordEntityQuery(any(), any(), any()) } just Runs

    // Default stub for entityQueryService
    every { entityQueryService.countByProject(any()) } returns 0L
    every { entityQueryService.countByProjectGrouped(any()) } returns emptyMap()
  }

  @AfterEach
  fun tearDown() {
    clearAllMocks()
  }

  // ==================== List Projects Tests ====================

  @Test
  fun `listProjectsForCurrentUser should return paginated projects`() {
    // Given
    val page = 0
    val size = 10
    val projects =
      listOf(
        testProject,
        ProjectTestFixtures.createTestProject(
          id = otherProjectId,
          owner = testUser,
          name = "Project 2"
        )
      )
    val pageRequest =
      PageRequest.of(
        page,
        size,
        Sort.by(
          Sort.Direction.DESC,
          "createdAt"
        )
      )
    val projectPage = PageImpl(projects, pageRequest, projects.size.toLong())

    every { projectRepository.findAllByOwnerAndDeletedAtIsNull(testUser, any<Pageable>()) } returns
        projectPage

    // When
    val result = projectService.listProjectsForCurrentUser(page, size, null, null)

    // Then
    assertEquals(2, result.content.size)
    assertEquals("Test Project", result.content[0].name)
    assertEquals("Project 2", result.content[1].name)
    verify { projectRepository.findAllByOwnerAndDeletedAtIsNull(testUser, any<Pageable>()) }
  }

  @Test
  fun `listProjectsForCurrentUser with search and genre should call searchProjects`() {
    // Given
    val page = 0
    val size = 10
    val projects = listOf(testProject)
    val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
    val projectPage = PageImpl(projects, pageRequest, 1L)

    every { projectRepository.searchProjects(testUser, "%test%", "Sci-Fi", any<Pageable>()) } returns projectPage

    // When
    val result = projectService.listProjectsForCurrentUser(page, size, "TeSt", "Sci-Fi")

    // Then
    assertEquals(1, result.content.size)
    assertEquals("Test Project", result.content[0].name)
    verify { projectRepository.searchProjects(testUser, "%test%", "Sci-Fi", any<Pageable>()) }
  }

  // ==================== Get Project by ID Tests ====================

  @Test
  fun `getProjectById when project exists should return project`() {
    // Given
    every { projectRepository.findByIdWithOwner(testProjectId) } returns testProject

    // When
    val result = projectService.getProjectById(testProjectId)

    // Then
    assertNotNull(result)
    assertEquals(testProjectId, result.id)
    assertEquals("Test Project", result.name)
    assertEquals(testUser.id, result.ownerId)
    verify { projectRepository.findByIdWithOwner(testProjectId) }
  }

  @Test
  fun `getProjectById when project not found should throw ProjectNotFoundException`() {
    // Given
    every { projectRepository.findByIdWithOwner(UUID.fromString("00000000-0000-0000-0000-000000000999")) } returns null

    // When & Then
    val exception =
      assertThrows<ProjectNotFoundException> {
        projectService.getProjectById(UUID.fromString("00000000-0000-0000-0000-000000000999"))
      }
    assertEquals("Project with id 00000000-0000-0000-0000-000000000999 not found", exception.message)
    verify { projectRepository.findByIdWithOwner(UUID.fromString("00000000-0000-0000-0000-000000000999")) }
  }

  @Test
  fun `getProjectById when user not owner should throw ProjectAccessDeniedException`() {
    // Given
    val otherUsersProject =
      ProjectTestFixtures.createTestProject(id = otherProjectId, owner = otherUser)
    every { projectRepository.findByIdWithOwner(otherProjectId) } returns otherUsersProject

    // When & Then
    val exception =
      assertThrows<ProjectAccessDeniedException> {
        projectService.getProjectById(otherProjectId)
      }
    assertEquals("Access denied to project with id $otherProjectId", exception.message)
    verify { projectRepository.findByIdWithOwner(otherProjectId) }
  }

  // ==================== Create Project Tests ====================

  @Test
  fun `createProject should save and return project`() {
    // Given
    val request =
      CreateProjectRequest(name = "New Project", description = "New description")
    val savedProject =
      ProjectTestFixtures.createTestProject(
        id = UUID.fromString("00000000-0000-0000-0000-000000000003"),
        owner = testUser,
        name = request.name,
        description = request.description
      )

    every { projectRepository.save(any<Project>()) } returns savedProject

    // When
    val result = projectService.createProject(request)

    // Then
    assertNotNull(result)
    assertEquals(UUID.fromString("00000000-0000-0000-0000-000000000003"), result.id)
    assertEquals("New Project", result.name)
    assertEquals("New description", result.description)
    assertEquals(testUser.id, result.ownerId)

    verify {
      projectRepository.save(
        match { project ->
          project.name == "New Project" &&
              project.description == "New description" &&
              project.owner.id == testUser.id
        }
      )
    }
  }

  // ==================== Update Project Tests ====================

  @Test
  fun `updateProject when valid should update and return project`() {
    // Given
    val request =
      UpdateProjectRequest(
        name = "Updated Name",
        description = "Updated description"
      )
    every { projectRepository.findById(testProjectId) } returns Optional.of(testProject)
    every { projectRepository.save(any<Project>()) } returns testProject

    // When
    val result = projectService.updateProject(testProjectId, request)

    // Then
    assertNotNull(result)
    assertEquals("Updated Name", testProject.name)
    assertEquals("Updated description", testProject.description)

    verify { projectRepository.findById(testProjectId) }
    verify { projectRepository.save(testProject) }
  }

  @Test
  fun `updateProject with partial data should update only provided fields`() {
    // Given
    val request = UpdateProjectRequest(name = "Only Name Updated", description = null)
    every { projectRepository.findById(testProjectId) } returns Optional.of(testProject)
    every { projectRepository.save(any<Project>()) } returns testProject

    // When
    val result = projectService.updateProject(testProjectId, request)

    // Then
    assertEquals("Only Name Updated", testProject.name)
    assertEquals(
      "Test project description",
      testProject.description
    ) // Should remain unchanged

    verify { projectRepository.save(testProject) }
  }

  @Test
  fun `updateProject when project not found should throw ProjectNotFoundException`() {
    // Given
    val request = UpdateProjectRequest(name = "Updated Name")
    every { projectRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000999")) } returns Optional.empty()

    // When & Then
    val exception =
      assertThrows<ProjectNotFoundException> {
        projectService.updateProject(UUID.fromString("00000000-0000-0000-0000-000000000999"), request)
      }
    assertEquals("Project with id 00000000-0000-0000-0000-000000000999 not found", exception.message)
    verify(exactly = 0) { projectRepository.save(any()) }
  }

  @Test
  fun `updateProject when user not owner should throw ProjectAccessDeniedException`() {
    // Given
    val otherUsersProject =
      ProjectTestFixtures.createTestProject(id = otherProjectId, owner = otherUser)
    val request = UpdateProjectRequest(name = "Hacked Name")
    every { projectRepository.findById(otherProjectId) } returns Optional.of(otherUsersProject)

    // When & Then
    val exception =
      assertThrows<ProjectAccessDeniedException> {
        projectService.updateProject(otherProjectId, request)
      }
    assertEquals("Access denied to project with id $otherProjectId", exception.message)
    verify(exactly = 0) { projectRepository.save(any()) }
  }

  // ==================== Delete Project Tests ====================

  @Test
  fun `deleteProject when valid should delete project`() {
    // Given
    every { projectRepository.findById(testProjectId) } returns Optional.of(testProject)
    every { entityQueryService.countByProject(testProject) } returns 0L
    every { projectRepository.save(testProject) } returns testProject

    // When
    projectService.deleteProject(testProjectId)

    // Then
    verify { projectRepository.findById(testProjectId) }
    verify { entityQueryService.countByProject(testProject) }
    verify { projectRepository.save(testProject) }
    assertTrue(testProject.isDeleted(), "Project should be marked as deleted")
  }

  @Test
  fun `deleteProject when project not found should throw ProjectNotFoundException`() {
    // Given
    every { projectRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000999")) } returns Optional.empty()

    // When & Then
    val exception =
      assertThrows<ProjectNotFoundException> {
        projectService.deleteProject(UUID.fromString("00000000-0000-0000-0000-000000000999"))
      }
    assertEquals("Project with id 00000000-0000-0000-0000-000000000999 not found", exception.message)
    verify(exactly = 0) { projectRepository.save(any()) }
  }

  @Test
  fun `deleteProject when user not owner should throw ProjectAccessDeniedException`() {
    // Given
    val otherUsersProject =
      ProjectTestFixtures.createTestProject(id = otherProjectId, owner = otherUser)
    every { projectRepository.findById(otherProjectId) } returns Optional.of(otherUsersProject)

    // When & Then
    val exception =
      assertThrows<ProjectAccessDeniedException> {
        projectService.deleteProject(otherProjectId)
      }
    assertEquals("Access denied to project with id $otherProjectId", exception.message)
    verify(exactly = 0) { projectRepository.save(any()) }
  }

  // ==================== Get Project Stats Tests ====================

  @Test
  fun `getProjectStats should return stats with entity counts`() {
    // Given
    val projectId = testProjectId
    every { projectRepository.findById(projectId) } returns Optional.of(testProject)
    every { entityQueryService.countByProject(testProject) } returns 10L
    every { entityQueryService.countByProjectGrouped(testProject) } returns
        mapOf("CHARACTER" to 5, "LOCATION" to 5)

    // When
    val result = projectService.getProjectStats(projectId)

    // Then
    assertNotNull(result)
    assertEquals(projectId, result.id)
    assertEquals("Test Project", result.name)
    assertEquals(10, result.entityCount)
    assertEquals(5, result.entityCountByType["CHARACTER"])
    assertEquals(5, result.entityCountByType["LOCATION"])

    verify { entityQueryService.countByProject(testProject) }
    verify { entityQueryService.countByProjectGrouped(testProject) }
  }

  @Test
  fun `getProjectStats should return empty stats for project with no entities`() {
    // Given
    val projectId = testProjectId
    every { projectRepository.findById(projectId) } returns Optional.of(testProject)
    every { entityQueryService.countByProject(testProject) } returns 0L
    every { entityQueryService.countByProjectGrouped(testProject) } returns emptyMap()

    // When
    val result = projectService.getProjectStats(projectId)

    // Then
    assertNotNull(result)
    assertEquals(0, result.entityCount)
    assertTrue(result.entityCountByType.isEmpty())
  }

  @Test
  fun `getProjectStats when project not found should throw ProjectNotFoundException`() {
    // Given
    every { projectRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000999")) } returns Optional.empty()

    // When & Then
    val exception =
      assertThrows<ProjectNotFoundException> {
        projectService.getProjectStats(UUID.fromString("00000000-0000-0000-0000-000000000999"))
      }
    assertEquals("Project with id 00000000-0000-0000-0000-000000000999 not found", exception.message)
  }

  @Test
  fun `getProjectStats when user not owner should throw ProjectAccessDeniedException`() {
    // Given
    val otherUsersProject =
      ProjectTestFixtures.createTestProject(id = otherProjectId, owner = otherUser)
    every { projectRepository.findById(otherProjectId) } returns Optional.of(otherUsersProject)

    // When & Then
    val exception =
      assertThrows<ProjectAccessDeniedException> {
        projectService.getProjectStats(otherProjectId)
      }
    assertEquals("Access denied to project with id $otherProjectId", exception.message)
  }
}
