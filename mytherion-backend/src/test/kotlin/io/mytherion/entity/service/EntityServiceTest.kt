package io.mytherion.entity.service

import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.auth.CurrentUserProvider
import io.mytherion.category.repository.CategoryRepository
import io.mytherion.entity.dto.CreateEntityRequest
import io.mytherion.entity.dto.UpdateEntityRequest
import io.mytherion.entity.exception.EntityNotFoundException
import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.monitoring.MetricsService
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.service.ProjectService
import io.mytherion.storage.StorageService
import io.mytherion.user.model.User
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Instant
import java.util.*

class EntityServiceTest {

    private lateinit var entityService: EntityService
    private lateinit var entityRepository: EntityRepository
    private lateinit var projectService: ProjectService
    private lateinit var categoryRepository: CategoryRepository
    private lateinit var currentUserProvider: CurrentUserProvider
    private lateinit var storageService: StorageService
    private lateinit var metricsService: MetricsService

    private lateinit var testUser: User
    private lateinit var testProject: Project
    private lateinit var testEntity: Entity

    @BeforeEach
    fun setup() {
        entityRepository = mockk()
        categoryRepository = mockk()
        projectService = mockk()
        currentUserProvider = mockk()
        storageService = mockk()
        metricsService = mockk()

        entityService =
            EntityService(
                entityRepository,
                categoryRepository,
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
    fun `createEntity should create entity successfully`() {
        // Given
        val request =
            CreateEntityRequest(
                type = EntityType.CHARACTER,
                name = "New Character",
                description = "Detailed description",
                tags = listOf("hero", "mage")
            )

        every { projectService.getVerifiedProject(1L, 1L) } returns testProject
        every { entityRepository.save(any()) } returns testEntity

        // When
        val result = entityService.createEntity(1L, request)

        // Then
        assertNotNull(result)
        assertEquals(testEntity.id, result.id)
        verify { entityRepository.save(any()) }
    }

    @Test
    fun `createEntity should throw exception when project not found`() {
        // Given
        val request = CreateEntityRequest(type = EntityType.CHARACTER, name = "New Character")

        every { projectService.getVerifiedProject(1L, 1L) } throws ProjectNotFoundException(1L)

        // When/Then
        assertThrows<ProjectNotFoundException> {
            entityService.createEntity(1L, request)
        }
    }

    @Test
    fun `getEntity should return entity when authorized`() {
        // Given
        every { entityRepository.findById(1L) } returns Optional.of(testEntity)

        // When
        val result = entityService.getEntity(1L)

        // Then
        assertNotNull(result)
        assertEquals(testEntity.id, result.id)
        assertEquals(testEntity.name, result.name)
    }

    @Test
    fun `getEntity should throw exception when entity not found`() {
        // Given
        every { entityRepository.findById(1L) } returns Optional.empty()

        // When/Then
        assertThrows<EntityNotFoundException> { entityService.getEntity(1L) }
    }

    @Test
    fun `getEntity should throw exception when entity is deleted`() {
        // Given
        testEntity.deletedAt = Instant.now()
        every { entityRepository.findById(1L) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> { entityService.getEntity(1L) }
    }

    @Test
    fun `updateEntity should update entity successfully`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name",)

        every { entityRepository.findById(1L) } returns Optional.of(testEntity)
        every { entityRepository.save(any()) } returns testEntity

        // When
        val result = entityService.updateEntity(1L, request)

        // Then
        assertNotNull(result)
        verify { entityRepository.save(any()) }
    }

    @Test
    fun `deleteEntity should soft delete entity`() {
        // Given
        every { entityRepository.findById(1L) } returns Optional.of(testEntity)
        every { entityRepository.save(any()) } returns testEntity

        // When
        entityService.deleteEntity(1L)

        // Then
        verify { entityRepository.save(match { it.deletedAt != null }) }
    }

    @Test
    fun `deleteEntity should throw exception when entity already deleted`() {
        // Given
        testEntity.deletedAt = Instant.now()
        every { entityRepository.findById(1L) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> { entityService.deleteEntity(1L) }
    }

    @Test
    fun `searchEntities should call custom repository method`() {
        // Given
        val request = io.mytherion.entity.dto.EntitySearchRequest(
            page = 0,
            size = 20,
            type = EntityType.CHARACTER,
            search = "test",
            tags = listOf("hero")
        )
        val pageable = org.springframework.data.domain.PageRequest.of(
            0, 20, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        )
        val mockPage = org.springframework.data.domain.PageImpl(listOf(testEntity), pageable, 1)
        
        every { projectService.getVerifiedProject(1L, 1L) } returns testProject
        every { entityRepository.searchEntities(any(), any(), any(), any(), any(), any()) } returns mockPage
        every { metricsService.recordEntitySearch(any(), any(), any(), any()) } returns Unit

        // When
        val result = entityService.searchEntities(1L, request)

        // Then
        assertNotNull(result)
        assertEquals(1, result.totalElements)
        assertEquals(testEntity.id, result.content[0].id)
        verify { entityRepository.searchEntities(any(), any(), any(), any(), any(), any()) }
    }
}
