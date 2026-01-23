package io.mytherion.project.service

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mytherion.project.ProjectTestFixtures
import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import java.util.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder

@ExtendWith(MockKExtension::class)
class ProjectServiceTest {

        @MockK private lateinit var projectRepository: ProjectRepository

        @MockK private lateinit var userRepository: UserRepository

        @MockK
        private lateinit var entityRepository: io.mytherion.entity.repository.EntityRepository

        @MockK private lateinit var metricsService: io.mytherion.monitoring.MetricsService

        @InjectMockKs private lateinit var projectService: ProjectService

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

                // Mock Security Context
                mockkStatic(SecurityContextHolder::class)
                val securityContext = mockk<SecurityContext>()
                val authentication = mockk<Authentication>()

                every { SecurityContextHolder.getContext() } returns securityContext
                every { securityContext.authentication } returns authentication
                every { authentication.isAuthenticated } returns true
                every { authentication.principal } returns 1L

                // Mock getCurrentUser() to return testUser
                every { userRepository.findById(1L) } returns Optional.of(testUser)

                // Stub metricsService calls (these methods return Unit)
                every { metricsService.recordProjectCreation(any(), any()) } just Runs
                every { metricsService.recordEntityQuery(any(), any(), any()) } just Runs
        }

        @AfterEach
        fun tearDown() {
                unmockkStatic(SecurityContextHolder::class)
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
                                        id = 2L,
                                        owner = testUser,
                                        name = "Project 2"
                                )
                        )
                val pageRequest =
                        PageRequest.of(
                                page,
                                size,
                                org.springframework.data.domain.Sort.by(
                                        org.springframework.data.domain.Sort.Direction.DESC,
                                        "createdAt"
                                )
                        )
                val projectPage = PageImpl(projects, pageRequest, projects.size.toLong())

                every { projectRepository.findAllByOwner(testUser, any<Pageable>()) } returns
                        projectPage

                // When
                val result = projectService.listProjectsForCurrentUser(page, size)

                // Then
                assertEquals(2, result.content.size)
                assertEquals("Test Project", result.content[0].name)
                assertEquals("Project 2", result.content[1].name)
                verify { projectRepository.findAllByOwner(testUser, any<Pageable>()) }
        }

        // ==================== Get Project by ID Tests ====================

        @Test
        fun `getProjectById when project exists should return project`() {
                // Given
                every { projectRepository.findById(1L) } returns Optional.of(testProject)

                // When
                val result = projectService.getProjectById(1L)

                // Then
                assertNotNull(result)
                assertEquals(1L, result.id)
                assertEquals("Test Project", result.name)
                assertEquals(testUser.id, result.ownerId)
                verify { projectRepository.findById(1L) }
        }

        @Test
        fun `getProjectById when project not found should throw ProjectNotFoundException`() {
                // Given
                every { projectRepository.findById(999L) } returns Optional.empty()

                // When & Then
                val exception =
                        assertThrows<ProjectNotFoundException> {
                                projectService.getProjectById(999L)
                        }
                assertEquals("Project with id 999 not found", exception.message)
                verify { projectRepository.findById(999L) }
        }

        @Test
        fun `getProjectById when user not owner should throw ProjectAccessDeniedException`() {
                // Given
                val otherUsersProject =
                        ProjectTestFixtures.createTestProject(id = 2L, owner = otherUser)
                every { projectRepository.findById(2L) } returns Optional.of(otherUsersProject)

                // When & Then
                val exception =
                        assertThrows<ProjectAccessDeniedException> {
                                projectService.getProjectById(2L)
                        }
                assertEquals("Access denied to project with id 2", exception.message)
                verify { projectRepository.findById(2L) }
        }

        // ==================== Create Project Tests ====================

        @Test
        fun `createProject should save and return project`() {
                // Given
                val request =
                        CreateProjectRequest(name = "New Project", description = "New description")
                val savedProject =
                        ProjectTestFixtures.createTestProject(
                                id = 3L,
                                owner = testUser,
                                name = request.name,
                                description = request.description
                        )

                every { projectRepository.save(any<Project>()) } returns savedProject

                // When
                val result = projectService.createProject(request)

                // Then
                assertNotNull(result)
                assertEquals(3L, result.id)
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
                every { projectRepository.findById(1L) } returns Optional.of(testProject)
                every { projectRepository.save(any<Project>()) } returns testProject

                // When
                val result = projectService.updateProject(1L, request)

                // Then
                assertNotNull(result)
                assertEquals("Updated Name", testProject.name)
                assertEquals("Updated description", testProject.description)

                verify { projectRepository.findById(1L) }
                verify { projectRepository.save(testProject) }
        }

        @Test
        fun `updateProject with partial data should update only provided fields`() {
                // Given
                val request = UpdateProjectRequest(name = "Only Name Updated", description = null)
                every { projectRepository.findById(1L) } returns Optional.of(testProject)
                every { projectRepository.save(any<Project>()) } returns testProject

                // When
                val result = projectService.updateProject(1L, request)

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
                every { projectRepository.findById(999L) } returns Optional.empty()

                // When & Then
                val exception =
                        assertThrows<ProjectNotFoundException> {
                                projectService.updateProject(999L, request)
                        }
                assertEquals("Project with id 999 not found", exception.message)
                verify(exactly = 0) { projectRepository.save(any()) }
        }

        @Test
        fun `updateProject when user not owner should throw ProjectAccessDeniedException`() {
                // Given
                val otherUsersProject =
                        ProjectTestFixtures.createTestProject(id = 2L, owner = otherUser)
                val request = UpdateProjectRequest(name = "Hacked Name")
                every { projectRepository.findById(2L) } returns Optional.of(otherUsersProject)

                // When & Then
                val exception =
                        assertThrows<ProjectAccessDeniedException> {
                                projectService.updateProject(2L, request)
                        }
                assertEquals("Access denied to project with id 2", exception.message)
                verify(exactly = 0) { projectRepository.save(any()) }
        }

        // ==================== Delete Project Tests ====================

        @Test
        fun `deleteProject when valid should delete project`() {
                // Given
                every { projectRepository.findById(1L) } returns Optional.of(testProject)
                every { entityRepository.countByProjectAndDeletedAtIsNull(testProject) } returns 0L
                every { projectRepository.delete(testProject) } just Runs

                // When
                projectService.deleteProject(1L)

                // Then
                verify { projectRepository.findById(1L) }
                verify { entityRepository.countByProjectAndDeletedAtIsNull(testProject) }
                verify { projectRepository.delete(testProject) }
        }

        @Test
        fun `deleteProject when project not found should throw ProjectNotFoundException`() {
                // Given
                every { projectRepository.findById(999L) } returns Optional.empty()

                // When & Then
                val exception =
                        assertThrows<ProjectNotFoundException> {
                                projectService.deleteProject(999L)
                        }
                assertEquals("Project with id 999 not found", exception.message)
                verify(exactly = 0) { projectRepository.delete(any()) }
        }

        @Test
        fun `deleteProject when user not owner should throw ProjectAccessDeniedException`() {
                // Given
                val otherUsersProject =
                        ProjectTestFixtures.createTestProject(id = 2L, owner = otherUser)
                every { projectRepository.findById(2L) } returns Optional.of(otherUsersProject)

                // When & Then
                val exception =
                        assertThrows<ProjectAccessDeniedException> {
                                projectService.deleteProject(2L)
                        }
                assertEquals("Access denied to project with id 2", exception.message)
                verify(exactly = 0) { projectRepository.delete(any()) }
        }

        // ==================== Get Project Stats Tests ====================

        @Test
        fun `getProjectStats should return stats with entity counts`() {
                // Given
                val projectId = 1L
                every { projectRepository.findById(projectId) } returns Optional.of(testProject)
                every { entityRepository.countByProjectAndDeletedAtIsNull(testProject) } returns 10L

                val typeCountMock1 =
                        mockk<io.mytherion.entity.repository.EntityRepository.EntityTypeCount>()
                every { typeCountMock1.getType() } returns
                        io.mytherion.entity.model.EntityType.CHARACTER
                every { typeCountMock1.getCount() } returns 5L

                val typeCountMock2 =
                        mockk<io.mytherion.entity.repository.EntityRepository.EntityTypeCount>()
                every { typeCountMock2.getType() } returns
                        io.mytherion.entity.model.EntityType.LOCATION
                every { typeCountMock2.getCount() } returns 5L

                every { entityRepository.countByProjectAndTypeGrouped(testProject) } returns
                        listOf(typeCountMock1, typeCountMock2)

                // When
                val result = projectService.getProjectStats(projectId)

                // Then
                assertNotNull(result)
                assertEquals(projectId, result.id)
                assertEquals("Test Project", result.name)
                assertEquals(10, result.entityCount)
                assertEquals(5, result.entityCountByType["CHARACTER"])
                assertEquals(5, result.entityCountByType["LOCATION"])

                verify { entityRepository.countByProjectAndDeletedAtIsNull(testProject) }
                verify { entityRepository.countByProjectAndTypeGrouped(testProject) }
        }

        @Test
        fun `getProjectStats should return empty stats for project with no entities`() {
                // Given
                val projectId = 1L
                every { projectRepository.findById(projectId) } returns Optional.of(testProject)
                every { entityRepository.countByProjectAndDeletedAtIsNull(testProject) } returns 0L
                every { entityRepository.countByProjectAndTypeGrouped(testProject) } returns
                        emptyList()

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
                every { projectRepository.findById(999L) } returns Optional.empty()

                // When & Then
                val exception =
                        assertThrows<ProjectNotFoundException> {
                                projectService.getProjectStats(999L)
                        }
                assertEquals("Project with id 999 not found", exception.message)
        }

        @Test
        fun `getProjectStats when user not owner should throw ProjectAccessDeniedException`() {
                // Given
                val otherUsersProject =
                        ProjectTestFixtures.createTestProject(id = 2L, owner = otherUser)
                every { projectRepository.findById(2L) } returns Optional.of(otherUsersProject)

                // When & Then
                val exception =
                        assertThrows<ProjectAccessDeniedException> {
                                projectService.getProjectStats(2L)
                        }
                assertEquals("Access denied to project with id 2", exception.message)
        }
}
