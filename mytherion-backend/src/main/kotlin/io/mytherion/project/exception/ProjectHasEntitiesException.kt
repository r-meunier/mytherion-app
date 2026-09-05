package io.mytherion.project.exception

import io.mytherion.common.exception.ApiException
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when attempting to delete a project that still has entries */
class ProjectHasEntitiesException(projectId: UUID, entryCount: Int) :
    ApiException(
        HttpStatus.CONFLICT,
        "Conflict",
        "Cannot delete project with id $projectId: it contains $entryCount entries. Delete all entries first."
    )
