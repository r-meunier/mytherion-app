package io.mytherion.entity.service

import io.mytherion.entity.repository.EntityRepository
import io.mytherion.project.model.Project
import org.springframework.stereotype.Service

/**
 * Thin read-only service for entity aggregate queries. Exists to break the circular dependency
 * between ProjectService ↔ EntityService. ProjectService depends on this instead of
 * EntityRepository directly.
 */
@Service
class EntityQueryService(private val entityRepository: EntityRepository) {

    fun countByProject(project: Project): Long =
        entityRepository.countByProjectAndDeletedAtIsNull(project)

    fun countByProjectGrouped(project: Project): Map<String, Int> =
        entityRepository.countByProjectAndTypeGrouped(project).associate {
            it.getType().name to it.getCount().toInt()
        }
}
