package io.mytherion.storage

import java.io.InputStream

/**
 * Provider-agnostic storage service interface. Can be implemented with MinIO, S3, or any other
 * object storage provider.
 */
interface StorageService {

    /**
     * Upload a file to storage
     * @param bucketName The bucket/container name
     * @param objectName The object key/path
     * @param inputStream The file content
     * @param contentType The MIME type
     * @param size The file size in bytes
     * @return The URL or key of the uploaded object
     */
    fun uploadFile(
            bucketName: String,
            objectName: String,
            inputStream: InputStream,
            contentType: String,
            size: Long
    ): String

    /**
     * Delete a file from storage
     * @param bucketName The bucket/container name
     * @param objectName The object key/path
     */
    fun deleteFile(bucketName: String, objectName: String)

    /**
     * Get a presigned URL for temporary access to an object
     * @param bucketName The bucket/container name
     * @param objectName The object key/path
     * @param expirySeconds How long the URL should be valid (default 1 hour)
     * @return The presigned URL
     */
    fun getPresignedUrl(bucketName: String, objectName: String, expirySeconds: Int = 3600): String

    /**
     * Check if a bucket exists, create it if it doesn't
     * @param bucketName The bucket name to ensure exists
     */
    fun ensureBucketExists(bucketName: String)
}
