package io.mytherion.dashboard.service

import io.mytherion.auth.service.CurrentUserProvider
import io.mytherion.dashboard.dto.DashboardStatsDTO
import io.mytherion.codex.repository.CodexEntryRepository
import io.mytherion.project.repository.ProjectRepository
import java.time.Instant
import java.time.temporal.ChronoUnit
import org.springframework.stereotype.Service
import java.util.UUID
import org.springframework.transaction.annotation.Transactional

import io.mytherion.project.exception.ProjectNotFoundException

@Service
class DashboardService(
    private val entryRepository: CodexEntryRepository,
    private val projectRepository: ProjectRepository,
    private val currentUserProvider: CurrentUserProvider
) {

    @Transactional(readOnly = true)
    fun getDashboardStats(): DashboardStatsDTO {
        val currentUser = currentUserProvider.getCurrentUser()

        val totalEntries = entryRepository.countByOwnerAndDeletedAtIsNull(currentUser)
        val totalProjects = projectRepository.countByOwnerAndDeletedAtIsNull(currentUser)

        val since = Instant.now().minus(24, ChronoUnit.HOURS)
        val recentEdits = entryRepository.countRecentEditsByOwner(currentUser, since)

        val weekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
        val entriesThisWeek = entryRepository.countByOwnerAndCreatedAtAfter(currentUser, weekAgo)

        val recentEntries = entryRepository.findRecentEntriesByOwner(
            currentUser,
            org.springframework.data.domain.PageRequest.of(0, 3)
        ).map(io.mytherion.codex.dto.EntryDTO::from)

        return DashboardStatsDTO(
            totalEntries = totalEntries,
            entriesThisWeek = entriesThisWeek,
            recentEdits = recentEdits,
            totalProjects = totalProjects,
            recentEntries = recentEntries
        )
    }

    @Transactional(readOnly = true)
    fun getProjectDashboardStats(projectId: UUID): DashboardStatsDTO {
        val currentUser = currentUserProvider.getCurrentUser()
        
        // Verify project exists and belongs to user
        val project = projectRepository.findByIdAndOwnerAndDeletedAtIsNull(projectId, currentUser)
            ?: throw ProjectNotFoundException(projectId)

        val totalEntries = entryRepository.countByProjectAndDeletedAtIsNull(project)
        
        val since = Instant.now().minus(24, ChronoUnit.HOURS)
        val recentEdits = entryRepository.countRecentEditsByProject(project, since)

        val weekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
        val entriesThisWeek = entryRepository.countByProjectAndCreatedAtAfter(project, weekAgo)

        val recentEntries = entryRepository.findRecentEntriesByProject(
            project,
            org.springframework.data.domain.PageRequest.of(0, 3)
        ).map(io.mytherion.codex.dto.EntryDTO::from)

        val entryCountByType = entryRepository.countByProjectAndTypeGrouped(project)
            .associate { it.getType().name to it.getCount().toInt() }

        return DashboardStatsDTO(
            totalEntries = totalEntries,
            entriesThisWeek = entriesThisWeek,
            recentEdits = recentEdits,
            totalProjects = 1, // Current context is 1 project
            recentEntries = recentEntries,
            entryCountByType = entryCountByType
        )
    }
}
