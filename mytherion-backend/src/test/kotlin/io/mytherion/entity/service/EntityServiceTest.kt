package io.mytherion.entity.service

import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.category.repository.CategoryRepository
import io.mytherion.entity.dto.CreateEntityRequest
import io.mytherion.entity.dto.UpdateEntityRequest
import io.mytherion.entity.exception.EntityNotFoundException
import io.mytherion.entity.exception.ImageNotFoundException
import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.platform.monitoring.MetricsService
import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.service.ProjectService
import io.mytherion.platform.storage.StorageService
import io.mytherion.user.model.User
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.mock.web.MockMultipartFile
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
    private lateinit var otherProject: Project
    private lateinit var testEntity: Entity

    private val projectId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val otherProjectId = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val entityId = UUID.fromString("00000000-0000-0000-0000-000000000001")

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
                username = "testuser",
                email = "test@example.com",
                passwordHash = "hashedpassword",
                emailVerified = true
            ).apply {
                this.id = UUID.fromString("00000000-0000-0000-0000-000000000001")
            }

        testProject =
            Project(
                owner = testUser,
                name = "Test Project",
                description = "Test Description"
            ).apply {
                this.id = projectId
            }

        otherProject =
            Project(
                owner = testUser,
                name = "Other Project",
                description = "Other Description"
            ).apply {
                this.id = otherProjectId
            }

        testEntity =
            Entity(
                project = testProject,
                type = EntityType.CHARACTER,
                name = "Test Character",
                description = "Detailed description"
            ).apply {
                this.id = entityId
            }

        // Mock current user provider to return test user
        every { currentUserProvider.getCurrentUser() } returns testUser

        // Default project verification succeeds for testProject
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } returns testProject
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    // ==================== Create Entity Tests ====================

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

        every { entityRepository.save(any()) } returns testEntity

        // When
        val result = entityService.createEntity(projectId, request)

        // Then
        assertNotNull(result)
        assertEquals(testEntity.id, result.id)
        verify { entityRepository.save(any()) }
    }

    @Test
    fun `createEntity should throw exception when project not found`() {
        // Given
        val request = CreateEntityRequest(type = EntityType.CHARACTER, name = "New Character")
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } throws ProjectNotFoundException(projectId)

        // When/Then
        assertThrows<ProjectNotFoundException> {
            entityService.createEntity(projectId, request)
        }
    }

    // ==================== Get Entity Tests ====================

    @Test
    fun `getEntity should return entity when authorized and project matches`() {
        // Given
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When
        val result = entityService.getEntity(projectId, entityId)

        // Then
        assertNotNull(result)
        assertEquals(testEntity.id, result.id)
        assertEquals(testEntity.name, result.name)
    }

    @Test
    fun `getEntity should throw exception when entity belongs to a different project`() {
        // Given: testEntity belongs to testProject (projectId), but requested under otherProjectId
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> {
            entityService.getEntity(otherProjectId, entityId)
        }
    }

    @Test
    fun `getEntity should throw exception when user does not have access to project`() {
        // Given
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } throws ProjectAccessDeniedException(projectId)

        // When/Then
        assertThrows<ProjectAccessDeniedException> {
            entityService.getEntity(projectId, entityId)
        }
    }

    @Test
    fun `getEntity should throw exception when entity not found`() {
        // Given
        every { entityRepository.findById(entityId) } returns Optional.empty()

        // When/Then
        assertThrows<EntityNotFoundException> { entityService.getEntity(projectId, entityId) }
    }

    @Test
    fun `getEntity should throw exception when entity is deleted`() {
        // Given
        testEntity.deletedAt = Instant.now()
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> { entityService.getEntity(projectId, entityId) }
    }

    // ==================== Update Entity Tests ====================

    @Test
    fun `updateEntity should update entity successfully`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name")

        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)
        every { entityRepository.save(any()) } returns testEntity

        // When
        val result = entityService.updateEntity(projectId, entityId, request)

        // Then
        assertNotNull(result)
        verify { entityRepository.save(any()) }
    }

    @Test
    fun `updateEntity should throw exception when entity belongs to different project`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name")
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> {
            entityService.updateEntity(otherProjectId, entityId, request)
        }
    }

    @Test
    fun `updateEntity should throw exception when user lacks project access`() {
        // Given
        val request = UpdateEntityRequest(name = "Updated Name")
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } throws ProjectAccessDeniedException(projectId)

        // When/Then
        assertThrows<ProjectAccessDeniedException> {
            entityService.updateEntity(projectId, entityId, request)
        }
    }

    // ==================== Delete Entity Tests ====================

    @Test
    fun `deleteEntity should soft delete entity`() {
        // Given
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)
        every { entityRepository.save(any()) } returns testEntity

        // When
        entityService.deleteEntity(projectId, entityId)

        // Then
        verify { entityRepository.save(match { it.deletedAt != null }) }
    }

    @Test
    fun `deleteEntity should throw exception when entity belongs to different project`() {
        // Given
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> {
            entityService.deleteEntity(otherProjectId, entityId)
        }
    }

    @Test
    fun `deleteEntity should throw exception when entity already deleted`() {
        // Given
        testEntity.deletedAt = Instant.now()
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> { entityService.deleteEntity(projectId, entityId) }
    }

    // ==================== Image Tests ====================

    @Test
    fun `uploadImage should upload image when authorized and project matches`() {
        // Given
        val file = MockMultipartFile("file", "image.png", "image/png", "bytes".toByteArray())
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)
        every { storageService.uploadFile(any(), any(), any(), any(), any()) } returns "http://minio/image.png"
        every { metricsService.recordStorageUpload(any(), any(), any(), any()) } returns Unit
        every { entityRepository.save(any()) } returns testEntity

        // When
        val response = entityService.uploadImage(projectId, entityId, file)

        // Then
        assertNotNull(response)
        assertEquals("http://minio/image.png", response.url)
        verify { entityRepository.save(match { it.thumbnail == "http://minio/image.png" }) }
    }

    @Test
    fun `uploadImage should throw exception when entity belongs to different project`() {
        // Given
        val file = MockMultipartFile("file", "image.png", "image/png", "bytes".toByteArray())
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> {
            entityService.uploadImage(otherProjectId, entityId, file)
        }
    }

    @Test
    fun `deleteImage should delete image when authorized and thumbnail present`() {
        // Given
        testEntity.thumbnail = "test-bucket/entities/1/image.png"
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)
        every { storageService.deleteFile(any(), any()) } returns Unit
        every { entityRepository.save(any()) } returns testEntity

        // When
        entityService.deleteImage(projectId, entityId)

        // Then
        verify { storageService.deleteFile("test-bucket", "entities/1/image.png") }
        verify { entityRepository.save(match { it.thumbnail == null }) }
    }

    @Test
    fun `deleteImage should throw ImageNotFoundException when entity has no thumbnail`() {
        // Given
        testEntity.thumbnail = null
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<ImageNotFoundException> {
            entityService.deleteImage(projectId, entityId)
        }
    }

    @Test
    fun `deleteImage should throw exception when entity belongs to different project`() {
        // Given
        testEntity.thumbnail = "test-bucket/entities/1/image.png"
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entityRepository.findById(entityId) } returns Optional.of(testEntity)

        // When/Then
        assertThrows<EntityNotFoundException> {
            entityService.deleteImage(otherProjectId, entityId)
        }
    }

    // ==================== Search Entities Tests ====================

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
        
        every { entityRepository.searchEntities(any(), any(), any(), any(), any(), any()) } returns mockPage
        every { metricsService.recordEntitySearch(any(), any(), any(), any()) } returns Unit

        // When
        val result = entityService.searchEntities(projectId, request)

        // Then
        assertNotNull(result)
        assertEquals(1, result.totalElements)
        assertEquals(testEntity.id, result.content[0].id)
        verify { entityRepository.searchEntities(any(), any(), any(), any(), any(), any()) }
    }
}
