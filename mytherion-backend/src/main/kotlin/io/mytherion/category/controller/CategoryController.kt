package io.mytherion.category.controller

import io.mytherion.category.dto.CategoryDTO
import io.mytherion.category.dto.CreateCategoryRequest
import io.mytherion.category.service.CategoryService
import io.mytherion.user.model.User
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects/{projectId}/categories")
class CategoryController(
    private val categoryService: CategoryService
) {

    @GetMapping
    fun getCategories(
        @PathVariable projectId: Long,
        @AuthenticationPrincipal user: User
    ): List<CategoryDTO> {
        return categoryService.getProjectCategories(projectId, user)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createCategory(
        @PathVariable projectId: Long,
        @Valid @RequestBody request: CreateCategoryRequest,
        @AuthenticationPrincipal user: User
    ): CategoryDTO {
        return categoryService.createCategory(projectId, request, user)
    }
}
