package io.mytherion.entity.repository

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface EntityRepositoryCustom {
    fun searchEntities(
        projectId: Long,
        type: EntityType?,
        categoryId: Long?,
        tags: List<String>?,
        search: String?,
        pageable: Pageable
    ): Page<Entity>
}
