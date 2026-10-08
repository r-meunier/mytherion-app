package io.mytherion.codex.rest

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mytherion.auth.jwt.JwtAuthFilter
import io.mytherion.auth.jwt.JwtService
import io.mytherion.auth.util.CookieUtil
import io.mytherion.codex.model.ContextRole
import io.mytherion.codex.model.EntryTemplate
import io.mytherion.codex.model.EntryType
import io.mytherion.codex.model.TemplateDetail
import io.mytherion.codex.model.TemplateLevel
import io.mytherion.codex.service.EntryTemplateService
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

@WebMvcTest(EntryTemplateController::class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = ["app.security.allowed-origins=http://localhost:3000"])
class EntryTemplateControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockkBean
    private lateinit var templateService: EntryTemplateService

    @MockkBean
    private lateinit var jwtService: JwtService

    @MockkBean
    private lateinit var cookieUtil: CookieUtil

    @MockkBean
    private lateinit var jwtAuthFilter: JwtAuthFilter

    @MockkBean
    private lateinit var projectAccessInterceptor: io.mytherion.project.security.ProjectAccessInterceptor

    @MockkBean
    private lateinit var performanceInterceptor: io.mytherion.platform.monitoring.PerformanceInterceptor

    @MockkBean
    private lateinit var projectRepository: io.mytherion.project.repository.ProjectRepository

    @MockkBean
    private lateinit var currentUserProvider: io.mytherion.auth.service.CurrentUserProvider

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
    fun `listTemplates returns the templates for the requested type`() {
        every { templateService.templatesFor(EntryType.CHARACTER) } returns listOf(
            EntryTemplate("character-blank", EntryType.CHARACTER, TemplateLevel.BLANK, "Blank"),
            EntryTemplate(
                "character-basic", EntryType.CHARACTER, TemplateLevel.BASIC, "Basic",
                details = listOf(TemplateDetail("Voice", "How do they talk?", ContextRole.VOICE))
            )
        )

        mockMvc.perform(get("/api/codex/templates").param("type", "CHARACTER"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value("character-blank"))
            .andExpect(jsonPath("$[1].level").value("BASIC"))
            .andExpect(jsonPath("$[1].details[0].label").value("Voice"))
            .andExpect(jsonPath("$[1].details[0].role").value("VOICE"))
    }

    @Test
    fun `listTemplates rejects an unknown entry type with 400`() {
        mockMvc.perform(get("/api/codex/templates").param("type", "DRAGON"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
    }
}
