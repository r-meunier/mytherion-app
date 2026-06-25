package io.mytherion.category.dto

import io.mytherion.category.model.Category
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class CategoryDTO(
    val id: UUID,
    val projectId: UUID,
    val name: String,
    val description: String?
) {
    companion object {
        fun from(category: Category) = CategoryDTO(
            id = requireNotNull(category.id) { "Category ID is missing" },
            projectId = requireNotNull(category.project.id) { "Project ID is missing" },
            name = category.name,
            description = category.description
        )
    }
}

data class CreateCategoryRequest(
    @field:NotBlank(message = "Category name is required")
    val name: String,
    val description: String? = null
)

data class UpdateCategoryRequest(
    @field:NotBlank(message = "Category name is required")
    val name: String,
    val description: String? = null
)
