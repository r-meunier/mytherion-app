package io.mytherion.category.rest

import io.mytherion.category.dto.CategoryDTO
import io.mytherion.category.dto.CreateCategoryRequest
import io.mytherion.category.service.CategoryService

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/projects/{projectId}/categories")
class CategoryController(
    private val categoryService: CategoryService
) {

    @GetMapping
    fun getCategories(
        @PathVariable projectId: UUID,
        @AuthenticationPrincipal userId: UUID
    ): List<CategoryDTO> {
        return categoryService.getProjectCategories(projectId, userId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createCategory(
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: CreateCategoryRequest,
        @AuthenticationPrincipal userId: UUID
    ): CategoryDTO {
        return categoryService.createCategory(projectId, request, userId)
    }
}
