package io.mytherion.fixtures

import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.model.Project
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import java.time.Instant
import java.util.UUID

/**
 * In-memory builders for Project-related tests.
 *
 * Constructs detached objects and DTOs without touching the database, so unit tests and
 * `@WebMvcTest` slices can use them without a repository or a Spring context.
 *
 * Use [TestFixtures] instead when a test needs rows actually persisted.
 */
object ProjectTestFixtures {

    fun createTestUser(
        id: UUID = UUID.randomUUID(),
        username: String = "testuser",
        email: String = "test@example.com",
        passwordHash: String = "hashedpassword",
        role: UserRole = UserRole.USER,
        createdAt: Instant = Instant.now()
    ) = User(
        username = username,
        email = email,
        passwordHash = passwordHash,
        role = role
    ).apply {
        this.id = id
        this.createdAt = createdAt
    }

    fun createTestProject(
        id: UUID? = UUID.randomUUID(),
        owner: User = createTestUser(),
        name: String = "Test Project",
        description: String? = "Test project description",
        genre: String? = null,
        createdAt: Instant = Instant.now(),
        updatedAt: Instant = Instant.now()
    ) = Project(
        owner = owner,
        name = name,
        description = description,
        genre = genre
    ).apply {
        this.id = id
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    fun createTestProjectResponse(
        id: UUID = UUID.randomUUID(),
        name: String = "Test Project",
        description: String? = "Test project description",
        ownerId: UUID = UUID.randomUUID(),
        ownerUsername: String = "testuser",
        createdAt: Instant = Instant.now(),
        updatedAt: Instant = Instant.now(),
        genre: String? = null
    ) = ProjectResponse(
        id = id,
        name = name,
        description = description,
        ownerId = ownerId,
        ownerUsername = ownerUsername,
        createdAt = createdAt,
        updatedAt = updatedAt,
        genre = genre
    )

    fun createTestCreateProjectRequest(
        name: String = "New Project",
        description: String? = "New project description",
        genre: String? = null
    ) = CreateProjectRequest(
        name = name,
        description = description,
        genre = genre
    )

    fun createTestUpdateProjectRequest(
        name: String? = "Updated Project",
        description: String? = "Updated description",
        genre: String? = null
    ) = UpdateProjectRequest(
        name = name,
        description = description,
        genre = genre
    )
}
