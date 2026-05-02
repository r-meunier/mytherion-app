package io.mytherion.entity.repository

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.project.model.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface EntityRepository : JpaRepository<Entity, Long> {
    @Query("SELECT e FROM Entity e JOIN FETCH e.project WHERE e.project = :project")
    fun findAllByProject(project: Project): List<Entity>

    @Query(
        "SELECT e FROM Entity e JOIN FETCH e.project WHERE e.project = :project AND e.type = :type"
    )
    fun findAllByProjectAndType(project: Project, type: EntityType): List<Entity>

    @Query(
        "SELECT e FROM Entity e JOIN FETCH e.project WHERE e.project = :project AND e.deletedAt IS NULL"
    )
    fun findAllByProjectAndDeletedAtIsNull(project: Project): List<Entity>

    // Performance-optimized count queries
    @Query("SELECT COUNT(e) FROM Entity e WHERE e.project = :project AND e.deletedAt IS NULL")
    fun countByProjectAndDeletedAtIsNull(project: Project): Long

    @Query("SELECT COUNT(e) FROM Entity e WHERE e.project.owner = :owner AND e.deletedAt IS NULL")
    fun countByOwnerAndDeletedAtIsNull(owner: io.mytherion.user.model.User): Long

    @Query("SELECT COUNT(e) FROM Entity e WHERE e.project.owner = :owner AND e.updatedAt >= :since AND e.deletedAt IS NULL")
    fun countRecentEditsByOwner(owner: io.mytherion.user.model.User, since: java.time.Instant): Long

    @Query("SELECT COUNT(e) FROM Entity e WHERE e.project.owner = :owner AND e.createdAt >= :since AND e.deletedAt IS NULL")
    fun countByOwnerAndCreatedAtAfter(owner: io.mytherion.user.model.User, since: java.time.Instant): Long

    @Query("SELECT e FROM Entity e JOIN FETCH e.project WHERE e.project.owner = :owner AND e.deletedAt IS NULL ORDER BY e.updatedAt DESC")
    fun findRecentEntitiesByOwner(owner: io.mytherion.user.model.User, pageable: org.springframework.data.domain.Pageable): List<Entity>

    @Query(
        """
        SELECT e.type as type, COUNT(e) as count 
        FROM Entity e 
        WHERE e.project = :project AND e.deletedAt IS NULL 
        GROUP BY e.type
    """
    )
    fun countByProjectAndTypeGrouped(project: Project): List<EntityTypeCount>

    // DTO interface for aggregation results
    interface EntityTypeCount {
        fun getType(): EntityType

        fun getCount(): Long
    }
}
