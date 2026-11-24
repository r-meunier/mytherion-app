package io.mytherion.codex.rest

import io.mytherion.codex.service.ProjectExportService
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.nio.charset.StandardCharsets
import java.util.UUID

/**
 * Download a whole project as a zip of Markdown files and images (the project folder format of
 * docs/decisions/0001-local-first-desktop-client.md §4). Under /api/projects/{projectId}, so the
 * ProjectAccessInterceptor checks ownership first.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/export")
class ProjectExportController(private val exportService: ProjectExportService) {

    /**
     * GET /api/projects/{projectId}/export
     *
     * Streams the zip into the response as it is written, so a project's images never sit in memory
     * all at once. Written synchronously rather than as a StreamingResponseBody, which would add an
     * async dispatch for the security chain to handle.
     */
    @GetMapping
    fun export(@PathVariable projectId: UUID, response: HttpServletResponse) {
        // Access is checked and the project loaded here, before anything is written: a refusal is
        // still a normal 404 error response.
        val export = exportService.exportProject(projectId)
        response.contentType = "application/zip"
        response.setHeader(
            HttpHeaders.CONTENT_DISPOSITION,
            // UTF-8 adds filename*=UTF-8''…; without it, "東京-<date>.zip" goes out as "??-<date>.zip".
            ContentDisposition.attachment().filename(export.fileName, StandardCharsets.UTF_8).build().toString()
        )
        export.writeTo(response.outputStream)
    }
}
