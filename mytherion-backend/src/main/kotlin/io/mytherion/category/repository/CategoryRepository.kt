package io.mytherion.category.repository

import io.mytherion.category.model.Category
import io.mytherion.project.model.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CategoryRepository : JpaRepository<Category, Long> {
    fun findAllByProjectOrderByNameAsc(project: Project): List<Category>
}
