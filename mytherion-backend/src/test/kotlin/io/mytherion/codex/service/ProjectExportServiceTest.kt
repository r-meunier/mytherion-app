package io.mytherion.codex.service

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.exception.ProjectExportFailedException
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.common.web.ErrorCode
import io.mytherion.fixtures.ProjectTestFixtures
import io.mytherion.platform.storage.StorageException
import io.mytherion.platform.storage.StorageService
import io.mytherion.platform.storage.StoredFile
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.service.ProjectService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.springframework.http.HttpStatus
import tools.jackson.databind.json.JsonMapper
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.nio.file.Files
import java.nio.file.Path
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.UUID
import java.util.zip.ZipInputStream

class ProjectExportServiceTest {

    @TempDir
    lateinit var tempDir: Path

    private val user = ProjectTestFixtures.createTestUser()
    private val project = ProjectTestFixtures.createTestProject(owner = user, name = "Stellar Drift")
    private val projectId = project.id!!

    private val entryRepository = mockk<CodexEntryRepository>()
    private val projectService = mockk<ProjectService>()
    private val currentUserProvider = mockk<CurrentUserProvider> { every { getCurrentUser() } returns user }
    private val storageService = mockk<StorageService>()
    private val clock = Clock.fixed(Instant.parse("2026-11-24T23:30:00Z"), ZoneOffset.UTC)

    private val service by lazy {
        ProjectExportService(
            entryRepository, projectService, currentUserProvider, storageService, JsonMapper.builder().build(), clock,
            tempDir.toString(),
        )
    }

    private fun entry(name: String, thumbnail: String? = null) =
        CodexEntry(project = project, name = name, type = EntryType.CHARACTER, thumbnail = thumbnail)
            .apply { id = UUID.randomUUID() }

    private fun fileNames(export: ProjectExport): List<String> {
        val out = ByteArrayOutputStream()
        export.writeTo(out)
        return ZipInputStream(ByteArrayInputStream(out.toByteArray())).use { zip -> generateSequence { zip.nextEntry?.name }.toList() }
    }

    private fun givenEntries(vararg entries: CodexEntry) {
        every { projectService.getVerifiedProject(projectId, user.id!!) } returns project
        every { entryRepository.findAllByProjectOrderByNameAsc(project) } returns entries.toList()
    }

    private fun filesLeftInTempDir(): List<Path> = Files.list(tempDir).use { it.toList() }

    @Test
    fun `exports the project's entries and images, named after the project and the clock's date`() {
        val mira = entry("Mira Vell", thumbnail = "mytherion-uploads/entries/x/1737_mira.PNG")
        givenEntries(mira)
        every { storageService.downloadFile("mytherion-uploads/entries/x/1737_mira.PNG") } returns StoredFile(byteArrayOf(9), "image/png")

        service.exportProject(projectId).use { export ->
            assertEquals("stellar-drift-2026-11-24.zip", export.fileName)
            assertEquals(
                listOf("stellar-drift/project.json", "stellar-drift/codex/characters/mira-vell.md", "stellar-drift/media/${mira.id}.png"),
                fileNames(export),
            )
        }
    }

    @Test
    fun `the zip is complete on disk before it is handed out, and closing the export deletes it`() {
        givenEntries(entry("Mira Vell"))

        val export = service.exportProject(projectId)
        val onDisk = filesLeftInTempDir().single()
        assertEquals(Files.size(onDisk), export.size)

        export.close()
        assertTrue(filesLeftInTempDir().isEmpty())
    }

    @Test
    fun `a deleted entry is left out even if the repository returns it`() {
        val kept = entry("Kael")
        val deleted = entry("Mira Vell").apply { markDeleted() }
        givenEntries(kept, deleted)

        service.exportProject(projectId).use { export ->
            assertEquals(listOf("stellar-drift/project.json", "stellar-drift/codex/characters/kael.md"), fileNames(export))
        }
    }

    @Test
    fun `an image that cannot be read stops the export, naming the entry, and leaves no file behind`() {
        val kael = entry("Kael", thumbnail = "mytherion-uploads/entries/y/kael.png")
        val mira = entry("Mira Vell", thumbnail = "mytherion-uploads/entries/x/mira.png")
        givenEntries(kael, mira)
        every { storageService.downloadFile("mytherion-uploads/entries/y/kael.png") } returns StoredFile(byteArrayOf(1), "image/png")
        every { storageService.downloadFile("mytherion-uploads/entries/x/mira.png") } throws StorageException("gone", RuntimeException())

        val error = assertThrows<ProjectExportFailedException> { service.exportProject(projectId) }

        assertEquals(HttpStatus.BAD_GATEWAY, error.status)
        assertEquals(ErrorCode.EXPORT_FAILED, error.code)
        assertTrue(error.message!!.contains("\"Mira Vell\""), error.message)
        assertFalse(error.message!!.contains("mytherion-uploads"), "where the image is stored stays out of the message")
        assertTrue(filesLeftInTempDir().isEmpty(), "the half-written zip is deleted")
    }

    @Test
    fun `a failure that is not a storage failure is not turned into an export error`() {
        givenEntries(entry("Mira Vell", thumbnail = "mytherion-uploads/entries/x/mira.png"))
        every { storageService.downloadFile(any()) } throws IllegalStateException("a bug, not a missing image")

        assertThrows<IllegalStateException> { service.exportProject(projectId) }
        assertTrue(filesLeftInTempDir().isEmpty())
    }

    @Test
    fun `a project that is not yours is refused before anything is read or written`() {
        every { projectService.getVerifiedProject(projectId, user.id!!) } throws ProjectNotFoundException(projectId)

        assertThrows<ProjectNotFoundException> { service.exportProject(projectId) }
        verify(exactly = 0) { entryRepository.findAllByProjectOrderByNameAsc(any()) }
        verify(exactly = 0) { storageService.downloadFile(any()) }
        assertTrue(filesLeftInTempDir().isEmpty())
    }

    @ParameterizedTest(name = "{0} + {1} -> {2}")
    @CsvSource(
        nullValues = ["null"],
        value = [
            // The stored content type decides, whatever the file is called.
            "image/png, b/entries/x/1_photo.jpg, png",
            "image/jpeg, b/entries/x/1_photo, jpg",
            "IMAGE/WEBP, b/entries/x/1_photo.png, webp",
            "'image/gif; charset=binary', b/entries/x/1_anim, gif",
            // Without a known type, the file name's extension, if it is an accepted image type.
            "null, b/entries/x/1_mira.PNG, png",
            "null, b/entries/x/1_mira.jpeg, jpg",
            "application/octet-stream, b/entries/x/1_mira.webp, webp",
            // Anything else is not trusted into the path.
            "null, b/entries/x/1_notes.exe, img",
            "null, b/entries/x/1_archive.tar.gz, img",
            "null, b/entries/x/1_no-extension, img",
            "null, b/entries/x.png/1_no-extension, img",
            "null, '', img",
        ],
    )
    fun `the image extension comes from the stored content type, then an accepted file extension`(
        contentType: String?,
        reference: String,
        expected: String,
    ) {
        assertEquals(expected, ProjectExportService.imageExtension(contentType, reference))
    }
}
