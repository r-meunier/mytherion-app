package io.mytherion.email

import jakarta.mail.internet.MimeMessage
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

    fun sendVerificationEmail(email: String, username: String, token: String) {
        val verificationLink = "$frontendUrl/verify-email?token=$token"

        val message: MimeMessage = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true, "UTF-8")

        helper.setFrom(fromEmail)
        helper.setTo(email)
        helper.setSubject("Verify Your Email - Mytherion")
        helper.setText(buildVerificationEmailHtml(username, verificationLink), true)

        mailSender.send(message)
    }

    private fun buildVerificationEmailHtml(username: String, link: String): String {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 600;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 15px auto;
                        display: block;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .content p {
                        margin: 0 0 20px 0;
                        font-size: 16px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 600;
                        color: #7c3aed;
                        margin-bottom: 20px;
                    }
                    .button-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
                        color: white;
                        padding: 14px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
                    }
                    .button:hover {
                        box-shadow: 0 6px 8px rgba(124, 58, 237, 0.4);
                    }
                    .link-box {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 6px;
                        padding: 15px;
                        margin: 20px 0;
                        word-break: break-all;
                        font-size: 14px;
                        color: #6c757d;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px 30px;
                        text-align: center;
                        font-size: 14px;
                        color: #6c757d;
                        border-top: 1px solid #e9ecef;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .warning p {
                        margin: 0;
                        color: #856404;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="data:image/png;base64,$logoBase64" alt="Mytherion Logo" class="logo" />
                        <h1>Welcome to Mytherion!</h1>
                    </div>
                    <div class="content">
                        <p class="greeting">Hello, $username! 👋</p>
                        <p>Thank you for registering with Mytherion. To complete your registration and start using your account, please verify your email address.</p>
                        
                        <div class="button-container">
                            <a href="$link" class="button">Verify Email Address</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <div class="link-box">$link</div>
                        
                        <div class="warning">
                            <p><strong>⏱️ This link will expire in 24 hours.</strong></p>
                        </div>
                        
                        <p>If you didn't create an account with Mytherion, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${java.time.Year.now().value} Mytherion. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        """.trimIndent()
    }
}
