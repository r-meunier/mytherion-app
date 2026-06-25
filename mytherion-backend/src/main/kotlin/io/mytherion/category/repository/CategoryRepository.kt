package io.mytherion.category.repository

import io.mytherion.category.model.Category
import io.mytherion.project.model.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CategoryRepository : JpaRepository<Category, UUID> {
    fun findAllByProjectOrderByNameAsc(project: Project): List<Category>
    fun findByIdAndProjectAndDeletedAtIsNull(id: UUID, project: Project): Category?
}
