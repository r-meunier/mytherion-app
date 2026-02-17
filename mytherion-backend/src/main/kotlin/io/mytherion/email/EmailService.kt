package io.mytherion.email

import jakarta.mail.internet.MimeMessage
import java.time.Year
import java.util.Base64
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ClassPathResource
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class EmailService(
        private val mailSender: JavaMailSender,
        @Value("\${app.frontend.url}") private val frontendUrl: String,
        @Value("\${app.email.from}") private val fromEmail: String
) {
    private val logoBase64: String by lazy {
        try {
            val resource = ClassPathResource("static/images/mytherion_logo.png")
            val bytes = resource.inputStream.readBytes()
            Base64.getEncoder().encodeToString(bytes)
        } catch (e: Exception) {
            "" // Fallback to empty if logo not found
        }
    }

    /**
     * Load an email template from resources/templates/email/
     * @param templateName Name of the template file (without .html extension)
     * @return The template content as a string
     */
    private fun loadTemplate(templateName: String): String {
        return try {
            val resource = ClassPathResource("templates/email/$templateName.html")
            resource.inputStream.bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            throw IllegalStateException("Failed to load email template: $templateName", e)
        }
    }

    /**
     * Replace placeholders in template with actual values Placeholders are in the format
     * {{placeholderName}}
     */
    private fun processTemplate(template: String, variables: Map<String, String>): String {
        var processed = template
        variables.forEach { (key, value) -> processed = processed.replace("{{$key}}", value) }
        return processed
    }

    fun sendVerificationEmail(email: String, username: String, token: String) {
        val verificationLink = "$frontendUrl/verify-email?token=$token"

        val template = loadTemplate("verification")
        val html =
                processTemplate(
                        template,
                        mapOf(
                                "username" to username,
                                "verificationLink" to verificationLink,
                                "logoBase64" to logoBase64,
                                "currentYear" to Year.now().value.toString()
                        )
                )

        val message: MimeMessage = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true, "UTF-8")

        helper.setFrom(fromEmail)
        helper.setTo(email)
        helper.setSubject("Verify Your Email - Mytherion")
        helper.setText(html, true)

        mailSender.send(message)
    }
}
