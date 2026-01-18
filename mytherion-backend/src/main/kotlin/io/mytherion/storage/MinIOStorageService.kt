package io.mytherion.storage

import io.minio.*
import io.minio.http.Method
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.concurrent.TimeUnit

/**
 * MinIO implementation of StorageService.
 * Can be easily swapped for S3StorageService in production.
 */
@Service
class MinIOStorageService(
    @Value("\${minio.endpoint}") private val endpoint: String,
    @Value("\${minio.access-key}") private val accessKey: String,
    @Value("\${minio.secret-key}") private val secretKey: String,
    @Value("\${minio.bucket-name:mytherion-uploads}") private val defaultBucket: String
) : StorageService {
    
    private val logger = LoggerFactory.getLogger(MinIOStorageService::class.java)
    
    private val minioClient: MinioClient = MinioClient.builder()
        .endpoint(endpoint)
        .credentials(accessKey, secretKey)
        .build()
    
    init {
        // Ensure default bucket exists on startup
        ensureBucketExists(defaultBucket)
        logger.info("MinIO storage service initialized with endpoint: $endpoint")
    }
    
    override fun uploadFile(
        bucketName: String,
        objectName: String,
        inputStream: InputStream,
        contentType: String,
        size: Long
    ): String {
        try {
            ensureBucketExists(bucketName)
            
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .stream(inputStream, size, -1)
                    .contentType(contentType)
                    .build()
            )
            
            logger.info("Uploaded file: $bucketName/$objectName")
            return "$bucketName/$objectName"
        } catch (e: Exception) {
            logger.error("Failed to upload file: $bucketName/$objectName", e)
            throw StorageException("Failed to upload file", e)
        }
    }
    
    override fun deleteFile(bucketName: String, objectName: String) {
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .build()
            )
            logger.info("Deleted file: $bucketName/$objectName")
        } catch (e: Exception) {
            logger.error("Failed to delete file: $bucketName/$objectName", e)
            throw StorageException("Failed to delete file", e)
        }
    }
    
    override fun getPresignedUrl(
        bucketName: String,
        objectName: String,
        expirySeconds: Int
    ): String {
        try {
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .expiry(expirySeconds, TimeUnit.SECONDS)
                    .build()
            )
        } catch (e: Exception) {
            logger.error("Failed to generate presigned URL: $bucketName/$objectName", e)
            throw StorageException("Failed to generate presigned URL", e)
        }
    }
    
    override fun ensureBucketExists(bucketName: String) {
        try {
            val exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build()
            )
            
            if (!exists) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build()
                )
                logger.info("Created bucket: $bucketName")
            }
        } catch (e: Exception) {
            logger.error("Failed to ensure bucket exists: $bucketName", e)
            throw StorageException("Failed to ensure bucket exists", e)
        }
    }
}

/**
 * Custom exception for storage operations
 */
class StorageException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
