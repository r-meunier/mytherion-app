package io.mytherion

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableAsync

@EnableAsync
@SpringBootApplication
class MytherionApplication

fun main(args: Array<String>) {
    runApplication<MytherionApplication>(*args)
}
