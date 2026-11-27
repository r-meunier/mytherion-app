package io.mytherion.story.rest

import io.mytherion.story.model.StoryStructure
import io.mytherion.story.service.StoryStructureService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Built-in story structures. Not project-scoped: they are the same for every author, so this sits
 * outside /api/projects/{projectId} and only requires an authenticated session (like entry templates).
 */
@RestController
@RequestMapping("/api/story/structures")
class StoryStructureController(private val structureService: StoryStructureService) {

    /** GET /api/story/structures */
    @GetMapping
    fun listStructures(): List<StoryStructure> = structureService.all()
}
