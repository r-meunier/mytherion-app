package io.mytherion.codex.service

import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.project.model.Project
import org.springframework.stereotype.Service

/**
 * Thin read-only service for entry aggregate queries. Exists to break the circular dependency
 * between ProjectService ↔ CodexEntryService. ProjectService depends on this instead of
 * CodexEntryRepository directly.
 */
@Service
class CodexEntryQueryService(private val entryRepository: CodexEntryRepository) {

    fun countByProject(project: Project): Long =
        entryRepository.countByProjectAndDeletedAtIsNull(project)

    fun countByProjectGrouped(project: Project): Map<String, Int> =
        entryRepository.countByProjectAndTypeGrouped(project).associate {
            it.getType().name to it.getCount().toInt()
        }
}
