package io.mytherion.project.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import java.util.UUID
import org.springframework.http.HttpStatus

/** Exception thrown when attempting to delete a project that still has entries */
class ProjectHasEntriesException(projectId: UUID, entryCount: Int) :
    ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.PROJECT_HAS_ENTRIES,
        "Cannot delete project with id $projectId: it contains $entryCount entries. Delete all entries first."
    )
