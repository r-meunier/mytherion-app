package io.mytherion.storage.dto

/** Response DTO for file upload operations */
data class UploadResponse(
        val url: String,
        val objectKey: String,
        val bucketName: String,
        val contentType: String,
        val size: Long
)
