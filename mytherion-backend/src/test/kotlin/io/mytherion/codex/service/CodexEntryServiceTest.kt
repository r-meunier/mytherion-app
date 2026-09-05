package io.mytherion.codex.service

import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.dto.CreateEntryRequest
import io.mytherion.codex.dto.UpdateEntryRequest
import io.mytherion.codex.exception.EntryNotFoundException
import io.mytherion.codex.exception.ThumbnailNotFoundException
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
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

class CodexEntryServiceTest {

    private lateinit var entryService: CodexEntryService
    private lateinit var entryRepository: CodexEntryRepository
    private lateinit var projectService: ProjectService
    private lateinit var currentUserProvider: CurrentUserProvider
    private lateinit var storageService: StorageService
    private lateinit var metricsService: MetricsService

    private lateinit var testUser: User
    private lateinit var testProject: Project
    private lateinit var otherProject: Project
    private lateinit var testEntry: CodexEntry

    private val projectId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val otherProjectId = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val entryId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @BeforeEach
    fun setup() {
        entryRepository = mockk()
        projectService = mockk()
        currentUserProvider = mockk()
        storageService = mockk()
        metricsService = mockk()

        entryService =
            CodexEntryService(
                entryRepository,
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

        testEntry =
            CodexEntry(
                project = testProject,
                type = EntryType.CHARACTER,
                name = "Test Character",
                description = "Detailed description"
            ).apply {
                this.id = entryId
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

    // ==================== Create CodexEntry Tests ====================

    @Test
    fun `createEntry should create entry successfully`() {
        // Given
        val request =
            CreateEntryRequest(
                type = EntryType.CHARACTER,
                name = "New Character",
                description = "Detailed description",
                tags = listOf("hero", "mage")
            )

        every { entryRepository.save(any()) } returns testEntry

        // When
        val result = entryService.createEntry(projectId, request)

        // Then
        assertNotNull(result)
        assertEquals(testEntry.id, result.id)
        verify { entryRepository.save(any()) }
    }

    @Test
    fun `createEntry should throw exception when project not found`() {
        // Given
        val request = CreateEntryRequest(type = EntryType.CHARACTER, name = "New Character")
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } throws ProjectNotFoundException(projectId)

        // When/Then
        assertThrows<ProjectNotFoundException> {
            entryService.createEntry(projectId, request)
        }
    }

    // ==================== Get CodexEntry Tests ====================

    @Test
    fun `getEntry should return entry when authorized and project matches`() {
        // Given
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When
        val result = entryService.getEntry(projectId, entryId)

        // Then
        assertNotNull(result)
        assertEquals(testEntry.id, result.id)
        assertEquals(testEntry.name, result.name)
    }

    @Test
    fun `getEntry should throw exception when entry belongs to a different project`() {
        // Given: testEntry belongs to testProject (projectId), but requested under otherProjectId
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> {
            entryService.getEntry(otherProjectId, entryId)
        }
    }

    @Test
    fun `getEntry should throw exception when user does not have access to project`() {
        // Given
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } throws ProjectAccessDeniedException(projectId)

        // When/Then
        assertThrows<ProjectAccessDeniedException> {
            entryService.getEntry(projectId, entryId)
        }
    }

    @Test
    fun `getEntry should throw exception when entry not found`() {
        // Given
        every { entryRepository.findById(entryId) } returns Optional.empty()

        // When/Then
        assertThrows<EntryNotFoundException> { entryService.getEntry(projectId, entryId) }
    }

    @Test
    fun `getEntry should throw exception when entry is deleted`() {
        // Given
        testEntry.deletedAt = Instant.now()
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> { entryService.getEntry(projectId, entryId) }
    }

    // ==================== Update CodexEntry Tests ====================

    @Test
    fun `updateEntry should update entry successfully`() {
        // Given
        val request = UpdateEntryRequest(name = "Updated Name")

        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)
        every { entryRepository.save(any()) } returns testEntry

        // When
        val result = entryService.updateEntry(projectId, entryId, request)

        // Then
        assertNotNull(result)
        verify { entryRepository.save(any()) }
    }

    @Test
    fun `updateEntry should throw exception when entry belongs to different project`() {
        // Given
        val request = UpdateEntryRequest(name = "Updated Name")
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> {
            entryService.updateEntry(otherProjectId, entryId, request)
        }
    }

