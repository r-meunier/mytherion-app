package io.mytherion.entity.service

import io.mockk.*
import io.mytherion.entity.dto.CreateEntityRequest
import io.mytherion.entity.dto.UpdateEntityRequest
import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.monitoring.MetricsService
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.storage.StorageService
import io.mytherion.user.model.User
import io.mytherion.user.repository.UserRepository
import java.time.Instant
import java.util.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class EntityServiceTest {

    private lateinit var entityService: EntityService
    private lateinit var entityRepository: EntityRepository
    private lateinit var projectRepository: ProjectRepository
    private lateinit var userRepository: UserRepository
    private lateinit var storageService: StorageService
    private lateinit var metricsService: MetricsService

    private lateinit var testUser: User
    private lateinit var testProject: Project
    private lateinit var testEntity: Entity

    @BeforeEach
    fun setup() {
        entityRepository = mockk()
        projectRepository = mockk()
        userRepository = mockk()
        storageService = mockk()

        entityService =
                EntityService(
                        entityRepository,
                        projectRepository,
                        userRepository,
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

        // Mock user repository to return test user
        every { userRepository.findById(1L) } returns Optional.of(testUser)
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
                        summary = "A new character",
                        description = "Detailed description",
                        tags = listOf("hero", "mage")
                )

        every { projectRepository.findByIdAndDeletedAtIsNull(1L) } returns testProject
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

        every { projectRepository.findByIdAndDeletedAtIsNull(1L) } returns null

        // When/Then
        assertThrows<io.mytherion.project.exception.ProjectNotFoundException> {
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
        val request = UpdateEntityRequest(name = "Updated Name", summary = "Updated summary")

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
}
