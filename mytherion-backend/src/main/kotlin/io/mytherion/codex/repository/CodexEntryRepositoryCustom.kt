package io.mytherion.codex.repository

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

import java.util.UUID

interface CodexEntryRepositoryCustom {
    fun searchEntries(
        projectId: UUID,
        type: EntryType?,
        tags: List<String>?,
        search: String?,
        pageable: Pageable
    ): Page<CodexEntry>
}
