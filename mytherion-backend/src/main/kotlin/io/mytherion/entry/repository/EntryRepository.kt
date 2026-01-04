package io.mytherion.entry.repository

import io.mytherion.entry.model.Entry
import io.mytherion.entry.model.EntryType
import io.mytherion.project.model.Project
import org.springframework.data.jpa.repository.JpaRepository

interface EntryRepository : JpaRepository<Entry, Long> {
    fun findAllByProject(project: Project): List<Entry>
    fun findAllByProjectAndType(project: Project, type: EntryType): List<Entry>
}