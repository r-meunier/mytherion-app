package io.mytherion.codex.repository

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.project.model.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

import java.util.UUID

interface CodexEntryRepository : JpaRepository<CodexEntry, UUID>, CodexEntryRepositoryCustom {
    // Performance-optimized count queries
    @Query("SELECT COUNT(e) FROM CodexEntry e WHERE e.project = :project AND e.deletedAt IS NULL")
    fun countByProjectAndDeletedAtIsNull(project: Project): Long

    @Query("SELECT COUNT(e) FROM CodexEntry e WHERE e.project.owner = :owner AND e.deletedAt IS NULL")
    fun countByOwnerAndDeletedAtIsNull(owner: io.mytherion.user.model.User): Long

    @Query("SELECT COUNT(e) FROM CodexEntry e WHERE e.project.owner = :owner AND e.updatedAt >= :since AND e.deletedAt IS NULL")
    fun countRecentEditsByOwner(owner: io.mytherion.user.model.User, since: java.time.Instant): Long

    @Query("SELECT COUNT(e) FROM CodexEntry e WHERE e.project.owner = :owner AND e.createdAt >= :since AND e.deletedAt IS NULL")
    fun countByOwnerAndCreatedAtAfter(owner: io.mytherion.user.model.User, since: java.time.Instant): Long

    @Query("SELECT e FROM CodexEntry e JOIN FETCH e.project WHERE e.project.owner = :owner AND e.deletedAt IS NULL ORDER BY e.updatedAt DESC")
    fun findRecentEntitiesByOwner(
        owner: io.mytherion.user.model.User,
        pageable: org.springframework.data.domain.Pageable
    ): List<CodexEntry>

    @Query(
        """
        SELECT e.type as type, COUNT(e) as count 
        FROM CodexEntry e 
        WHERE e.project = :project AND e.deletedAt IS NULL 
        GROUP BY e.type
    """
    )
    fun countByProjectAndTypeGrouped(project: Project): List<EntryTypeCount>

    @Query("SELECT COUNT(e) FROM CodexEntry e WHERE e.project = :project AND e.updatedAt >= :since AND e.deletedAt IS NULL")
    fun countRecentEditsByProject(project: Project, since: java.time.Instant): Long

    @Query("SELECT COUNT(e) FROM CodexEntry e WHERE e.project = :project AND e.createdAt >= :since AND e.deletedAt IS NULL")
    fun countByProjectAndCreatedAtAfter(project: Project, since: java.time.Instant): Long

    @Query("SELECT e FROM CodexEntry e JOIN FETCH e.project WHERE e.project = :project AND e.deletedAt IS NULL ORDER BY e.updatedAt DESC")
    fun findRecentEntitiesByProject(
        project: Project,
        pageable: org.springframework.data.domain.Pageable
    ): List<CodexEntry>

    // DTO interface for aggregation results
    interface EntryTypeCount {
        fun getType(): EntryType

        fun getCount(): Long
    }
}
