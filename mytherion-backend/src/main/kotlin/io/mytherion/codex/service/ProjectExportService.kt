package io.mytherion.codex.service

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.platform.storage.StorageService
import io.mytherion.project.service.ProjectService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.databind.ObjectMapper
import java.io.OutputStream
import java.time.LocalDate
import java.util.UUID

/**
 * A prepared export: the file name to download it as, and a writer that streams the zip. The project
 * and its entries are already loaded; [writeTo] only fetches images, one at a time, so neither the zip
 * nor all images are ever in memory together, and no database transaction is held open meanwhile.
 */
class ProjectExport(val fileName: String, private val writer: (OutputStream) -> Unit) {
    fun writeTo(out: OutputStream) = writer(out)
}

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

    /** Checks access and loads the project in a short transaction; the zip is written later, outside it. */
    @Transactional(readOnly = true)
    fun exportProject(projectId: UUID): ProjectExport {
        val user = currentUserProvider.getCurrentUser()
        val project = projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })
        val entries = entryRepository.findAllByProjectOrderByNameAsc(project)

        val name = ProjectFolderWriter.slug(project.name).ifEmpty { "project" }
        return ProjectExport("$name-${LocalDate.now()}.zip") { out ->
            ProjectFolderWriter.write(out, project, entries, ::loadImage, objectMapper)
            logger.info("Exported project $projectId: ${entries.size} entries")
        }
    }

    /**
     * An entry's image, or null without one. An image that can't be read must not cost the author the
     * whole export: the entry is still written, just without its image, and the failure is logged.
     */
    private fun loadImage(entry: CodexEntry): ProjectFolderWriter.Media? {
        val thumbnail = entry.thumbnail ?: return null
        val objectKey = thumbnail.substringAfter("$bucketName/")
        return try {
            ProjectFolderWriter.Media(extension(objectKey), storageService.downloadFile(bucketName, objectKey))
        } catch (e: Exception) {
            logger.warn("Export: image of entry ${entry.id} could not be read; exporting the entry without it", e)
            null
        }
    }

    private fun extension(objectKey: String): String =
        objectKey.substringAfterLast('/').substringAfterLast('.', "").lowercase()
            .takeIf { it.isNotEmpty() && it.length <= 5 && it.all(Char::isLetterOrDigit) } ?: "img"
}
