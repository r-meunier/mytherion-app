package io.mytherion.dashboard.rest

import io.mytherion.dashboard.dto.DashboardStatsDTO
import io.mytherion.dashboard.service.DashboardService
import io.mytherion.logging.logger
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {
    private val logger = logger()

    @GetMapping("/stats")
    fun getDashboardStats(): DashboardStatsDTO {
        logger.info("Get dashboard stats request")
        return dashboardService.getDashboardStats()
    }
}
