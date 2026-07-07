package io.mytherion.project.exception

/** Exception thrown when attempting to delete a project that still has entries */
import java.util.UUID

class ProjectHasEntitiesException(projectId: UUID, entityCount: Int) :
    RuntimeException(
        "Cannot delete project with id $projectId: it contains $entityCount entities. Delete all entities first."
    )
