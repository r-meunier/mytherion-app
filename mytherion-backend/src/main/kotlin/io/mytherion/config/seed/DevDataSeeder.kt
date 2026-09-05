package io.mytherion.config.seed

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.model.sections.*
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
        seedShatteredRealmsEntities(shatteredRealms)

        // ── worldbuilder's multiple projects ─────────────────────────
        val ironEmpire = createProject(
            owner = builder,
            name = "The Iron Empire",
            description = "A steampunk industrial empire on the brink of revolution. Clockwork soldiers patrol the smog-filled streets while rebel engineers plot from the underground.",
            genre = "Steampunk"
        )
        seedIronEmpireEntities(ironEmpire)

        val echoesOfEden = createProject(
            owner = builder,
            name = "Echoes of Eden",
            description = "A post-apocalyptic world where nature has reclaimed the ruins of a fallen civilization. Scattered tribes worship the ancient machines they no longer understand.",
            genre = "Post-Apocalyptic"
        )
        seedEchoesOfEdenEntities(echoesOfEden)

        val stellarDrift = createProject(
            owner = builder,
            name = "Stellar Drift",
            description = "Humanity's last colony ships drift between dying stars. Political intrigue and resource wars define life aboard the Arks.",
            genre = "Sci-Fi"
        )
        seedStellarDriftEntities(stellarDrift)

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
        sections: List<EntrySection> = emptyList()
    ): CodexEntry {
        val entry = entryRepository.save(
            CodexEntry(
                project = project,
                type = type,
                name = name,
                description = description,
                tags = tags.toTypedArray(),
                content = if (sections.isNotEmpty()) EntryContent(sections.toMutableList()) else null
            )
        )
        logger.infoWith("[SEED] Created entry", "name" to name, "type" to type, "projectId" to project.id)
        return entry
    }

    // ════════════════════════════════════════════════════════════════
    //  THE SHATTERED REALMS  (testuser's project)
    // ════════════════════════════════════════════════════════════════

    private fun seedShatteredRealmsEntities(project: Project) {
        // Character: Vaelith Stormweaver
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Vaelith Stormweaver",
            description = "Once the youngest Archon of the Luminari Order, Vaelith was exiled after a forbidden experiment shattered the Veil of Echoes. Now wandering the fractured realms, she searches for the Convergence Stones — artifacts rumoured to restore the world's shattered connections.",
            tags = listOf("protagonist", "mage", "exile", "ley-mage"),
            sections = listOf(
                BioSection(data = BioData(
                    status = "Alive",
                    age = Quantity(value = 34.0, unit = "years"),
                    gender = "Female",
                    role = "Arcane Scholar",
                    condition = "Scarred by ley-energy exposure"
                )),
                PsychologySection(data = PsychologyData(
                    motivations = MotivationData(
                        externalGoal = "Restore the ley-lines before the last continent falls",
                        internalNeed = "Prove that her exile was unjust",
                        justification = "Only she understands the ley-energy well enough to fix it"
                    ),
                    positiveTraits = listOf("Determined", "Brilliant", "Curious"),
                    negativeTraits = listOf("Reckless", "Haunted", "Stubborn"),
                    mannerisms = "Traces invisible glyphs in the air when thinking"
                )),
                AppearanceSection(data = AppearanceData(
                    physicalFeatures = "Sharp angular features, silver-white hair streaked with violet from ley-exposure",
                    distinguishingMarks = "Luminous ley-burn scars running up both forearms",
                    clothingStyle = "Worn traveller's robes over practical leather armour, covered in arcane notation"
                )),
                SocialSection(data = SocialData(
                    occupations = listOf("Wandering Scholar", "Former Archon"),
                    skills = listOf("Ley-Manipulation", "Ancient Languages", "Cartography"),
                    affiliations = "Formerly Luminari Order (exiled)"
                ))
            )
        )

        // Location: The Luminari Citadel
        createEntry(
            project = project,
            type = EntryType.LOCATION,
            name = "The Luminari Citadel",
            tags = listOf("landmark", "ruins", "luminari", "arcane"),
            sections = listOf(
                LocationSection(data = LocationData(
                    population = Quantity(value = 200.0, unit = "scholars"),
                    geology = "Floating basalt island anchored by crystallized ley-nodes",
                    security = "Warded by ancient ley-barriers, though many are failing",
                    history = "Founded in the First Age as a beacon of arcane study. Partially destroyed during the Shattering."
                ))
            )
        )

        // Organization: The Luminari Order
        createEntry(
            project = project,
            type = EntryType.ORGANIZATION,
            name = "The Luminari Order",
            tags = listOf("faction", "mages", "luminari", "order"),
            sections = listOf(
                OrganizationSection(data = OrganizationData(
                    population = Quantity(value = 150.0, unit = "members"),
                    agenda = "Preserve remaining ley-lines and prevent further continental collapse",
                    powerStructure = "Council of Archons led by the High Illuminator",
                    internalCulture = "Deeply scholarly and hierarchical. Knowledge is hoarded, not shared."
                ))
            )
        )

        // Item: Convergence Stone
        createEntry(
            project = project,
            type = EntryType.ITEM,
            name = "Convergence Stone",
            tags = listOf("artifact", "quest-item", "ancient", "ley-stone"),
            sections = listOf(
                ItemSection(data = ItemData(
                    rarity = "Legendary",
                    material = "Crystallized ley-energy",
                    properties = listOf("Ley-Resonance", "Self-Repairing", "Sentient"),
                    history = "Forged during the First Age by the original Archons. Scattered across the realms during the Shattering."
                ))
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  THE IRON EMPIRE  (worldbuilder project #1)
    // ════════════════════════════════════════════════════════════════

    private fun seedIronEmpireEntities(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Commissioner Greaves",
            tags = listOf("antagonist", "authority", "steampunk"),
            sections = listOf(
                BioSection(data = BioData(
                    status = "Alive",
                    age = Quantity(value = 58.0, unit = "years"),
                    gender = "Male",
                    role = "Commissioner of Compliance"
                )),
                PsychologySection(data = PsychologyData(
                    motivations = MotivationData(
                        externalGoal = "Crush the rebel engineers and maintain imperial order",
                        internalNeed = "Justify the atrocities he committed during the Cog Wars"
                    ),
                    positiveTraits = listOf("Strategic", "Disciplined"),
                    negativeTraits = listOf("Cruel", "Paranoid", "Obsessive")
                ))
            )
        )

        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Renna Blackspanner",
            tags = listOf("protagonist", "engineer", "rebel"),
            sections = listOf(
                BioSection(data = BioData(
                    status = "Alive",
                    age = Quantity(value = 26.0, unit = "years"),
                    gender = "Female",
                    role = "Underground Engineer"
                )),
                SocialSection(data = SocialData(
                    occupations = listOf("Mechanic", "Rebel Cell Leader"),
                    skills = listOf("Clockwork Engineering", "Explosives", "Lock-picking")
                ))
            )
        )

        createEntry(
            project = project,
            type = EntryType.LOCATION,
            name = "Geartown",
            tags = listOf("industrial", "urban", "steampunk"),
            sections = listOf(
                LocationSection(data = LocationData(
                    population = Quantity(value = 450000.0, unit = "citizens"),
                    economy = "Heavy manufacturing, clockwork assembly, coal processing",
                    demographics = "Working class, overcrowded tenements, high mortality"
                ))
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  ECHOES OF EDEN  (worldbuilder project #2)
    // ════════════════════════════════════════════════════════════════

    private fun seedEchoesOfEdenEntities(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Kael Root-Speaker",
            tags = listOf("protagonist", "shaman", "nature"),
            sections = listOf(
                BioSection(data = BioData(
                    status = "Alive",
                    age = Quantity(value = 19.0, unit = "years"),
                    gender = "Non-binary",
                    role = "Root-Speaker (shaman)"
                ))
            )
        )

        createEntry(
            project = project,
            type = EntryType.LOCATION,
            name = "The Overgrown Spire",
            tags = listOf("ruin", "nature", "ancient-tech"),
            sections = listOf(
                LocationSection(data = LocationData(
                    ecology = "Dense canopy ecosystem with bioluminescent fungi at lower levels",
                    history = "Once a corporate headquarters, now a sacred site for the Verdant Tribe"
                ))
            )
        )

        createEntry(
            project = project,
            type = EntryType.ITEM,
            name = "The Singing Core",
            tags = listOf("relic", "ancient-tech", "power-source"),
            sections = listOf(
                ItemSection(data = ItemData(
                    rarity = "Unique",
                    material = "Unknown alloy",
                    condition = "Functional (partially)",
                    properties = listOf("Self-Powered", "Melodic Emission", "Unknown Energy Source")
                ))
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  STELLAR DRIFT  (worldbuilder project #3)
    // ════════════════════════════════════════════════════════════════

    private fun seedStellarDriftEntities(project: Project) {
        createEntry(
            project = project,
            type = EntryType.CHARACTER,
            name = "Captain Dara Voss",
            tags = listOf("protagonist", "captain", "leader"),
            sections = listOf(
                BioSection(data = BioData(
                    status = "Alive",
                    age = Quantity(value = 42.0, unit = "years"),
                    gender = "Female",
                    role = "Ark Commander"
                )),
                PsychologySection(data = PsychologyData(
                    motivations = MotivationData(
                        externalGoal = "Find a habitable world before Ark-7's systems fail",
                        internalNeed = "Atone for the crew she sacrificed at the Battle of Proxima"
                    ),
                    positiveTraits = listOf("Pragmatic", "Charismatic", "Resilient"),
                    negativeTraits = listOf("Secretive", "Guilt-ridden")
                ))
            )
        )

        createEntry(
            project = project,
            type = EntryType.ORGANIZATION,
            name = "The Ark Council",
            tags = listOf("government", "council", "political"),
            sections = listOf(
                OrganizationSection(data = OrganizationData(
                    population = Quantity(value = 12.0, unit = "councilors"),
                    agenda = "Decide the fate of humanity's last 50,000 survivors",
                    powerStructure = "Rotating chair, one vote per Ark",
                    diplomacy = "Fractured — Arks 3 and 9 are threatening secession"
                ))
            )
        )
    }
}
