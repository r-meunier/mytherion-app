package io.mytherion.story.rest

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mytherion.auth.jwt.JwtAuthFilter
import io.mytherion.auth.jwt.JwtService
import io.mytherion.auth.util.CookieUtil
import io.mytherion.story.model.StoryStructure
import io.mytherion.story.model.StructureAct
import io.mytherion.story.model.StructureBeat
import io.mytherion.story.service.StoryStructureService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(StoryStructureController::class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = ["app.security.allowed-origins=http://localhost:3000"])
class StoryStructureControllerTest {

    @Autowired private lateinit var mockMvc: MockMvc

    @MockkBean private lateinit var structureService: StoryStructureService
    @MockkBean private lateinit var jwtService: JwtService
    @MockkBean private lateinit var cookieUtil: CookieUtil
    @MockkBean private lateinit var jwtAuthFilter: JwtAuthFilter
    @MockkBean private lateinit var projectAccessInterceptor: io.mytherion.project.security.ProjectAccessInterceptor
    @MockkBean private lateinit var performanceInterceptor: io.mytherion.platform.monitoring.PerformanceInterceptor
    @MockkBean private lateinit var projectRepository: io.mytherion.project.repository.ProjectRepository
    @MockkBean private lateinit var currentUserProvider: io.mytherion.auth.service.CurrentUserProvider

    @BeforeEach
    fun setUpInterceptors() {
        every { projectAccessInterceptor.preHandle(any(), any(), any()) } returns true
        every { projectAccessInterceptor.postHandle(any(), any(), any(), any()) } just runs
        every { projectAccessInterceptor.afterCompletion(any(), any(), any(), any()) } just runs

        every { performanceInterceptor.preHandle(any(), any(), any()) } returns true
        every { performanceInterceptor.postHandle(any(), any(), any(), any()) } just runs
        every { performanceInterceptor.afterCompletion(any(), any(), any(), any()) } just runs
    }

    @Test
    fun `lists the structures with their acts and beats`() {
        every { structureService.all() } returns listOf(
            StoryStructure("free-form", "Free Form", order = 0, acts = listOf(StructureAct("Story"))),
            StoryStructure(
                "three-act", "Three-Act", order = 1,
                acts = listOf(StructureAct("Setup", beats = listOf(StructureBeat("Hook", "Open strong.", 0.01)))),
            ),
        )

        mockMvc.perform(get("/api/story/structures"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value("free-form"))
            .andExpect(jsonPath("$[1].acts[0].title").value("Setup"))
            .andExpect(jsonPath("$[1].acts[0].beats[0].name").value("Hook"))
            .andExpect(jsonPath("$[1].acts[0].beats[0].position").value(0.01))
    }
}
