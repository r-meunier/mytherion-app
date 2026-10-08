package io.mytherion.config.seed

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.ContextRole
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryDetail
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.platform.logging.infoWith
import io.mytherion.platform.logging.logger
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Seeds the database with test users, demo projects, and sample entries
 * on application startup. Only active in non-production environments.
 *
 * Idempotent: skips seeding if any users already exist.
 *
 * @see TestUsers for the canonical list of test identities.
 */
@Component
@Profile("dev", "e2e")
class DevDataSeeder(
    private val userRepository: UserRepository,
    private val projectRepository: ProjectRepository,
    private val entryRepository: CodexEntryRepository,
    private val passwordEncoder: PasswordEncoder
) : ApplicationRunner {

    private val logger = logger()

    @Transactional
    override fun run(args: ApplicationArguments) {
        if (userRepository.count() > 0L) {
            logger.infoWith("[SEED] Users already exist — skipping seed")
            return
        }

        logger.infoWith("[SEED] ═══ Starting dev data seed ═══")

        val encodedPassword = requireNotNull(passwordEncoder.encode(TestUsers.DEFAULT_PASSWORD)) {
            "Password encoder returned null"
        }

        // ── Users ────────────────────────────────────────────────────
        val admin = createUser(TestUsers.ADMIN_USERNAME, TestUsers.ADMIN_EMAIL, encodedPassword, UserRole.ADMIN, emailVerified = true)
        val testUser = createUser(TestUsers.USER_USERNAME, TestUsers.USER_EMAIL, encodedPassword, UserRole.USER, emailVerified = true)
        val unverified = createUser(TestUsers.UNVERIFIED_USERNAME, TestUsers.UNVERIFIED_EMAIL, encodedPassword, UserRole.USER, emailVerified = false)
        val emptyUser = createUser(TestUsers.EMPTY_USER_USERNAME, TestUsers.EMPTY_USER_EMAIL, encodedPassword, UserRole.USER, emailVerified = true)
        val builder = createUser(TestUsers.BUILDER_USERNAME, TestUsers.BUILDER_EMAIL, encodedPassword, UserRole.USER, emailVerified = true)

        // ── testuser's demo project ──────────────────────────────────
        val shatteredRealms = createProject(
            owner = testUser,
            name = "The Shattered Realms",
            description = "A high-fantasy world fractured by an ancient cataclysm. Floating continents drift above a sea of storms, connected by magical ley-bridges.",
            genre = "Fantasy"
        )
        seedShatteredRealmsEntries(shatteredRealms)

        // ── worldbuilder's multiple projects ─────────────────────────
        val ironEmpire = createProject(
            owner = builder,
            name = "The Iron Empire",
            description = "A steampunk industrial empire on the brink of revolution. Clockwork soldiers patrol the smog-filled streets while rebel engineers plot from the underground.",
            genre = "Steampunk"
        )
        seedIronEmpireEntries(ironEmpire)

        val echoesOfEden = createProject(
            owner = builder,
            name = "Echoes of Eden",
            description = "A post-apocalyptic world where nature has reclaimed the ruins of a fallen civilization. Scattered tribes worship the ancient machines they no longer understand.",
            genre = "Post-Apocalyptic"
        )
        seedEchoesOfEdenEntries(echoesOfEden)

        val stellarDrift = createProject(
            owner = builder,
            name = "Stellar Drift",
            description = "Humanity's last colony ships drift between dying stars. Political intrigue and resource wars define life aboard the Arks.",
            genre = "Sci-Fi"
        )
        seedStellarDriftEntries(stellarDrift)

        logger.infoWith(
            "[SEED] ═══ Dev data seed complete ═══",
            "users" to 5,
            "projects" to 4,
            "entries" to entryRepository.count()
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  HELPERS
    // ════════════════════════════════════════════════════════════════

    private fun createUser(
        username: String,
        email: String,
        encodedPassword: String,
        role: UserRole,
        emailVerified: Boolean
    ): User {
        val user = userRepository.save(
            User(
                username = username,
                email = email,
                passwordHash = encodedPassword,
                role = role,
                emailVerified = emailVerified
            )
        )
        logger.infoWith("[SEED] Created user", "username" to username, "email" to email, "role" to role, "verified" to emailVerified)
        return user
    }

    private fun createProject(owner: User, name: String, description: String, genre: String): Project {
        val project = projectRepository.save(
            Project(
                owner = owner,
                name = name,
                description = description,
                genre = genre
            )
        )
        logger.infoWith("[SEED] Created project", "name" to name, "owner" to owner.username, "projectId" to project.id)
        return project
    }

    private fun createEntry(
        project: Project,
        type: EntryType,
        name: String,
        description: String? = null,
        tags: List<String> = emptyList(),
        aliases: List<String> = emptyList(),
        details: List<EntryDetail> = emptyList()
    ): CodexEntry {
        val entry = entryRepository.save(
            CodexEntry(
                project = project,
                type = type,
                name = name,
                description = description,
                tags = tags.toTypedArray(),
                aliases = aliases.takeIf { it.isNotEmpty() }?.toTypedArray(),
                content = EntryContent(
                    templateId = "${type.name.lowercase()}-basic".takeIf { details.isNotEmpty() },
                    details = details.toMutableList()
                )
            )
        )
        logger.infoWith("[SEED] Created entry", "name" to name, "type" to type, "projectId" to project.id)
        return entry
    }

    private fun detail(label: String, value: String, role: ContextRole? = null) =
        EntryDetail(id = UUID.randomUUID(), label = label, value = value, role = role)

    // ════════════════════════════════════════════════════════════════
    //  THE SHATTERED REALMS  (testuser's project)
    // ════════════════════════════════════════════════════════════════

    private fun seedShatteredRealmsEntries(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Vaelith Stormweaver",
            description = "Once the youngest Archon of the Luminari Order, Vaelith was exiled after a forbidden experiment shattered the Veil of Echoes. Now wandering the fractured realms, she searches for the Convergence Stones — artifacts rumoured to restore the world's shattered connections.",
            tags = listOf("protagonist", "mage", "exile", "ley-mage"),
            aliases = listOf("The Exiled Archon", "Vael"),
            details = listOf(
                detail("Story role", "Protagonist", ContextRole.IDENTITY),
                detail("Pronouns", "she/her", ContextRole.IDENTITY),
                detail("Occupation", "Wandering scholar, former Archon of the Luminari Order", ContextRole.IDENTITY),
                detail("Age", "34"),
                detail("Physical appearance", "Sharp angular features, silver-white hair streaked with violet from ley-exposure. Luminous ley-burn scars run up both forearms.", ContextRole.APPEARANCE),
                detail("Personality", "Determined, brilliant and curious; also reckless, haunted and stubborn. Traces invisible glyphs in the air when thinking.", ContextRole.IDENTITY),
                detail("Goal", "Restore the ley-lines before the last continent falls, and prove her exile was unjust.", ContextRole.MOTIVATION)
            )
        )

        createEntry(
            project = project,
            type = EntryType.LOCATION,
            name = "The Luminari Citadel",
            tags = listOf("landmark", "ruins", "luminari", "arcane"),
            details = listOf(
                detail("Region", "A floating basalt island anchored by crystallized ley-nodes", ContextRole.IDENTITY),
                detail("Atmosphere", "Humming wards, cold marble halls, the smell of ozone where the ley-barriers fail", ContextRole.SENSORY),
                detail("Population", "About 200 scholars"),
                detail("History", "Founded in the First Age as a beacon of arcane study. Partially destroyed during the Shattering.", ContextRole.BACKSTORY)
            )
        )

        createEntry(
            project = project,
            type = EntryType.ORGANIZATION,
            name = "The Luminari Order",
            tags = listOf("faction", "mages", "luminari", "order"),
            details = listOf(
                detail("Purpose", "Preserve the remaining ley-lines and prevent further continental collapse", ContextRole.MOTIVATION),
                detail("Leadership", "Council of Archons led by the High Illuminator", ContextRole.IDENTITY),
                detail("Size", "About 150 members", ContextRole.IDENTITY),
                detail("Culture", "Deeply scholarly and hierarchical. Knowledge is hoarded, not shared.")
            )
        )

        createEntry(
            project = project,
            type = EntryType.ITEM,
            name = "Convergence Stone",
            tags = listOf("artifact", "quest-item", "ancient", "ley-stone"),
            details = listOf(
                detail("Kind", "Legendary artifact of crystallized ley-energy", ContextRole.IDENTITY),
                detail("Origin", "Forged during the First Age by the original Archons. Scattered across the realms during the Shattering.", ContextRole.BACKSTORY),
                detail("Properties", "Ley-resonant, self-repairing, possibly sentient", ContextRole.IDENTITY)
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  THE IRON EMPIRE  (worldbuilder project #1)
    // ════════════════════════════════════════════════════════════════

    private fun seedIronEmpireEntries(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Commissioner Greaves",
            tags = listOf("antagonist", "authority", "steampunk"),
            details = listOf(
                detail("Story role", "Antagonist", ContextRole.IDENTITY),
                detail("Occupation", "Commissioner of Compliance", ContextRole.IDENTITY),
                detail("Age", "58"),
                detail("Personality", "Strategic and disciplined; cruel, paranoid and obsessive.", ContextRole.IDENTITY),
                detail("Goal", "Crush the rebel engineers and keep imperial order, to justify what he did in the Cog Wars.", ContextRole.MOTIVATION)
            )
        )

        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Renna Blackspanner",
            tags = listOf("protagonist", "engineer", "rebel"),
            aliases = listOf("Spanner"),
            details = listOf(
                detail("Story role", "Protagonist", ContextRole.IDENTITY),
                detail("Occupation", "Underground engineer and rebel cell leader", ContextRole.IDENTITY),
                detail("Age", "26"),
                detail("Skills", "Clockwork engineering, explosives, lock-picking")
            )
        )

        createEntry(
            project = project,
            type = EntryType.LOCATION,
            name = "Geartown",
            tags = listOf("industrial", "urban", "steampunk"),
            details = listOf(
                detail("Atmosphere", "Coal smoke, clanking assembly lines, overcrowded tenements", ContextRole.SENSORY),
                detail("Population", "About 450,000 citizens, mostly working class"),
                detail("Economy", "Heavy manufacturing, clockwork assembly, coal processing")
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  ECHOES OF EDEN  (worldbuilder project #2)
    // ════════════════════════════════════════════════════════════════

    private fun seedEchoesOfEdenEntries(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Kael Root-Speaker",
            tags = listOf("protagonist", "shaman", "nature"),
            details = listOf(
                detail("Story role", "Protagonist", ContextRole.IDENTITY),
                detail("Pronouns", "they/them", ContextRole.IDENTITY),
                detail("Occupation", "Root-Speaker (shaman) of the Verdant Tribe", ContextRole.IDENTITY),
                detail("Age", "19")
            )
        )

        createEntry(
            project = project,
            type = EntryType.LOCATION,
            name = "The Overgrown Spire",
            tags = listOf("ruin", "nature", "ancient-tech"),
            details = listOf(
                detail("Atmosphere", "Dense canopy, bioluminescent fungi glowing on the lower levels", ContextRole.SENSORY),
                detail("History", "Once a corporate headquarters, now a sacred site for the Verdant Tribe", ContextRole.BACKSTORY)
            )
        )

        createEntry(
            project = project,
            type = EntryType.ITEM,
            name = "The Singing Core",
            tags = listOf("relic", "ancient-tech", "power-source"),
            details = listOf(
                detail("Kind", "Unique relic of an unknown alloy", ContextRole.IDENTITY),
                detail("Properties", "Self-powered, emits melodies, unknown energy source. Only partially functional.", ContextRole.IDENTITY)
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  STELLAR DRIFT  (worldbuilder project #3)
    // ════════════════════════════════════════════════════════════════

    private fun seedStellarDriftEntries(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Captain Dara Voss",
            tags = listOf("protagonist", "captain", "leader"),
            aliases = listOf("The Captain"),
            details = listOf(
                detail("Story role", "Protagonist", ContextRole.IDENTITY),
                detail("Occupation", "Ark Commander", ContextRole.IDENTITY),
                detail("Age", "42"),
                detail("Personality", "Pragmatic, charismatic and resilient; secretive and guilt-ridden.", ContextRole.IDENTITY),
                detail("Goal", "Find a habitable world before Ark-7's systems fail, and atone for the crew she sacrificed at Proxima.", ContextRole.MOTIVATION)
            )
        )

        createEntry(
            project = project,
            type = EntryType.ORGANIZATION,
            name = "The Ark Council",
            tags = listOf("government", "council", "political"),
            details = listOf(
                detail("Purpose", "Decide the fate of humanity's last 50,000 survivors", ContextRole.MOTIVATION),
                detail("Leadership", "Rotating chair, one vote per Ark", ContextRole.IDENTITY),
                detail("Size", "12 councilors", ContextRole.IDENTITY),
                detail("Tensions", "Fractured: Arks 3 and 9 are threatening secession", ContextRole.CURRENT_STATE)
            )
        )
    }
}
