package io.mytherion.support

import org.junit.jupiter.api.Tag

/**
 * Marks a test that boots a Spring context and needs a live database.
 *
 * These are excluded from `./gradlew test` so the unit loop stays fast, and run by
 * `./gradlew integrationTest`. `./gradlew check` runs both, which is what CI uses.
 */
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@Tag("integration")
annotation class IntegrationTest
