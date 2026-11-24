package io.mytherion.codex.service

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.ContextRole
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryDetail
import io.mytherion.codex.model.EntryType
import io.mytherion.project.model.Project
import io.mytherion.user.model.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.yaml.snakeyaml.Yaml
import tools.jackson.databind.json.JsonMapper
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.UUID
import java.util.zip.ZipInputStream

class ProjectFolderWriterTest {

    private val objectMapper = JsonMapper.builder().build()
    private val owner = User(username = "author", email = "author@test.dev", passwordHash = "hash")
    private val project = Project(owner = owner, name = "The Drowned Quarter", description = "A city that sinks.", genre = "Fantasy")
        .apply { id = UUID.fromString("0d9c0000-0000-0000-0000-000000000001") }

    private fun entry(name: String, type: EntryType = EntryType.CHARACTER, id: String = UUID.randomUUID().toString()) =
        CodexEntry(project = project, name = name, type = type).apply { this.id = UUID.fromString(id) }

    private fun unzip(bytes: ByteArray): Map<String, ByteArray> {
        val files = linkedMapOf<String, ByteArray>()
        ZipInputStream(ByteArrayInputStream(bytes)).use { zip ->
            generateSequence { zip.nextEntry }.forEach { files[it.name] = zip.readBytes() }
        }
        return files
    }

    private fun export(entries: List<CodexEntry>, media: Map<String, ProjectFolderWriter.Media> = emptyMap()): Map<String, ByteArray> {
        val out = ByteArrayOutputStream()
        ProjectFolderWriter.write(out, project, entries, media, objectMapper)
        return unzip(out.toByteArray())
    }

    /** Splits a Markdown file into its parsed frontmatter and its body. */
    @Suppress("UNCHECKED_CAST")
    private fun frontmatter(markdown: String): Pair<Map<String, Any>, String> {
        val parts = markdown.split("---\n", limit = 3)
        assertEquals("", parts[0], "the file must start with frontmatter")
        return Yaml().load<Map<String, Any>>(parts[1]) to parts[2]
    }

    @Test
    fun `writes project json, one Markdown file per entry by type, and images under media`() {
        val mira = entry("Mira Vell", id = "7b1e0000-0000-0000-0000-000000000001")
        val quarter = entry("The Drowned Quarter", EntryType.LOCATION)
        val files = export(listOf(mira, quarter), mapOf(mira.id.toString() to ProjectFolderWriter.Media("png", byteArrayOf(1, 2, 3))))

        assertEquals(
            setOf(
                "the-drowned-quarter/project.json",
                "the-drowned-quarter/codex/characters/mira-vell.md",
                "the-drowned-quarter/codex/locations/the-drowned-quarter.md",
                "the-drowned-quarter/media/7b1e0000-0000-0000-0000-000000000001.png",
            ),
            files.keys,
        )
        assertTrue(files.getValue("the-drowned-quarter/media/7b1e0000-0000-0000-0000-000000000001.png").contentEquals(byteArrayOf(1, 2, 3)))
    }

    @Test
    fun `project json holds the format version and the project's fields, not its owner`() {
        val json = objectMapper.readTree(String(export(emptyList()).getValue("the-drowned-quarter/project.json")))

        assertEquals(1, json["formatVersion"].asInt())
        assertEquals("0d9c0000-0000-0000-0000-000000000001", json["id"].asString())
        assertEquals("The Drowned Quarter", json["name"].asString())
        assertEquals("Fantasy", json["genre"].asString())
        assertTrue(json["settings"].isObject)
        assertFalse(json.has("owner"))
    }

    @Test
    fun `an entry's data round-trips through its frontmatter, and prose goes under the reserved headings`() {
        val mira = entry("Mira Vell").apply {
            aliases = arrayOf("The Cartographer")
            tags = arrayOf("protagonist", "cartographer")
            description = "A disgraced cartographer."
            notes = "Secretly the heir."
            content = EntryContent(
                templateId = "character-basic",
                details = mutableListOf(
                    EntryDetail(id = UUID.randomUUID(), label = "Story role", value = "Protagonist", role = ContextRole.IDENTITY),
                    EntryDetail(id = UUID.randomUUID(), label = "Voice", value = "Clipped, dry humour.\nNever says sorry.", hint = "How do they talk?"),
                    EntryDetail(id = UUID.randomUUID(), label = "Pronouns", value = null),
                ),
            )
        }

        val markdown = ProjectFolderWriter.entryMarkdown(mira, thumbnail = "media/x.png")
        val (front, body) = frontmatter(markdown)

        assertEquals(mira.id.toString(), front["id"])
        assertEquals("CHARACTER", front["type"])
        assertEquals("Mira Vell", front["name"])
        assertEquals(listOf("The Cartographer"), front["aliases"])
        assertEquals(listOf("protagonist", "cartographer"), front["tags"])
        assertEquals("media/x.png", front["thumbnail"])
        assertEquals("character-basic", front["templateId"])
        @Suppress("UNCHECKED_CAST")
        val details = front["details"] as List<Map<String, Any>>
        assertEquals(listOf("Story role", "Voice", "Pronouns"), details.map { it["label"] })
        assertEquals("IDENTITY", details[0]["role"])
        assertEquals("Clipped, dry humour.\nNever says sorry.", details[1]["value"])
        assertFalse(details[2].containsKey("value"), "an empty detail has no value key")
        assertTrue(markdown.contains("value: |"), "multi-line text is written as a readable literal block")
        assertEquals("\n## Description\n\nA disgraced cartographer.\n\n## Notes\n\nSecretly the heir.\n", body)
    }

    @Test
    fun `text that looks like YAML is quoted, so it reads back as the same string`() {
        val tricky = entry("Yes: no # not a comment").apply { aliases = arrayOf("true", "- dash", "'quoted'") }

        val (front, _) = frontmatter(ProjectFolderWriter.entryMarkdown(tricky, thumbnail = null))

        assertEquals("Yes: no # not a comment", front["name"])
        assertEquals(listOf("true", "- dash", "'quoted'"), front["aliases"])
    }

    @Test
    fun `entries with the same name in one folder get the second one's id appended instead of overwriting`() {
        val first = entry("Mira", id = "11111111-0000-0000-0000-000000000000")
        val second = entry("Mira", id = "22222222-0000-0000-0000-000000000000")

        val names = export(listOf(first, second)).keys.filter { it.contains("/codex/") }

        assertEquals(listOf("the-drowned-quarter/codex/characters/mira.md", "the-drowned-quarter/codex/characters/mira-22222222.md"), names)
    }

    @Test
    fun `slugs drop accents and punctuation, keep letters of any script, and fall back to the id`() {
        assertEquals("cafe-noir", ProjectFolderWriter.slug("Café Noir"))
        assertEquals("ælinor-s-crown-of-ash", ProjectFolderWriter.slug("Ælinor's Crown — of Ash!"))
        assertEquals("東京", ProjectFolderWriter.slug("東京"))
        val nameless = entry("???", EntryType.ITEM, id = "33333333-0000-0000-0000-000000000000")
        assertTrue(export(listOf(nameless)).keys.contains("the-drowned-quarter/codex/items/33333333-0000-0000-0000-000000000000.md"))
    }
}
