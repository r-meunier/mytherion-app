package io.mytherion.platform.monitoring

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Timer
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit
import java.util.UUID

/**
 * Micrometer-based metrics service for recording domain-specific performance metrics.
 *
 * This complements the generic HTTP and JVM metrics provided by Spring Boot Actuator by
 * capturing timings and counts for key business operations (auth, projects, entries, storage, etc.).
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
     * Record statistics about querying entries for a project.
     *
     * Metrics:
     *  - entry.queries.total (counter)
     *  - entry.query.size (gauge - last observed size)
     *  - entry.query.duration (timer with size_bucket tag)
     */
    fun recordEntryQuery(projectId: UUID, entryCount: Int, durationMs: Long) {
        // Total number of entry queries per project
        meterRegistry.counter(
            "entry.queries.total",
            "project_id", projectId.toString()
        ).increment()

        // Last observed result size (simple gauge)
        meterRegistry.gauge("entry.query.size", entryCount.toDouble())

        // Duration of the query, bucketed by size
        Timer.builder("entry.query.duration")
            .tag("size_bucket", getSizeBucket(entryCount))
            .description("Time to query entries for a project")
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

    // region CodexEntry search metrics

    /**
     * Record high-level statistics about entry searches.
     *
     * Metrics:
     *  - entry.search.total (counter)
     *  - entry.search.duration (timer)
     */
    fun recordEntrySearch(
        projectId: UUID,
        totalResults: Int,
        pageResults: Int,
        durationMs: Long
    ) {
        meterRegistry.counter(
            "entry.search.total",
            "project_id", projectId.toString()
        ).increment()

        Timer.builder("entry.search.duration")
            .tag("project_id", projectId.toString())
            .description("Time to execute entry search")
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS)

        meterRegistry.gauge("entry.search.results.total", totalResults.toDouble())
        meterRegistry.gauge("entry.search.results.page", pageResults.toDouble())
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

