package io.mytherion.config

import io.mytherion.monitoring.PerformanceInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Web MVC configuration for the Mytherion application.
 *
 * Registers interceptors for cross-cutting concerns like performance monitoring.
 */
@Configuration
class WebMvcConfig(private val performanceInterceptor: PerformanceInterceptor) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        // Register performance monitoring for all API endpoints
        registry.addInterceptor(performanceInterceptor)
                .addPathPatterns("/api/**")
                .order(1) // Execute first to capture total request time
    }
}
