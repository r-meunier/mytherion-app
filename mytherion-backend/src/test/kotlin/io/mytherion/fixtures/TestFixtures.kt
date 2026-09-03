package io.mytherion.fixtures

import io.mytherion.config.seed.TestUsers
import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityMetadata
import io.mytherion.entity.model.EntityType
import io.mytherion.entity.model.components.*
import io.mytherion.entity.repository.EntityRepository
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
    private val entityRepository: EntityRepository? = null
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
     * Create and persist a CHARACTER entity in the given project.
     * Requires [entityRepository] to be provided in the constructor.
     */
    fun createCharacterEntity(
        project: Project,
        name: String = "Test Character",
        tags: List<String> = listOf("test"),
        components: List<EntityComponent> = listOf(
            BioComponent(data = BioData(
                status = "Alive",
                age = Quantity(value = 30.0, unit = "years"),
                gender = "Unknown"
            ))
        )
    ): Entity {
        val repo = requireNotNull(entityRepository) {
            "EntityRepository was not provided to TestFixtures"
        }
        return repo.save(
            Entity(
                project = project,
                type = EntityType.CHARACTER,
                name = name,
                tags = tags.toTypedArray(),
                metadata = EntityMetadata(components.toMutableList())
            )
        )
    }

    /**
     * Create and persist a LOCATION entity in the given project.
     * Requires [entityRepository] to be provided in the constructor.
     */
    fun createLocationEntity(
        project: Project,
        name: String = "Test Location",
        tags: List<String> = listOf("test")
    ): Entity {
        val repo = requireNotNull(entityRepository) {
            "EntityRepository was not provided to TestFixtures"
        }
        return repo.save(
            Entity(
                project = project,
                type = EntityType.LOCATION,
                name = name,
                tags = tags.toTypedArray()
            )
        )
    }

    /**
     * Create and persist a generic entity of any type.
     * Requires [entityRepository] to be provided in the constructor.
     */
    fun createEntity(
        project: Project,
        type: EntityType,
        name: String,
        description: String? = null,
        tags: List<String> = emptyList(),
        components: List<EntityComponent> = emptyList()
    ): Entity {
        val repo = requireNotNull(entityRepository) {
            "EntityRepository was not provided to TestFixtures"
        }
        return repo.save(
            Entity(
                project = project,
                type = type,
                name = name,
                description = description,
                tags = tags.toTypedArray(),
                metadata = if (components.isNotEmpty()) EntityMetadata(components.toMutableList()) else null
            )
        )
    }
}
