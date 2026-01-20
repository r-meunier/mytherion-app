package io.mytherion.monitoring

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Timer
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit

/**
 * Micrometer-based metrics service for recording domain-specific performance metrics.
 *
 * This complements the generic HTTP and JVM metrics provided by Spring Boot Actuator by
 * capturing timings and counts for key business operations (auth, projects, entities, storage, etc.).
 */
@Service
class MetricsService(
    private val meterRegistry: MeterRegistry
) {

    // region Project metrics

    /**
     * Record the duration and outcome of a project creation operation.
     *
     * Metric: project.creation
     * Tags:
     *  - success: "true" | "false"
     */
    fun recordProjectCreation(durationMs: Long, success: Boolean) {
        Timer.builder("project.creation")
            .tag("success", success.toString())
            .description("Time to create a project")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)
    }

    /**
     * Record statistics about querying entities for a project.
     *
     * Metrics:
     *  - entity.queries.total (counter)
     *  - entity.query.size (gauge - last observed size)
     *  - entity.query.duration (timer with size_bucket tag)
     */
    fun recordEntityQuery(projectId: Long, entityCount: Int, durationMs: Long) {
        // Total number of entity queries per project
        meterRegistry.counter(
            "entity.queries.total",
            "project_id", projectId.toString()
        ).increment()

        // Last observed result size (simple gauge)
        meterRegistry.gauge("entity.query.size", entityCount.toDouble())

        // Duration of the query, bucketed by size
        Timer.builder("entity.query.duration")
            .tag("size_bucket", getSizeBucket(entityCount))
            .description("Time to query entities for a project")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)
    }

    // endregion

    // region Auth metrics

    /**
     * Record login attempts and their outcomes.
     *
     * Metric: auth.login
     * Tags:
     *  - success: "true" | "false"
     *  - reason: "ok" | "invalid_credentials" | "email_not_verified" | "error"
     */
    fun recordLogin(durationMs: Long, success: Boolean, reason: String) {
        Timer.builder("auth.login")
            .tag("success", success.toString())
            .tag("reason", reason)
            .description("User login attempts")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)
    }

    /**
     * Record user registration attempts and their outcomes.
     *
     * Metric: auth.register
     * Tags:
     *  - success: "true" | "false"
     */
    fun recordRegistration(durationMs: Long, success: Boolean) {
        Timer.builder("auth.register")
            .tag("success", success.toString())
            .description("User registration attempts")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)
    }

    // endregion

    // region Entity search metrics

    /**
     * Record high-level statistics about entity searches.
     *
     * Metrics:
     *  - entity.search.total (counter)
     *  - entity.search.duration (timer)
     */
    fun recordEntitySearch(
        projectId: Long,
        totalResults: Int,
        pageResults: Int,
        durationMs: Long
    ) {
        meterRegistry.counter(
            "entity.search.total",
            "project_id", projectId.toString()
        ).increment()

        Timer.builder("entity.search.duration")
            .tag("project_id", projectId.toString())
            .description("Time to execute entity search")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)

        meterRegistry.gauge("entity.search.results.total", totalResults.toDouble())
        meterRegistry.gauge("entity.search.results.page", pageResults.toDouble())
    }

    // endregion

    // region Storage metrics

    /**
     * Record storage upload operations.
     *
     * Metric: storage.upload
     * Tags:
     *  - bucket: bucket name
     *  - success: "true" | "false"
     */
    fun recordStorageUpload(
        bucket: String,
        sizeBytes: Long,
        durationMs: Long,
        success: Boolean
    ) {
        Timer.builder("storage.upload")
            .tag("bucket", bucket)
            .tag("success", success.toString())
            .description("Object upload operations")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)

        meterRegistry.gauge("storage.upload.size.bytes", sizeBytes.toDouble())
    }

    /**
     * Record storage delete operations.
     *
     * Metric: storage.delete
     */
    fun recordStorageDelete(
        bucket: String,
        durationMs: Long,
        success: Boolean
    ) {
        Timer.builder("storage.delete")
            .tag("bucket", bucket)
            .tag("success", success.toString())
            .description("Object delete operations")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)
    }

    /**
     * Record presigned URL generation operations.
     *
     * Metric: storage.presign
     */
    fun recordStoragePresign(
        bucket: String,
        durationMs: Long,
        success: Boolean
    ) {
        Timer.builder("storage.presign")
            .tag("bucket", bucket)
            .tag("success", success.toString())
            .description("Presigned URL generation")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)
    }

    // endregion

    private fun getSizeBucket(count: Int): String = when {
        count < 10 -> "small"
        count < 100 -> "medium"
        count < 1000 -> "large"
        else -> "xlarge"
    }
}

