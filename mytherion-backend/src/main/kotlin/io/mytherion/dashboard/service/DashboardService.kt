package io.mytherion.dashboard.service

import io.mytherion.auth.CurrentUserProvider
import io.mytherion.dashboard.dto.DashboardStatsDTO
import io.mytherion.entity.repository.EntityRepository
import io.mytherion.project.repository.ProjectRepository
import java.time.Instant
import java.time.temporal.ChronoUnit
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DashboardService(
        private val entityRepository: EntityRepository,
        private val projectRepository: ProjectRepository,
        private val currentUserProvider: CurrentUserProvider
) {

    @Transactional(readOnly = true)
    fun getDashboardStats(): DashboardStatsDTO {
        val currentUser = currentUserProvider.getCurrentUser()

        val totalEntities = entityRepository.countByOwnerAndDeletedAtIsNull(currentUser)
        val totalProjects = projectRepository.countByOwnerAndDeletedAtIsNull(currentUser)

        val since = Instant.now().minus(24, ChronoUnit.HOURS)
        val recentEdits = entityRepository.countRecentEditsByOwner(currentUser, since)

        val weekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
        val entitiesThisWeek = entityRepository.countByOwnerAndCreatedAtAfter(currentUser, weekAgo)

        val recentEntities = entityRepository.findRecentEntitiesByOwner(
                currentUser,
                org.springframework.data.domain.PageRequest.of(0, 3)
        ).map(io.mytherion.entity.dto.EntityDTO::from)

        return DashboardStatsDTO(
                totalEntities = totalEntities,
                entitiesThisWeek = entitiesThisWeek,
                recentEdits = recentEdits,
                totalProjects = totalProjects,
                recentEntities = recentEntities
        )
    }
}
