package io.mytherion.codex.rest

import io.mockk.every
import io.mockk.mockk
import io.mytherion.codex.service.ProjectExport
import io.mytherion.codex.service.ProjectExportService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletResponse
import java.nio.file.Files
import java.nio.file.Path
import java.util.UUID

class ProjectExportControllerTest {

    @TempDir
    lateinit var tempDir: Path

    private val projectId = UUID.randomUUID()
    private val exportService = mockk<ProjectExportService>()
    private val controller = ProjectExportController(exportService)
    private val zipBytes = byteArrayOf(80, 75, 5, 6)

    private fun export(fileName: String): Pair<MockHttpServletResponse, Path> {
        val file = Files.write(tempDir.resolve("export.zip"), zipBytes)
        every { exportService.exportProject(projectId) } returns ProjectExport(fileName, file)
        return MockHttpServletResponse().also { controller.export(projectId, it) } to file
    }

    @Test
    fun `sends the finished zip with its file name and size, then deletes it`() {
        val (response, file) = export("stellar-drift-2026-11-24.zip")

        assertEquals("application/zip", response.contentType)
        assertEquals(zipBytes.size.toLong(), response.contentLengthLong)
        assertEquals("stellar-drift-2026-11-24.zip", ContentDisposition.parse(response.getHeader(HttpHeaders.CONTENT_DISPOSITION)!!).filename)
        assertTrue(response.contentAsByteArray.contentEquals(zipBytes))
        assertFalse(Files.exists(file), "the temporary zip is deleted once sent")
    }

    @Test
    fun `a non-Latin file name is sent as UTF-8, not as question marks`() {
        val disposition = export("東京-2026-11-24.zip").first.getHeader(HttpHeaders.CONTENT_DISPOSITION)!!

        assertTrue(disposition.contains("filename*=UTF-8''%E6%9D%B1%E4%BA%AC-2026-11-24.zip"), disposition)
        assertEquals("東京-2026-11-24.zip", ContentDisposition.parse(disposition).filename)
    }
}
