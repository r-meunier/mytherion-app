package io.mytherion.codex.rest

import io.mytherion.codex.model.EntryTemplate
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.service.EntryTemplateService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * Built-in entry templates. Not project-scoped: templates are the same for every user, so this sits
 * outside /api/projects/{projectId} and only requires an authenticated session.
 */
@RestController
@RequestMapping("/api/codex/templates")
class EntryTemplateController(private val templateService: EntryTemplateService) {

    /** GET /api/codex/templates?type=CHARACTER */
    @GetMapping
    fun listTemplates(@RequestParam type: EntryType): List<EntryTemplate> =
        templateService.templatesFor(type)
}
