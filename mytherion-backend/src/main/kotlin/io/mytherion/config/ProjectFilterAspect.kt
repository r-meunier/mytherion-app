package io.mytherion.config

import jakarta.persistence.EntityManager
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Before
import org.aspectj.lang.annotation.Pointcut
import org.hibernate.Session
import org.springframework.stereotype.Component

@Aspect
@Component
class ProjectFilterAspect(private val entityManager: EntityManager) {

    // Intercept all methods in controllers and services that have a 'projectId' parameter
    @Pointcut("execution(* io.mytherion..*.*(..)) && args(projectId, ..)")
    fun methodsWithProjectId(projectId: Long) {}

    @Before("methodsWithProjectId(projectId)")
    fun enableProjectFilter(joinPoint: JoinPoint, projectId: Long) {
        // Ensure we're in an active transaction/session before enabling the filter
        try {
            val session = entityManager.unwrap(Session::class.java)
            session.enableFilter("projectScope").setParameter("projectId", projectId)
        } catch (e: Exception) {
            // Might not be in a transaction context; safe to ignore if it's just a controller method
        }
    }
}
