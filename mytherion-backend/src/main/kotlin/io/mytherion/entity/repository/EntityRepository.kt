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
}
