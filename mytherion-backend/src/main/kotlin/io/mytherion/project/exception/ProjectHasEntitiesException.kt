package io.mytherion.project.exception

/** Exception thrown when attempting to delete a project that still has entries */
class ProjectHasEntitiesException(projectId: Long, entityCount: Int) :
        RuntimeException(
                "Cannot delete project with id $projectId: it contains $entityCount entities. Delete all entities first."
        )
