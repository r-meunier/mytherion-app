package io.mytherion.codex.rest

import io.mytherion.codex.service.ProjectExportService
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Download a whole project as a zip of Markdown files and images (the project folder format of
 * docs/decisions/0001-local-first-desktop-client.md §4). Under /api/projects/{projectId}, so the
 * ProjectAccessInterceptor checks ownership first.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/export")
class ProjectExportController(private val exportService: ProjectExportService) {

    /** GET /api/projects/{projectId}/export */
    @GetMapping
    fun export(@PathVariable projectId: UUID): ResponseEntity<ByteArray> {
        val export = exportService.exportProject(projectId)
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("application/zip"))
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(export.fileName).build().toString()
            )
            .body(export.bytes)
    }
}
