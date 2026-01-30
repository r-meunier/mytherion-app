
package io.mytherion.project

import io.mytherion.project.dto.CreateProjectRequest
import io.mytherion.project.dto.ProjectResponse
import io.mytherion.project.dto.UpdateProjectRequest
import io.mytherion.project.model.Project
import io.mytherion.user.model.User
import io.mytherion.user.model.UserRole
import java.time.Instant

/**
 * Test fixtures for Project-related tests
 */
object ProjectTestFixtures {

    fun createTestUser(
        id: Long = 1L,
        username: String = "testuser",
        email: String = "test@example.com",
        passwordHash: String = "hashedpassword",
        role: UserRole = UserRole.USER,
        createdAt: Instant = Instant.now()
    ) = User(
        id = id,
        username = username,
        email = email,
        passwordHash = passwordHash,
        role = role,
        createdAt = createdAt
    )

    fun createTestProject(
        id: Long? = 1L,
        owner: User = createTestUser(),
        name: String = "Test Project",
        description: String? = "Test project description",
        genre: String? = null,
        createdAt: Instant = Instant.now(),
        updatedAt: Instant = Instant.now()
    ) = Project(
        id = id,
        owner = owner,
        name = name,
        description = description,
        genre = genre,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    fun createTestProjectResponse(
        id: Long = 1L,
        name: String = "Test Project",
        description: String? = "Test project description",
        ownerId: Long = 1L,
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
