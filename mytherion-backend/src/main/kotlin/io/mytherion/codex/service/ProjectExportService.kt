package io.mytherion.codex.service

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.platform.storage.StorageService
import io.mytherion.project.service.ProjectService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.databind.ObjectMapper
import java.io.ByteArrayOutputStream
import java.time.LocalDate
import java.util.UUID

/** A finished export: the zip's bytes and the file name to download it as. */
class ProjectExport(val fileName: String, val bytes: ByteArray)

/**
 * Exports a whole project as a zip of the project folder format (see [ProjectFolderWriter]), so the
 * author can take everything with them: entries as Markdown, images as files.
 */
@Service
class ProjectExportService(
    private val entryRepository: CodexEntryRepository,
    private val projectService: ProjectService,
    private val currentUserProvider: CurrentUserProvider,
    private val storageService: StorageService,
    private val objectMapper: ObjectMapper,
    @Value("\${minio.bucket-name}") private val bucketName: String,
) {
    private val logger = LoggerFactory.getLogger(ProjectExportService::class.java)

    @Transactional(readOnly = true)
    fun exportProject(projectId: UUID): ProjectExport {
        val user = currentUserProvider.getCurrentUser()
        val project = projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })
        val entries = entryRepository.findAllByProjectOrderByNameAsc(project)

        // An image that can't be read must not cost the author the whole export: the entry is still
        // written, just without its image, and the failure is logged.
        val media = entries.mapNotNull { entry ->
            val thumbnail = entry.thumbnail ?: return@mapNotNull null
            val objectKey = thumbnail.substringAfter("$bucketName/")
            try {
                entry.id.toString() to ProjectFolderWriter.Media(extension(objectKey), storageService.downloadFile(bucketName, objectKey))
            } catch (e: Exception) {
                logger.warn("Export: image of entry ${entry.id} could not be read; exporting the entry without it", e)
                null
            }
        }.toMap()

        val out = ByteArrayOutputStream()
        ProjectFolderWriter.write(out, project, entries, media, objectMapper)
        logger.info("Exported project $projectId: ${entries.size} entries, ${media.size} images, ${out.size()} bytes")

        val name = ProjectFolderWriter.slug(project.name).ifEmpty { "project" }
        return ProjectExport("$name-${LocalDate.now()}.zip", out.toByteArray())
    }

    private fun extension(objectKey: String): String =
        objectKey.substringAfterLast('/').substringAfterLast('.', "").lowercase()
            .takeIf { it.isNotEmpty() && it.length <= 5 && it.all(Char::isLetterOrDigit) } ?: "img"
}
