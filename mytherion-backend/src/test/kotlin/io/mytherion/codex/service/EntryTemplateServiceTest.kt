package io.mytherion.codex.service

import io.mytherion.codex.model.EntryType
import io.mytherion.codex.model.TemplateLevel
import org.junit.jupiter.api.Test
import tools.jackson.module.kotlin.jacksonObjectMapper
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Loads the real template files from resources/codex/templates, so a broken template fails here in
 * CI rather than at application startup.
 */
class EntryTemplateServiceTest {

    private val service = EntryTemplateService(jacksonObjectMapper())

    @Test
    fun `every entry type offers a Blank template first`() {
        EntryType.entries.forEach { type ->
            val templates = service.templatesFor(type)
            assertTrue(templates.isNotEmpty(), "$type has no templates")
            assertEquals(TemplateLevel.BLANK, templates.first().level, "$type should list Blank first")
            assertTrue(templates.first().details.isEmpty(), "$type Blank template should have no details")
        }
    }

    @Test
    fun `templates are returned from least to most detailed and only for the requested type`() {
        val templates = service.templatesFor(EntryType.CHARACTER)
        assertEquals(listOf("character-blank", "character-basic"), templates.map { it.id })
        assertTrue(templates.all { it.entryType == EntryType.CHARACTER })
    }

    @Test
    fun `basic templates have unique, non-blank labels`() {
        EntryType.entries.flatMap(service::templatesFor).forEach { template ->
            val labels = template.details.map { it.label }
            assertTrue(labels.none { it.isBlank() }, "${template.id} has a blank label")
            assertEquals(labels.size, labels.toSet().size, "${template.id} repeats a label")
            assertTrue(
                labels.all { it.length <= EntryContentRules.MAX_LABEL_LENGTH } &&
                    template.details.all { (it.hint?.length ?: 0) <= EntryContentRules.MAX_HINT_LENGTH },
                "${template.id} would produce details that fail EntryContentRules"
            )
        }
    }
}
