package io.mytherion.codex.service

import io.mytherion.codex.exception.InvalidEntryContentException
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryDetail
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals

class EntryContentRulesTest {

    private fun detail(label: String = "Story role", value: String? = "Protagonist", hint: String? = null) =
        EntryDetail(id = UUID.randomUUID(), label = label, value = value, hint = hint)

    @Test
    fun `accepts empty content`() {
        assertDoesNotThrow { EntryContentRules.validate(EntryContent()) }
    }

    @Test
    fun `accepts details with empty values and an unknown template id`() {
        // templateId is provenance only and never checked against the current templates
        val content = EntryContent(templateId = "retired-template", details = mutableListOf(detail(value = null)))
        assertDoesNotThrow { EntryContentRules.validate(content) }
    }

    @Test
    fun `rejects a blank label and names its position`() {
        val content = EntryContent(details = mutableListOf(detail(), detail(label = "  ")))
        val error = assertThrows<InvalidEntryContentException> { EntryContentRules.validate(content) }
        assertEquals("Detail 2 has an empty label", error.message)
    }

    @Test
    fun `rejects duplicate detail ids`() {
        val id = UUID.randomUUID()
        val content = EntryContent(details = mutableListOf(detail().copy(id = id), detail().copy(id = id)))
        assertThrows<InvalidEntryContentException> { EntryContentRules.validate(content) }
    }

    @Test
    fun `rejects more than the maximum number of details`() {
        val content = EntryContent(details = MutableList(EntryContentRules.MAX_DETAILS + 1) { detail() })
        assertThrows<InvalidEntryContentException> { EntryContentRules.validate(content) }
    }

    @Test
    fun `rejects oversized label, value and hint`() {
        listOf(
            detail(label = "x".repeat(EntryContentRules.MAX_LABEL_LENGTH + 1)),
            detail(value = "x".repeat(EntryContentRules.MAX_VALUE_LENGTH + 1)),
            detail(hint = "x".repeat(EntryContentRules.MAX_HINT_LENGTH + 1))
        ).forEach { oversized ->
            assertThrows<InvalidEntryContentException> {
                EntryContentRules.validate(EntryContent(details = mutableListOf(oversized)))
            }
        }
    }

    @Test
    fun `rejects a blank template id`() {
        assertThrows<InvalidEntryContentException> {
            EntryContentRules.validate(EntryContent(templateId = " "))
        }
    }
}
