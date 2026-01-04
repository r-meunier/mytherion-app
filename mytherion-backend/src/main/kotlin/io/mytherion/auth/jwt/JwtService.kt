package io.mytherion.auth.jwt

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.Date

@Service
class JwtService(
    @Value("\${app.security.jwt.secret}") private val secret: String,
    @Value("\${app.security.jwt.access-token-minutes}") private val accessTokenMinutes: Long
) {
    private val key = Keys.hmacShaKeyFor(secret.toByteArray(StandardCharsets.UTF_8))

    fun generateAccessToken(userId: Long, email: String, role: String): String {
        val now = Instant.now()
        val exp = now.plusSeconds(accessTokenMinutes * 60)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(exp))
            .signWith(key)
            .compact()
    }

    fun parseAndValidate(token: String) =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload
}
