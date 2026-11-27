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
 * Project export API.
 *
 * `GET /api/projects/{projectId}/export` → `200 application/zip` with
 * `Content-Disposition: attachment; filename="<project-slug>-<date>.zip"` (contents: ProjectExportService).
 * Requires an authenticated user. Errors are the usual error responses:
 * - 404 `PROJECT_NOT_FOUND` for a project that is missing, deleted or someone else's, from
 *   ProjectAccessInterceptor (which checks every API path with a `{projectId}` variable) and again from
 *   the service;
 * - 502 `EXPORT_FAILED` when an entry's image can't be read, so no export was made.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/export")
class ProjectExportController(private val exportService: ProjectExportService) {

    @GetMapping
    fun export(@PathVariable projectId: UUID, response: HttpServletResponse) {
        // The zip is complete before anything is sent, so any failure is still a normal error response.
        exportService.exportProject(projectId).use { export ->
            response.contentType = "application/zip"
            response.setContentLengthLong(export.size)
            response.setHeader(
                HttpHeaders.CONTENT_DISPOSITION,
                // UTF-8 adds filename*=UTF-8''…; without it, "東京-<date>.zip" goes out as "??-<date>.zip".
                ContentDisposition.attachment().filename(export.fileName, StandardCharsets.UTF_8).build().toString()
            )
            export.writeTo(response.outputStream)
        }
    }
}
