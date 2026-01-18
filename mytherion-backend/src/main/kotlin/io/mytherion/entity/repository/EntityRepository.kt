package io.mytherion.entity.repository

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import io.mytherion.project.model.Project
import org.springframework.data.jpa.repository.JpaRepository

interface EntityRepository : JpaRepository<Entity, Long> {
    fun findAllByProject(project: Project): List<Entity>
    fun findAllByProjectAndType(project: Project, type: EntityType): List<Entity>
    fun findAllByProjectAndDeletedAtIsNull(project: Project): List<Entity>
}
