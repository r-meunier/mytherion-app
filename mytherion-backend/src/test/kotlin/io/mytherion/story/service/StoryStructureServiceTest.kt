package io.mytherion.story.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import tools.jackson.databind.json.JsonMapper
import tools.jackson.module.kotlin.KotlinModule

/** Loads the real structure files, so a broken or missing one fails here before it fails startup. */
class StoryStructureServiceTest {

    private val service = StoryStructureService(JsonMapper.builder().addModule(KotlinModule.Builder().build()).build())

    @Test
    fun `serves the seven built-in structures in picker order, Free Form first`() {
        assertEquals(
            listOf("free-form", "three-act", "five-act", "save-the-cat", "heros-journey", "seven-point", "kishotenketsu"),
            service.all().map { it.id },
        )
    }

    @Test
    fun `Free Form is one act without beats`() {
        val freeForm = service.find(StoryStructureService.FREE_FORM)!!

        assertEquals(1, freeForm.acts.size)
        assertTrue(freeForm.acts.single().beats.isEmpty())
    }

    @Test
    fun `the structures have the acts and beats the story model describes`() {
        fun beats(id: String) = service.find(id)!!.acts.sumOf { it.beats.size }
        fun acts(id: String) = service.find(id)!!.acts.size

        assertEquals(3 to 8, acts("three-act") to beats("three-act"))
        assertEquals(5 to 5, acts("five-act") to beats("five-act"))
        assertEquals(3 to 15, acts("save-the-cat") to beats("save-the-cat"))
        assertEquals(3 to 12, acts("heros-journey") to beats("heros-journey"))
        assertEquals(3 to 7, acts("seven-point") to beats("seven-point"))
        assertEquals(4 to 4, acts("kishotenketsu") to beats("kishotenketsu"))
    }

    @Test
    fun `every beat explains itself and has an expected position`() {
        val beats = service.all().flatMap { s -> s.acts.flatMap { a -> a.beats.map { s.id to it } } }

        assertTrue(beats.isNotEmpty())
        beats.forEach { (structure, beat) ->
            assertTrue(!beat.hint.isNullOrBlank(), "$structure / ${beat.name} has no hint")
            assertNotNull(beat.position, "$structure / ${beat.name} has no position")
        }
    }

    @Test
    fun `an unknown id finds nothing`() {
        assertNull(service.find("four-act"))
    }
}
