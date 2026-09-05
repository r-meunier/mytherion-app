package io.mytherion.fixtures

import io.mytherion.config.seed.TestUsers
import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryContent
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.model.sections.*
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.project.model.Project
import io.mytherion.project.repository.ProjectRepository
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import io.mytherion.user.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder

/**
 * Test data factory for integration and E2E tests.
 *
 * Every method **persists** through the injected repositories, so this requires a live database.
 * Use [ProjectTestFixtures] instead for unit tests that only need detached objects or DTOs.
 *
 * Inject or instantiate this class and call the relevant factory method. 
 * All methods use [TestUsers] constants as defaults so test identities are consistent everywhere.
 *
 * Usage (in a `@SpringBootTest`):
 * ```kotlin
 * @Autowired lateinit var userRepository: UserRepository
 * @Autowired lateinit var passwordEncoder: PasswordEncoder
 *
 * private lateinit var fixtures: TestFixtures
 *
 * @BeforeEach
 * fun setup() {
 *     fixtures = TestFixtures(userRepository, passwordEncoder)
 * }
 *
 * @Test
 * fun `my test`() {
 *     val user = fixtures.createVerifiedUser()
 *     val project = fixtures.createProjectForUser(user)
 *     // ...
 * }
 * ```
 */
class TestFixtures(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val projectRepository: ProjectRepository? = null,
    private val entryRepository: CodexEntryRepository? = null
) {

    // ════════════════════════════════════════════════════════════════
    //  USER FACTORIES
    // ════════════════════════════════════════════════════════════════

    /**
     * Create and persist a verified user with the given credentials.
     * Defaults to [TestUsers.USER_EMAIL] / [TestUsers.USER_USERNAME].
     */
    fun createVerifiedUser(
        email: String = TestUsers.USER_EMAIL,
        username: String = TestUsers.USER_USERNAME,
        password: String = TestUsers.DEFAULT_PASSWORD,
        role: UserRole = UserRole.USER
    ): User {
        val user = User(
            email = email,
            username = username,
            passwordHash = requireNotNull(passwordEncoder.encode(password)) {
                "Password encoder returned null"
            },
            role = role,
            emailVerified = true
        )
        return userRepository.save(user)
    }

    /**
     * Create and persist an admin user.
     * Defaults to [TestUsers.ADMIN_EMAIL] / [TestUsers.ADMIN_USERNAME].
     */
    fun createAdmin(
        email: String = TestUsers.ADMIN_EMAIL,
        username: String = TestUsers.ADMIN_USERNAME,
        password: String = TestUsers.DEFAULT_PASSWORD
    ): User = createVerifiedUser(email, username, password, UserRole.ADMIN)

    /**
     * Create and persist an unverified user (for testing the verification flow).
     * Defaults to [TestUsers.UNVERIFIED_EMAIL] / [TestUsers.UNVERIFIED_USERNAME].
     */
    fun createUnverifiedUser(
        email: String = TestUsers.UNVERIFIED_EMAIL,
        username: String = TestUsers.UNVERIFIED_USERNAME,
        password: String = TestUsers.DEFAULT_PASSWORD
    ): User {
        val user = User(
            email = email,
            username = username,
            passwordHash = requireNotNull(passwordEncoder.encode(password)) {
                "Password encoder returned null"
            },
            role = UserRole.USER,
            emailVerified = false
        )
        return userRepository.save(user)
    }

    // ════════════════════════════════════════════════════════════════
    //  PROJECT FACTORIES
    // ════════════════════════════════════════════════════════════════

    /**
     * Create and persist a project owned by the given user.
     * Requires [projectRepository] to be provided in the constructor.
     */
    fun createProjectForUser(
        user: User,
        name: String = "Test Project",
        description: String = "A test project for integration testing.",
        genre: String = "Fantasy"
    ): Project {
        val repo = requireNotNull(projectRepository) {
            "ProjectRepository was not provided to TestFixtures"
        }
        return repo.save(
            Project(
                owner = user,
                name = name,
                description = description,
                genre = genre
            )
        )
    }

    // ════════════════════════════════════════════════════════════════
    //  ENTITY FACTORIES
    // ════════════════════════════════════════════════════════════════

    /**
     * Create and persist a CHARACTER entry in the given project.
     * Requires [entryRepository] to be provided in the constructor.
     */
    fun createCharacterEntry(
        project: Project,
        name: String = "Test Character",
        tags: List<String> = listOf("test"),
        sections: List<EntrySection> = listOf(
            BioSection(data = BioData(
                status = "Alive",
                age = Quantity(value = 30.0, unit = "years"),
                gender = "Unknown"
            ))
        )
    ): CodexEntry {
        val repo = requireNotNull(entryRepository) {
            "CodexEntryRepository was not provided to TestFixtures"
        }
        return repo.save(
            CodexEntry(
                project = project,
                type = EntryType.CHARACTER,
                name = name,
                tags = tags.toTypedArray(),
                content = EntryContent(sections.toMutableList())
            )
        )
    }

    /**
     * Create and persist a LOCATION entry in the given project.
     * Requires [entryRepository] to be provided in the constructor.
     */
    fun createLocationEntry(
        project: Project,
        name: String = "Test Location",
        tags: List<String> = listOf("test")
    ): CodexEntry {
        val repo = requireNotNull(entryRepository) {
            "CodexEntryRepository was not provided to TestFixtures"
        }
        return repo.save(
            CodexEntry(
                project = project,
                type = EntryType.LOCATION,
                name = name,
                tags = tags.toTypedArray()
            )
        )
    }

    /**
     * Create and persist a generic entry of any type.
     * Requires [entryRepository] to be provided in the constructor.
     */
    fun createEntry(
        project: Project,
        type: EntryType,
        name: String,
        description: String? = null,
        tags: List<String> = emptyList(),
        sections: List<EntrySection> = emptyList()
    ): CodexEntry {
        val repo = requireNotNull(entryRepository) {
            "CodexEntryRepository was not provided to TestFixtures"
        }
        return repo.save(
            CodexEntry(
                project = project,
                type = type,
                name = name,
                description = description,
                tags = tags.toTypedArray(),
                content = if (sections.isNotEmpty()) EntryContent(sections.toMutableList()) else null
            )
        )
    }
}
