package io.mytherion

import io.mytherion.support.IntegrationTest
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest

@IntegrationTest
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
// TODO
class IntegrationTests {

    companion object {
        @JvmStatic
        @BeforeAll
        fun setup(): Unit {
            println(">> Setup")
        }

        @JvmStatic
        @AfterAll
        fun teardown(): Unit {
            println(">> Tear down")
        }
    }

    @Test
    fun `Assert article page title, content and status code`() {
        println(">> TODO")
    }

}