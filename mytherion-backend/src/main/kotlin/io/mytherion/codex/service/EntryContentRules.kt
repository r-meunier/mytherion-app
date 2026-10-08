package io.mytherion.codex.service

import io.mytherion.codex.exception.InvalidEntryContentException
import io.mytherion.codex.model.EntryContent

/**
 * Structural rules for an entry's content. Values are free text, so there is no per-type
 * validation; the rules only keep the shape sound and the size bounded.
 *
 * `templateId` is deliberately not checked against the current templates: it is provenance, and
 * retiring a template must never make existing entries fail to save.
 */
object EntryContentRules {
    const val MAX_DETAILS = 100
    const val MAX_LABEL_LENGTH = 100
    const val MAX_VALUE_LENGTH = 20_000
    const val MAX_HINT_LENGTH = 500
    const val MAX_TEMPLATE_ID_LENGTH = 64

    fun validate(content: EntryContent) {
        content.templateId?.let {
            require(it.isNotBlank() && it.length <= MAX_TEMPLATE_ID_LENGTH) {
                "templateId must be 1 to $MAX_TEMPLATE_ID_LENGTH characters"
            }
        }

        val details = content.details
        require(details.size <= MAX_DETAILS) { "An entry can have at most $MAX_DETAILS details" }
        require(details.map { it.id }.toSet().size == details.size) { "Detail ids must be unique" }

        details.forEachIndexed { index, detail ->
            val position = index + 1
            require(detail.label.isNotBlank()) { "Detail $position has an empty label" }
            require(detail.label.length <= MAX_LABEL_LENGTH) {
                "Detail $position: label must be at most $MAX_LABEL_LENGTH characters"
            }
            require((detail.value?.length ?: 0) <= MAX_VALUE_LENGTH) {
                "Detail $position: value must be at most $MAX_VALUE_LENGTH characters"
            }
            require((detail.hint?.length ?: 0) <= MAX_HINT_LENGTH) {
                "Detail $position: hint must be at most $MAX_HINT_LENGTH characters"
            }
        }
    }

    // A rule violation is the client's error: never let it surface as IllegalArgumentException (a 500).
    private inline fun require(condition: Boolean, message: () -> String) {
        if (!condition) throw InvalidEntryContentException(message())
    }
}