    @Test
    fun `updateEntry should throw exception when user lacks project access`() {
        // Given
        val request = UpdateEntryRequest(name = "Updated Name")
        every { projectService.getVerifiedProject(projectId, testUser.id!!) } throws ProjectAccessDeniedException(projectId)

        // When/Then
        assertThrows<ProjectAccessDeniedException> {
            entryService.updateEntry(projectId, entryId, request)
        }
    }

    // ==================== Delete CodexEntry Tests ====================

    @Test
    fun `deleteEntry should soft delete entry`() {
        // Given
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)
        every { entryRepository.save(any()) } returns testEntry

        // When
        entryService.deleteEntry(projectId, entryId)

        // Then
        verify { entryRepository.save(match { it.deletedAt != null }) }
    }

    @Test
    fun `deleteEntry should throw exception when entry belongs to different project`() {
        // Given
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> {
            entryService.deleteEntry(otherProjectId, entryId)
        }
    }

    @Test
    fun `deleteEntry should throw exception when entry already deleted`() {
        // Given
        testEntry.deletedAt = Instant.now()
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> { entryService.deleteEntry(projectId, entryId) }
    }

    // ==================== Image Tests ====================

    @Test
    fun `uploadThumbnail should upload image when authorized and project matches`() {
        // Given
        val file = MockMultipartFile("file", "image.png", "image/png", "bytes".toByteArray())
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)
        every { storageService.uploadFile(any(), any(), any(), any(), any()) } returns "http://minio/image.png"
        every { metricsService.recordStorageUpload(any(), any(), any(), any()) } returns Unit
        every { entryRepository.save(any()) } returns testEntry

        // When
        val response = entryService.uploadThumbnail(projectId, entryId, file)

        // Then
        assertNotNull(response)
        assertEquals("http://minio/image.png", response.url)
        verify { entryRepository.save(match { it.thumbnail == "http://minio/image.png" }) }
    }

    @Test
    fun `uploadThumbnail should throw exception when entry belongs to different project`() {
        // Given
        val file = MockMultipartFile("file", "image.png", "image/png", "bytes".toByteArray())
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> {
            entryService.uploadThumbnail(otherProjectId, entryId, file)
        }
    }

    @Test
    fun `deleteThumbnail should delete image when authorized and thumbnail present`() {
        // Given
        testEntry.thumbnail = "test-bucket/entries/1/image.png"
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)
        every { storageService.deleteFile(any(), any()) } returns Unit
        every { entryRepository.save(any()) } returns testEntry

        // When
        entryService.deleteThumbnail(projectId, entryId)

        // Then
        verify { storageService.deleteFile("test-bucket", "entries/1/image.png") }
        verify { entryRepository.save(match { it.thumbnail == null }) }
    }

    @Test
    fun `deleteThumbnail should throw ThumbnailNotFoundException when entry has no thumbnail`() {
        // Given
        testEntry.thumbnail = null
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<ThumbnailNotFoundException> {
            entryService.deleteThumbnail(projectId, entryId)
        }
    }

    @Test
    fun `deleteThumbnail should throw exception when entry belongs to different project`() {
        // Given
        testEntry.thumbnail = "test-bucket/entries/1/image.png"
        every { projectService.getVerifiedProject(otherProjectId, testUser.id!!) } returns otherProject
        every { entryRepository.findById(entryId) } returns Optional.of(testEntry)

        // When/Then
        assertThrows<EntryNotFoundException> {
            entryService.deleteThumbnail(otherProjectId, entryId)
        }
    }

    // ==================== Search Entities Tests ====================

    @Test
    fun `searchEntries should call custom repository method`() {
        // Given
        val request = io.mytherion.codex.dto.EntrySearchRequest(
            page = 0,
            size = 20,
            type = EntryType.CHARACTER,
            search = "test",
            tags = listOf("hero")
        )
        val pageable = org.springframework.data.domain.PageRequest.of(
            0, 20, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        )
        val mockPage = org.springframework.data.domain.PageImpl(listOf(testEntry), pageable, 1)
        
        every { entryRepository.searchEntries(any(), any(), any(), any(), any()) } returns mockPage
        every { metricsService.recordEntrySearch(any(), any(), any(), any()) } returns Unit

        // When
        val result = entryService.searchEntries(projectId, request)

        // Then
        assertNotNull(result)
        assertEquals(1, result.totalElements)
        assertEquals(testEntry.id, result.content[0].id)
        verify { entryRepository.searchEntries(any(), any(), any(), any(), any()) }
    }
}
