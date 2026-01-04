package io.mytherion.project.exception

/** Exception thrown when attempting to delete a project that still has entries */
class ProjectHasEntriesException(projectId: Long, entryCount: Int) :
        RuntimeException(
                "Cannot delete project with id $projectId: it contains $entryCount entries. Delete all entries first."
        )
