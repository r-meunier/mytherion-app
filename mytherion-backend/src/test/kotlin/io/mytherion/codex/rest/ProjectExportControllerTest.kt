package io.mytherion.codex.rest

import io.mockk.every
import io.mockk.mockk
import io.mytherion.codex.service.ProjectExport
import io.mytherion.codex.service.ProjectExportService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletResponse
import java.util.UUID

class ProjectExportControllerTest {

    private val projectId = UUID.randomUUID()
    private val exportService = mockk<ProjectExportService>()
    private val controller = ProjectExportController(exportService)

    private fun export(fileName: String): MockHttpServletResponse {
        every { exportService.exportProject(projectId) } returns ProjectExport(fileName) { out -> out.write(byteArrayOf(80, 75)) }
        return MockHttpServletResponse().also { controller.export(projectId, it) }
    }

    @Test
    fun `streams the zip into the response with its file name`() {
        val response = export("stellar-drift-2026-11-24.zip")

        assertEquals("application/zip", response.contentType)
        assertEquals("stellar-drift-2026-11-24.zip", ContentDisposition.parse(response.getHeader(HttpHeaders.CONTENT_DISPOSITION)!!).filename)
        assertTrue(response.contentAsByteArray.contentEquals(byteArrayOf(80, 75)))
    }

    @Test
    fun `a non-Latin file name is sent as UTF-8, not as question marks`() {
        val disposition = export("東京-2026-11-24.zip").getHeader(HttpHeaders.CONTENT_DISPOSITION)!!

        assertTrue(disposition.contains("filename*=UTF-8''%E6%9D%B1%E4%BA%AC-2026-11-24.zip"), disposition)
        assertEquals("東京-2026-11-24.zip", ContentDisposition.parse(disposition).filename)
    }
}
