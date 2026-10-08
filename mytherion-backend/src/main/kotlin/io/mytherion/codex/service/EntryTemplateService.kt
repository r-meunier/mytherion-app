package io.mytherion.codex.service

import io.mytherion.codex.model.EntryTemplate
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.model.TemplateLevel
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper

/**
 * Serves the built-in entry templates, read once at startup from the JSON files in
 * `resources/codex/templates/`.
 *
 * Templates are code-reviewed data, so a broken one fails startup instead of reaching a user:
 * each file's name must equal its `id`, ids are unique, and every entry type has a Blank template.
 */
@Service
class EntryTemplateService(objectMapper: ObjectMapper) {

    private val templates: List<EntryTemplate> = load(objectMapper)

    /** All templates for [type], from least to most detailed (Blank, Basic, Full). */
    fun templatesFor(type: EntryType): List<EntryTemplate> =
        templates.filter { it.entryType == type }.sortedBy { it.level }

    private fun load(objectMapper: ObjectMapper): List<EntryTemplate> {
        val resources = PathMatchingResourcePatternResolver().getResources(TEMPLATE_PATTERN)
        val loaded = resources.map { resource ->
            val template = resource.inputStream.use { objectMapper.readValue(it, EntryTemplate::class.java) }
            val fileId = resource.filename?.removeSuffix(".json")
            check(template.id == fileId) { "Template file $fileId.json declares id '${template.id}'" }
            template
        }

        val duplicates = loaded.groupBy { it.id }.filterValues { it.size > 1 }.keys
        check(duplicates.isEmpty()) { "Duplicate template ids: $duplicates" }

        val missingBlank = EntryType.entries.filter { type ->
            loaded.none { it.entryType == type && it.level == TemplateLevel.BLANK }
        }
        check(missingBlank.isEmpty()) { "Entry types without a Blank template: $missingBlank" }

        return loaded
    }

    private companion object {
        const val TEMPLATE_PATTERN = "classpath*:codex/templates/*.json"
    }
}
