package io.mytherion.category.service

import io.mytherion.category.dto.CategoryDTO
import io.mytherion.category.dto.CreateCategoryRequest
import io.mytherion.category.model.Category
import io.mytherion.category.repository.CategoryRepository
import io.mytherion.project.service.ProjectService

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val projectService: ProjectService
) {
    @Transactional(readOnly = true)
    fun getProjectCategories(projectId: Long, userId: Long): List<CategoryDTO> {
        val project = projectService.getVerifiedProject(projectId, userId)
        return categoryRepository.findAllByProjectOrderByNameAsc(project).map { CategoryDTO.from(it) }
    }

    @Transactional
    fun createCategory(projectId: Long, request: CreateCategoryRequest, userId: Long): CategoryDTO {
        val project = projectService.getVerifiedProject(projectId, userId)
        
        val category = Category(
            project = project,
            name = request.name,
            description = request.description
        )
        
        return CategoryDTO.from(categoryRepository.save(category))
    }
}
