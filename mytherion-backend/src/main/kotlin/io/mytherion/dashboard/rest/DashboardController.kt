package io.mytherion.dashboard.rest

import io.mytherion.dashboard.dto.DashboardStatsDTO
import io.mytherion.dashboard.service.DashboardService
import io.mytherion.platform.logging.logger
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import java.util.UUID
import org.springframework.web.bind.annotation.RestController

@RestController
class DashboardController(
    private val dashboardService: DashboardService
) {
    private val logger = logger()
    
    @GetMapping("/api/dashboard/stats")
    fun getDashboardStats(): DashboardStatsDTO {
        logger.info("Get global dashboard stats request")
        return dashboardService.getDashboardStats()
    }

    @GetMapping("/api/projects/{projectId}/dashboard/stats")
    fun getProjectDashboardStats(@PathVariable projectId: UUID): DashboardStatsDTO {
        logger.info("Get project dashboard stats request for project: $projectId")
        return dashboardService.getProjectDashboardStats(projectId)
    }
}
