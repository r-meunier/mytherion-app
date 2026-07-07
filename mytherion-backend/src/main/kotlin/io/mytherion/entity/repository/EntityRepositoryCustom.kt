package io.mytherion.entity.repository

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

import java.util.UUID

interface EntityRepositoryCustom {
    fun searchEntities(
        projectId: UUID,
        type: EntityType?,
        categoryId: UUID?,
        tags: List<String>?,
        search: String?,
        pageable: Pageable
    ): Page<Entity>
}
