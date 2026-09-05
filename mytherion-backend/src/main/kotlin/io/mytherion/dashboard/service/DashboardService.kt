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

        val totalEntities = entryRepository.countByOwnerAndDeletedAtIsNull(currentUser)
        val totalProjects = projectRepository.countByOwnerAndDeletedAtIsNull(currentUser)

        val since = Instant.now().minus(24, ChronoUnit.HOURS)
        val recentEdits = entryRepository.countRecentEditsByOwner(currentUser, since)

        val weekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
        val entitiesThisWeek = entryRepository.countByOwnerAndCreatedAtAfter(currentUser, weekAgo)

        val recentEntities = entryRepository.findRecentEntitiesByOwner(
            currentUser,
            org.springframework.data.domain.PageRequest.of(0, 3)
        ).map(io.mytherion.codex.dto.EntryDTO::from)

        return DashboardStatsDTO(
            totalEntities = totalEntities,
            entitiesThisWeek = entitiesThisWeek,
            recentEdits = recentEdits,
            totalProjects = totalProjects,
            recentEntities = recentEntities
        )
    }

    @Transactional(readOnly = true)
    fun getProjectDashboardStats(projectId: UUID): DashboardStatsDTO {
        val currentUser = currentUserProvider.getCurrentUser()
        
        // Verify project exists and belongs to user
        val project = projectRepository.findByIdAndOwnerAndDeletedAtIsNull(projectId, currentUser)
            ?: throw ProjectNotFoundException(projectId)

        val totalEntities = entryRepository.countByProjectAndDeletedAtIsNull(project)
        
        val since = Instant.now().minus(24, ChronoUnit.HOURS)
        val recentEdits = entryRepository.countRecentEditsByProject(project, since)

        val weekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
        val entitiesThisWeek = entryRepository.countByProjectAndCreatedAtAfter(project, weekAgo)

        val recentEntities = entryRepository.findRecentEntitiesByProject(
            project,
            org.springframework.data.domain.PageRequest.of(0, 3)
        ).map(io.mytherion.codex.dto.EntryDTO::from)

        val entityCountByType = entryRepository.countByProjectAndTypeGrouped(project)
            .associate { it.getType().name to it.getCount().toInt() }

        return DashboardStatsDTO(
            totalEntities = totalEntities,
            entitiesThisWeek = entitiesThisWeek,
            recentEdits = recentEdits,
            totalProjects = 1, // Current context is 1 project
            recentEntities = recentEntities,
            entityCountByType = entityCountByType
        )
    }
}
