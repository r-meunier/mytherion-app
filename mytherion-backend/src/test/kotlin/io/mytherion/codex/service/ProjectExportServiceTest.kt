package io.mytherion.codex.service

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.platform.storage.StorageException
import io.mytherion.platform.storage.StorageService
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.model.Project
import io.mytherion.project.service.ProjectService
import io.mytherion.user.model.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import tools.jackson.databind.json.JsonMapper
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.time.LocalDate
import java.util.UUID
import java.util.zip.ZipInputStream

class ProjectExportServiceTest {

    private val user = User(username = "author", email = "author@test.dev", passwordHash = "hash")
        .apply { id = UUID.fromString("00000000-0000-0000-0000-000000000001") }
    private val projectId = UUID.fromString("0d9c0000-0000-0000-0000-000000000001")
    private val project = Project(owner = user, name = "Stellar Drift").apply { id = projectId }

    private val entryRepository = mockk<CodexEntryRepository>()
    private val projectService = mockk<ProjectService>()
    private val currentUserProvider = mockk<CurrentUserProvider> { every { getCurrentUser() } returns user }
    private val storageService = mockk<StorageService>()
    private val service = ProjectExportService(
        entryRepository, projectService, currentUserProvider, storageService, JsonMapper.builder().build(), "mytherion-uploads",
    )

    private fun entry(name: String, thumbnail: String? = null) =
        CodexEntry(project = project, name = name, type = EntryType.CHARACTER, thumbnail = thumbnail)
            .apply { id = UUID.randomUUID() }

    private fun fileNames(export: ProjectExport): List<String> {
        val out = ByteArrayOutputStream()
        export.writeTo(out)
        return ZipInputStream(ByteArrayInputStream(out.toByteArray())).use { zip -> generateSequence { zip.nextEntry?.name }.toList() }
    }

    @Test
    fun `exports the project's entries and images, named after the project and the date`() {
        val mira = entry("Mira Vell", thumbnail = "mytherion-uploads/entries/x/1737_mira.PNG")
        every { projectService.getVerifiedProject(projectId, user.id!!) } returns project
        every { entryRepository.findAllByProjectOrderByNameAsc(project) } returns listOf(mira)
        every { storageService.downloadFile("mytherion-uploads", "entries/x/1737_mira.PNG") } returns byteArrayOf(9)

        val export = service.exportProject(projectId)

        assertEquals("stellar-drift-${LocalDate.now()}.zip", export.fileName)
        assertEquals(
            listOf("stellar-drift/project.json", "stellar-drift/codex/characters/mira-vell.md", "stellar-drift/media/${mira.id}.png"),
            fileNames(export),
        )
    }

    @Test
    fun `an image that cannot be read leaves that entry without its image instead of failing the export`() {
        val mira = entry("Mira Vell", thumbnail = "mytherion-uploads/entries/x/mira.png")
        val kael = entry("Kael", thumbnail = "mytherion-uploads/entries/y/kael.png")
        every { projectService.getVerifiedProject(projectId, user.id!!) } returns project
        every { entryRepository.findAllByProjectOrderByNameAsc(project) } returns listOf(kael, mira)
        every { storageService.downloadFile(any(), "entries/x/mira.png") } throws StorageException("gone", RuntimeException())
        every { storageService.downloadFile(any(), "entries/y/kael.png") } returns byteArrayOf(1)

        val names = fileNames(service.exportProject(projectId))

        assertTrue(names.contains("stellar-drift/codex/characters/mira-vell.md"))
        assertTrue(names.contains("stellar-drift/media/${kael.id}.png"))
        assertFalse(names.any { it.contains(mira.id.toString()) }, "no media file for the unreadable image")
    }

    @Test
    fun `images are fetched only while the zip is written, not while the export is prepared`() {
        val mira = entry("Mira Vell", thumbnail = "mytherion-uploads/entries/x/mira.png")
        every { projectService.getVerifiedProject(projectId, user.id!!) } returns project
        every { entryRepository.findAllByProjectOrderByNameAsc(project) } returns listOf(mira)
        every { storageService.downloadFile(any(), any()) } returns byteArrayOf(1)

        val export = service.exportProject(projectId)
        verify(exactly = 0) { storageService.downloadFile(any(), any()) }

        export.writeTo(ByteArrayOutputStream())
        verify(exactly = 1) { storageService.downloadFile("mytherion-uploads", "entries/x/mira.png") }
    }

    @Test
    fun `a project that is not yours is refused before anything is read`() {
        every { projectService.getVerifiedProject(projectId, user.id!!) } throws ProjectNotFoundException(projectId)

        assertThrows<ProjectNotFoundException> { service.exportProject(projectId) }
        verify(exactly = 0) { entryRepository.findAllByProjectOrderByNameAsc(any()) }
        verify(exactly = 0) { storageService.downloadFile(any(), any()) }
    }
}
