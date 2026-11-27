package io.mytherion.story.service

import io.mytherion.story.model.StoryStructure
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper

/**
 * Serves the built-in story structures, read once at startup from the JSON files in
 * `resources/story/structures/`.
 *
 * Structures are code-reviewed data, so a broken one fails startup instead of reaching an author:
 * each file's name must equal its `id`, ids are unique, every structure has at least one act, beat
 * positions lie in 0..1 and never go backwards, and Free Form exists (it is the picker's default).
 */
@Service
class StoryStructureService(objectMapper: ObjectMapper) {

    private val structures: List<StoryStructure> = load(objectMapper)

    /** All structures, in picker order (Free Form first). */
    fun all(): List<StoryStructure> = structures

    fun find(id: String): StoryStructure? = structures.find { it.id == id }

    private fun load(objectMapper: ObjectMapper): List<StoryStructure> {
        val resources = PathMatchingResourcePatternResolver().getResources(STRUCTURE_PATTERN)
        val loaded = resources.map { resource ->
            val structure = resource.inputStream.use { objectMapper.readValue(it, StoryStructure::class.java) }
            val fileId = resource.filename?.removeSuffix(".json")
            check(structure.id == fileId) { "Structure file $fileId.json declares id '${structure.id}'" }
            check(structure.acts.isNotEmpty()) { "Structure '${structure.id}' has no acts" }

            val positions = structure.acts.flatMap { act -> act.beats.mapNotNull { it.position } }
            check(positions.all { it in 0.0..1.0 }) { "Structure '${structure.id}' has a beat position outside 0..1" }
            check(positions.zipWithNext().all { (a, b) -> a <= b }) {
                "Structure '${structure.id}' has beat positions that go backwards"
            }
            structure
        }

        val duplicates = loaded.groupBy { it.id }.filterValues { it.size > 1 }.keys
        check(duplicates.isEmpty()) { "Duplicate structure ids: $duplicates" }
        check(loaded.any { it.id == FREE_FORM }) { "The '$FREE_FORM' structure is missing" }

        return loaded.sortedWith(compareBy({ it.order }, { it.name }))
    }

    companion object {
        /** One act, no beats: the default, for writers who don't plot by structure. */
        const val FREE_FORM = "free-form"
        private const val STRUCTURE_PATTERN = "classpath*:story/structures/*.json"
    }
}
