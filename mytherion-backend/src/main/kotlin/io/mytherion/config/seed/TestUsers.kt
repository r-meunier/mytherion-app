package io.mytherion.config.seed

/**
 * ════════════════════════════════════════════════════════════════════════
 *  MYTHERION TEST USERS
 * ════════════════════════════════════════════════════════════════════════
 *  Consistent across all non-production environments:
 *  dev, e2e, staging. NEVER created in production.
 *
 *  All passwords: password123
 *
 *  The DevDataSeeder uses these constants to seed the database on startup
 *  when running with @Profile("dev") or @Profile("e2e").
 *
 *  The TestFixtures class in src/test/ also references these constants
 *  for integration and E2E tests, ensuring test data is consistent everywhere.
 * ════════════════════════════════════════════════════════════════════════
 *
 *  ┌──────────────┬──────────────────────────┬────────┬───────────┐
 *  │ Username     │ Email                    │ Role   │ Verified? │
 *  ├──────────────┼──────────────────────────┼────────┼───────────┤
 *  │ admin        │ admin@mytherion.dev      │ ADMIN  │ ✓         │
 *  │ testuser     │ user@mytherion.dev       │ USER   │ ✓         │
 *  │ newuser      │ unverified@mytherion.dev │ USER   │ ✗         │
 *  │ emptyuser    │ empty@mytherion.dev      │ USER   │ ✓         │
 *  │ worldbuilder │ builder@mytherion.dev    │ USER   │ ✓         │
 *  └──────────────┴──────────────────────────┴────────┴───────────┘
 */
object TestUsers {
    const val DEFAULT_PASSWORD = "password123"

    // ── Admin ────────────────────────────────────────────────────────
    const val ADMIN_EMAIL    = "admin@mytherion.dev"
    const val ADMIN_USERNAME = "admin"

    // ── Standard verified user (owns 1 demo project) ────────────────
    const val USER_EMAIL    = "user@mytherion.dev"
    const val USER_USERNAME = "testuser"

    // ── Unverified user (for testing the email verification flow) ────
    const val UNVERIFIED_EMAIL    = "unverified@mytherion.dev"
    const val UNVERIFIED_USERNAME = "newuser"

    // ── Empty user (verified, zero projects) ────────────────────────
    const val EMPTY_USER_EMAIL    = "empty@mytherion.dev"
    const val EMPTY_USER_USERNAME = "emptyuser"

    // ── Worldbuilder (verified, multiple projects with entities) ─────
    const val BUILDER_EMAIL    = "builder@mytherion.dev"
    const val BUILDER_USERNAME = "worldbuilder"
}
