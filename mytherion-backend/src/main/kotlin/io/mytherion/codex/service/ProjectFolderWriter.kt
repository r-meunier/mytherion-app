package io.mytherion.codex.service

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import io.mytherion.project.model.Project
import org.yaml.snakeyaml.DumperOptions
import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.nodes.Node
import org.yaml.snakeyaml.nodes.Tag
import org.yaml.snakeyaml.representer.Represent
import org.yaml.snakeyaml.representer.Representer
import tools.jackson.databind.ObjectMapper
import java.io.OutputStream
import java.text.Normalizer
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/**
 * Writes a project as the folder format of docs/decisions/0001-local-first-desktop-client.md §4, zipped:
 *
 * ```
 * <project-slug>/
 * ├── project.json
 * ├── codex/<type folder>/<entry-slug>.md   YAML frontmatter + ## Description / ## Notes
 * └── media/<entry id>.<ext>                entry images
 * ```
 *
 * The zip is the planned `.mytherion` package (§4.5), so an export is also what a future desktop client
 * opens. The `.mytherion/` index is left out: it is a cache, rebuilt from the files.
 */
object ProjectFolderWriter {

    const val FORMAT_VERSION = 1

    /** An entry image, ready to write: its file extension and bytes. */
    class Media(val extension: String, val bytes: ByteArray)

    /** Folder per entry type, as in the ADR's example (`characters/`, `locations/`, …). */
    val TYPE_FOLDERS: Map<EntryType, String> = mapOf(
        EntryType.CHARACTER to "characters",
        EntryType.LOCATION to "locations",
        EntryType.ORGANIZATION to "organizations",
        EntryType.SPECIES to "species",
        EntryType.CULTURE to "cultures",
        EntryType.ITEM to "items",
        EntryType.CUSTOM to "custom",
    )

    /**
     * @param media an entry's image by entry id; entries without one (or whose image could not be read)
     *   are written without a `thumbnail` key.
     */
    fun write(
        out: OutputStream,
        project: Project,
        entries: List<CodexEntry>,
        media: Map<String, Media>,
        objectMapper: ObjectMapper,
    ) {
        val root = slug(project.name).ifEmpty { "project" }
        ZipOutputStream(out).use { zip ->
            zip.put("$root/project.json", projectJson(project, objectMapper))

            val usedPaths = mutableSetOf<String>()
            for (entry in entries) {
                val id = entry.id.toString()
                val folder = "codex/${TYPE_FOLDERS.getValue(entry.type)}"
                // The id is the identity, not the file name (ADR §4.3): two entries with the same name
                // get the second one's id appended rather than overwriting each other.
                val base = slug(entry.name).ifEmpty { id }
                val path = if (usedPaths.add("$folder/$base")) "$folder/$base.md"
                else "$folder/$base-${id.take(8)}.md".also { usedPaths.add(it) }

                val image = media[id]
                val thumbnail = image?.let { "media/$id.${it.extension}" }
                zip.put("$root/$path", entryMarkdown(entry, thumbnail))
                if (image != null) zip.put("$root/$thumbnail", image.bytes)
            }
        }
    }

    /** `project.json` (ADR §4.2): the project's fields minus its owner. */
    fun projectJson(project: Project, objectMapper: ObjectMapper): String {
        val settings = project.settings?.takeIf { it.isNotBlank() }?.let { objectMapper.readTree(it) }
        val json = linkedMapOf<String, Any?>(
            "formatVersion" to FORMAT_VERSION,
            "id" to project.id.toString(),
            "name" to project.name,
            "description" to project.description,
            "genre" to project.genre,
            "settings" to (settings ?: emptyMap<String, Any>()),
        )
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json) + "\n"
    }

    /** One entry as Markdown (ADR §4.3): structured data in the frontmatter, prose in the body. */
    fun entryMarkdown(entry: CodexEntry, thumbnail: String?): String {
        val front = linkedMapOf<String, Any>(
            "id" to entry.id.toString(),
            "type" to entry.type.name,
            "name" to entry.name,
        )
        entry.aliases?.takeIf { it.isNotEmpty() }?.let { front["aliases"] = it.toList() }
        entry.tags?.takeIf { it.isNotEmpty() }?.let { front["tags"] = it.toList() }
        thumbnail?.let { front["thumbnail"] = it }
        entry.content?.templateId?.let { front["templateId"] = it }
        entry.content?.details?.takeIf { it.isNotEmpty() }?.let { details ->
            front["details"] = details.map { d ->
                linkedMapOf<String, Any>("id" to d.id.toString(), "label" to d.label).apply {
                    d.value?.let { put("value", it) }
                    d.hint?.let { put("hint", it) }
                    d.role?.let { put("role", it.name) }
                }
            }
        }

        return buildString {
            append("---\n")
            append(yaml.dump(front))
            append("---\n")
            entry.description?.takeIf { it.isNotBlank() }?.let { append("\n## Description\n\n").append(it.trimEnd()).append('\n') }
            entry.notes?.takeIf { it.isNotBlank() }?.let { append("\n## Notes\n\n").append(it.trimEnd()).append('\n') }
        }
    }

    /**
     * File-name slug: lower case, accents dropped, anything that isn't a letter or digit (of any script)
     * becomes `-`. Zip entry names are UTF-8, so "東京" stays "東京" rather than becoming an id.
     */
    fun slug(name: String): String =
        Normalizer.normalize(name, Normalizer.Form.NFD)
            .replace(Regex("\\p{M}+"), "")
            .lowercase()
            .replace(Regex("[^\\p{L}\\p{N}]+"), "-")
            .trim('-')
            .take(80)
            .trimEnd('-')

    private fun ZipOutputStream.put(path: String, text: String) = put(path, text.toByteArray(Charsets.UTF_8))

    private fun ZipOutputStream.put(path: String, bytes: ByteArray) {
        putNextEntry(ZipEntry(path))
        write(bytes)
        closeEntry()
    }

    /** Block-style YAML; multi-line text as `|` blocks, so long details stay readable in an editor. */
    private val yaml: Yaml = run {
        val options = DumperOptions().apply {
            defaultFlowStyle = DumperOptions.FlowStyle.BLOCK
            indent = 2
            indicatorIndent = 2
            indentWithIndicator = true
            width = 120
            isAllowUnicode = true
            lineBreak = DumperOptions.LineBreak.UNIX
        }
        Yaml(MultilineLiteralRepresenter(options), options)
    }

    private class MultilineLiteralRepresenter(options: DumperOptions) : Representer(options) {
        init {
            val plain = representers[String::class.java]
            representers[String::class.java] = Represent { data ->
                val text = data as String
                if (text.contains('\n')) representScalar(Tag.STR, text, DumperOptions.ScalarStyle.LITERAL)
                else plain!!.representData(data)
            }
        }

        // Keeps Kotlin happy about the protected representScalar used above.
        override fun representScalar(tag: Tag, value: String, style: DumperOptions.ScalarStyle): Node =
            super.representScalar(tag, value, style)
    }
}
