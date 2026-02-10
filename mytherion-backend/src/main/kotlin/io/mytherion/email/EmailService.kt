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
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #1e293b;
                        background: #f8fafc;
                        margin: 0;
                        padding: 20px 10px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 4px 24px rgba(168, 85, 247, 0.12);
                        overflow: hidden;
                        border: 2px solid rgba(168, 85, 247, 0.15);
                    }
                    .header {
                        background: linear-gradient(135deg, #f0e7ff 0%, #e0f2fe 100%);
                        padding: 40px 20px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-image: 
                            radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .starfield {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-image: 
                            radial-gradient(1px 1px at 20px 30px, #a855f7, transparent),
                            radial-gradient(1px 1px at 60px 70px, #6366f1, transparent),
                            radial-gradient(1px 1px at 50px 160px, #fbbf24, transparent),
                            radial-gradient(1px 1px at 90px 40px, #a855f7, transparent),
                            radial-gradient(1px 1px at 130px 80px, #6366f1, transparent);
                        background-size: 200px 200px;
                        background-repeat: repeat;
                        opacity: 0.4;
                    }
                    .logo {
                        width: 100px;
                        height: auto;
                        margin: 0 auto 20px auto;
                        display: block;
                        position: relative;
                        z-index: 1;
                        filter: drop-shadow(0 4px 8px rgba(168, 85, 247, 0.2));
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                        font-weight: 800;
                        font-family: 'Outfit', sans-serif;
                        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        position: relative;
                        z-index: 1;
                        letter-spacing: -0.02em;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .content p {
                        margin: 0 0 20px 0;
                        font-size: 16px;
                        color: #475569;
                    }
                    .greeting {
                        font-size: 24px;
                        font-weight: 700;
                        font-family: 'Outfit', sans-serif;
                        color: #1e293b;
                        margin-bottom: 24px;
                    }
                    .greeting .emoji {
                        display: inline-block;
                        margin-left: 4px;
                    }
                    .button-container {
                        text-align: center;
                        margin: 32px 0;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
                        color: #ffffff !important;
                        padding: 16px 40px;
                        text-decoration: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 16px;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
                        font-family: 'Outfit', sans-serif;
                    }
                    .link-box {
                        background: rgba(168, 85, 247, 0.03);
                        border: 1px solid rgba(168, 85, 247, 0.15);
                        border-radius: 10px;
                        padding: 16px;
                        margin: 24px 0;
                        word-break: break-all;
                        font-size: 14px;
                        color: #6366f1;
                        font-family: 'Courier New', monospace;
                    }
                    .link-label {
                        font-size: 14px;
                        color: #64748b;
                        margin-bottom: 8px;
                    }
                    .warning {
                        background: rgba(168, 85, 247, 0.05);
                        border-left: 4px solid #a855f7;
                        padding: 20px;
                        margin: 28px 0;
                        border-radius: 0 8px 8px 0;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .warning-icon {
                        font-size: 24px;
                        flex-shrink: 0;
                    }
                    .warning p {
                        margin: 0;
                        color: #6b21a8;
                        font-weight: 600;
                        font-size: 15px;
                    }
                    .footer {
                        background: linear-gradient(to bottom, transparent, rgba(168, 85, 247, 0.03));
                        padding: 24px 30px;
                        text-align: center;
                        font-size: 13px;
                        color: #94a3b8;
                        border-top: 1px solid rgba(168, 85, 247, 0.1);
                    }
                    .footer p {
                        margin: 8px 0;
                    }
                    .footer-brand {
                        font-weight: 600;
                        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    @media only screen and (max-width: 600px) {
                        body {
                            padding: 10px 5px;
                        }
                        .header h1 {
                            font-size: 26px;
                        }
                        .greeting {
                            font-size: 20px;
                        }
                        .content {
                            padding: 30px 20px;
                        }
                        .button {
                            padding: 14px 32px;
                            font-size: 14px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="starfield"></div>
                        <img src="data:image/png;base64,$logoBase64" alt="Mytherion Logo" class="logo" />
                        <h1>Welcome to Mytherion!</h1>
                    </div>
                    <div class="content">
                        <p class="greeting">Hello, $username! <span class="emoji">👋</span></p>
                        <p>Thank you for registering with <strong>Mytherion</strong>, your comprehensive worldbuilding companion. To complete your registration and start crafting your epic narratives, please verify your email address.</p>
                        
                        <div class="button-container">
                            <a href="$link" class="button">Verify Email Address</a>
                        </div>
                        
                        <p class="link-label">Or copy and paste this link into your browser:</p>
                        <div class="link-box">$link</div>
                        
                        <div class="warning">
                            <div class="warning-icon">⏱️</div>
                            <p>This verification link will expire in 24 hours.</p>
                        </div>
                        
                        <p style="color: #64748b; font-size: 14px;">If you didn't create an account with Mytherion, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${java.time.Year.now().value} <span class="footer-brand">Mytherion</span>. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        """.trimIndent()
    }
}
