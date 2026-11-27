package io.mytherion.codex.service

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.codex.exception.ProjectExportFailedException
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.platform.storage.StorageException
import io.mytherion.platform.storage.StorageService
import io.mytherion.project.service.ProjectService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import java.io.OutputStream
import java.nio.file.Files
import java.nio.file.Path
import java.time.Clock
import java.time.LocalDate
import java.util.UUID

/**
 * A finished export: the zip, complete on disk, and the file name to download it as. Close it once it
 * has been sent; that deletes the file.
 */
class ProjectExport(val fileName: String, private val file: Path) : AutoCloseable {
    val size: Long get() = Files.size(file)

    fun writeTo(out: OutputStream) {
        Files.copy(file, out)
    }

    override fun close() {
        Files.deleteIfExists(file)
    }
}

/**
 * Builds the export of a project: `<project-slug>-<date>.zip`, holding `project.json`, one Markdown file
 * per live entry under `codex/<type>/` and the entry images under `media/` (layout: [ProjectFolderWriter]).
 *
 * All or nothing: the zip is written to a temporary file first and handed out only once it is complete.
 * If an image can't be read, the export fails with [ProjectExportFailedException] and nothing is sent,
 * instead of the author getting a zip that silently lacks it. One image is in memory at a time.
 */
@Service
class ProjectExportService(
    private val entryRepository: CodexEntryRepository,
    private val projectService: ProjectService,
    private val currentUserProvider: CurrentUserProvider,
    private val storageService: StorageService,
    private val objectMapper: ObjectMapper,
    private val clock: Clock,
    @Value("\${app.export.temp-dir:\${java.io.tmpdir}}") private val tempDir: String,
) {
    private val logger = LoggerFactory.getLogger(ProjectExportService::class.java)

    /**
     * Checks access, loads the project and its entries, and writes the zip.
     *
     * Deliberately not @Transactional: the images are read while the zip is written, and a transaction
     * would hold a database connection for all of that. Each read below runs in its own.
     *
     * @throws ProjectExportFailedException when an entry's image can't be read
     */
    fun exportProject(projectId: UUID): ProjectExport {
        val user = currentUserProvider.getCurrentUser()
        val project = projectService.getVerifiedProject(projectId, requireNotNull(user.id) { "User ID is missing" })
        // The repository already leaves deleted entries out (@SQLRestriction); this keeps them out even
        // if that query is ever replaced by one the restriction doesn't apply to, such as native SQL.
        val entries = entryRepository.findAllByProjectOrderByNameAsc(project).filterNot { it.isDeleted() }

        val file = Files.createTempFile(Path.of(tempDir), "mytherion-export-", ".zip")
        try {
            Files.newOutputStream(file).buffered().use { out ->
                ProjectFolderWriter.write(out, project, entries, ::loadImage, objectMapper)
            }
        } catch (e: Throwable) {
            Files.deleteIfExists(file)
            throw e
        }
        logger.info("Exported project $projectId: ${entries.size} entries")

        val name = ProjectFolderWriter.slug(project.name).ifEmpty { "project" }
        return ProjectExport("$name-${LocalDate.now(clock)}.zip", file)
    }

    /** An entry's image, or null if it has none. One that can't be read stops the export. */
    private fun loadImage(entry: CodexEntry): ProjectFolderWriter.Media? {
        val thumbnail = entry.thumbnail ?: return null
        return try {
            val file = storageService.downloadFile(thumbnail)
            ProjectFolderWriter.Media(imageExtension(file.contentType, thumbnail), file.bytes)
        } catch (e: StorageException) {
            logger.error("Export stopped: image of entry ${entry.id} could not be read", e)
            throw ProjectExportFailedException(entry.name, e)
        }
    }

    companion object {
        /** The image types an upload accepts (CodexEntryController), by content type. */
        private val IMAGE_EXTENSIONS = mapOf(
            "image/jpeg" to "jpg",
            "image/png" to "png",
            "image/gif" to "gif",
            "image/webp" to "webp",
        )

        /**
         * The file extension to export an image under. The content type stored with the upload decides;
         * without one (or an unknown one), the uploaded file name's extension, if it is one of the same
         * accepted types. Otherwise `img`, so nothing from a file name ends up in the path unchecked.
         */
        fun imageExtension(contentType: String?, fileReference: String): String {
            val type = contentType?.substringBefore(';')?.trim()?.lowercase()
            IMAGE_EXTENSIONS[type]?.let { return it }
            val fromName = fileReference.substringAfterLast('/').substringAfterLast('.', "").lowercase()
            return when (fromName) {
                "jpeg" -> "jpg"
                in IMAGE_EXTENSIONS.values -> fromName
                else -> "img"
            }
        }
    }
}
