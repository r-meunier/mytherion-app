package io.mytherion.email

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.scheduling.annotation.Async

class EmailServiceAsyncTest {

    @Test
    fun `sendVerificationEmail should be annotated with @Async`() {
        val method =
                EmailService::class.java.getMethod(
                        "sendVerificationEmail",
                        String::class.java,
                        String::class.java,
                        String::class.java
                )
        val asyncAnnotation = method.getAnnotation(Async::class.java)

        assertNotNull(asyncAnnotation, "sendVerificationEmail must be annotated with @Async")
    }

    @Test
    fun `sendVerificationEmail @Async should reference the emailTaskExecutor`() {
        val method =
                EmailService::class.java.getMethod(
                        "sendVerificationEmail",
                        String::class.java,
                        String::class.java,
                        String::class.java
                )
        val asyncAnnotation = method.getAnnotation(Async::class.java)

        assertEquals(
                "emailTaskExecutor",
                asyncAnnotation.value,
                "sendVerificationEmail must use the named emailTaskExecutor bean"
        )
    }
}
