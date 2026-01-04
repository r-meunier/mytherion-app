package io.mytherion

import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class IntegrationTests(@Autowired val restClient: RestTestClient) {

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