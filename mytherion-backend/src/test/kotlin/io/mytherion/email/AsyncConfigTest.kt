package io.mytherion.email

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class AsyncConfigTest {

    private lateinit var asyncConfig: AsyncConfig

    @BeforeEach
    fun setUp() {
        asyncConfig = AsyncConfig()
    }

    // ==================== emailTaskExecutor Tests ====================

    @Test
    fun `emailTaskExecutor should have correct core pool size`() {
        val executor = asyncConfig.emailTaskExecutor()
        assertEquals(2, executor.corePoolSize)
    }

    @Test
    fun `emailTaskExecutor should have correct max pool size`() {
        val executor = asyncConfig.emailTaskExecutor()
        assertEquals(5, executor.maxPoolSize)
    }

    @Test
    fun `emailTaskExecutor should have correct queue capacity`() {
        val executor = asyncConfig.emailTaskExecutor()
        assertEquals(100, executor.queueCapacity)
    }

    @Test
    fun `emailTaskExecutor should use email-async- thread name prefix`() {
        val executor = asyncConfig.emailTaskExecutor()
        // threadNamePrefix is accessible after initialize()
        assertEquals("email-async-", executor.threadNamePrefix)
    }

    // ==================== AsyncUncaughtExceptionHandler Tests ====================

    @Test
    fun `getAsyncUncaughtExceptionHandler should return non-null handler`() {
        val handler = asyncConfig.getAsyncUncaughtExceptionHandler()
        assertNotNull(handler)
    }

    @Test
    fun `exception handler should not rethrow exceptions`() {
        val handler = asyncConfig.getAsyncUncaughtExceptionHandler()!!
        val method = AsyncConfigTest::class.java.declaredMethods.first()

        // Should complete without throwing — fire-and-forget contract
        assertDoesNotThrow {
            handler.handleUncaughtException(
                RuntimeException("SMTP connection refused"),
                method,
                "test@example.com"
            )
        }
    }

    @Test
    fun `exception handler should handle exceptions with no params`() {
        val handler = asyncConfig.getAsyncUncaughtExceptionHandler()!!
        val method = AsyncConfigTest::class.java.declaredMethods.first()

        assertDoesNotThrow {
            handler.handleUncaughtException(RuntimeException("Mail server down"), method)
        }
    }

    @Test
    fun `exception handler should handle exceptions with multiple params`() {
        val handler = asyncConfig.getAsyncUncaughtExceptionHandler()!!
        val method = AsyncConfigTest::class.java.declaredMethods.first()

        assertDoesNotThrow {
            handler.handleUncaughtException(
                RuntimeException("Connection timeout"),
                method,
                "user@example.com",
                "testuser",
                "token-abc-123"
            )
        }
    }
}
