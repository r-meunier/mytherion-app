package io.mytherion.platform.storage

import io.minio.*
import io.mytherion.platform.monitoring.MetricsService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.concurrent.TimeUnit

/**
 * MinIO implementation of StorageService. Files go into one bucket (`minio.bucket-name`); a file
 * reference is `<bucket>/<object key>`. References naming another bucket are still read and deleted,
 * so files stored before a bucket rename keep working.
 *
 * Can be easily swapped for S3StorageService in production.
 */
@Service
class MinIOStorageService(
    @Value("\${minio.endpoint}") private val endpoint: String,
    @Value("\${minio.access-key}") private val accessKey: String,
    @Value("\${minio.secret-key}") private val secretKey: String,
    @Value("\${minio.bucket-name}") private val bucketName: String,
    private val metricsService: MetricsService
) : StorageService {

    private val logger = LoggerFactory.getLogger(MinIOStorageService::class.java)

    private val minioClient: MinioClient = MinioClient.builder()
        .endpoint(endpoint)
        .credentials(accessKey, secretKey)
        .build()

    init {
        logger.info("MinIO storage service initialized with endpoint: $endpoint")
    }

    /** A file reference split into its bucket and object key. */
    private class Location(val bucket: String, val objectKey: String)

    private fun locate(fileReference: String): Location {
        val bucket = fileReference.substringBefore('/', "")
        val objectKey = fileReference.substringAfter('/', "")
        if (bucket.isEmpty() || objectKey.isEmpty()) {
            throw StorageException("Not a stored file reference: $fileReference")
        }
        return Location(bucket, objectKey)
    }

    override fun uploadFile(
        objectKey: String,
        inputStream: InputStream,
        contentType: String,
        size: Long
    ): String {
        val startTime = System.currentTimeMillis()
        var success = false
        try {
            ensureBucketExists()

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(objectKey)
                    .stream(inputStream, size, -1)
                    .contentType(contentType)
                    .build()
            )

            logger.info("Uploaded file: $bucketName/$objectKey")
            success = true
            return "$bucketName/$objectKey"
        } catch (e: Exception) {
            logger.error("Failed to upload file: $bucketName/$objectKey", e)
            throw StorageException("Failed to upload file", e)
        } finally {
            val duration = System.currentTimeMillis() - startTime
            metricsService.recordStorageUpload(
                bucket = bucketName,
                sizeBytes = size,
                durationMs = duration,
                success = success
            )
        }
    }

    override fun downloadFile(fileReference: String): StoredFile {
        val location = locate(fileReference)
        try {
            return minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(location.bucket)
                    .`object`(location.objectKey)
                    .build()
            ).use { StoredFile(it.readBytes(), it.headers()["Content-Type"]) }
        } catch (e: Exception) {
            logger.error("Failed to download file: $fileReference", e)
            throw StorageException("Failed to download file", e)
        }
    }

    override fun deleteFile(fileReference: String) {
        val location = locate(fileReference)
        val startTime = System.currentTimeMillis()
        var success = false
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(location.bucket)
                    .`object`(location.objectKey)
                    .build()
            )
            logger.info("Deleted file: $fileReference")
            success = true
        } catch (e: Exception) {
            logger.error("Failed to delete file: $fileReference", e)
            throw StorageException("Failed to delete file", e)
        } finally {
            val duration = System.currentTimeMillis() - startTime
            metricsService.recordStorageDelete(
                bucket = location.bucket,
                durationMs = duration,
                success = success
            )
        }
    }

    override fun getPresignedUrl(fileReference: String, expirySeconds: Int): String {
        val location = locate(fileReference)
        val startTime = System.currentTimeMillis()
        var success = false
        try {
            val url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Http.Method.GET)
                    .bucket(location.bucket)
                    .`object`(location.objectKey)
                    .expiry(expirySeconds, TimeUnit.SECONDS)
                    .build()
            )
            success = true
            return url
        } catch (e: Exception) {
            logger.error("Failed to generate presigned URL: $fileReference", e)
            throw StorageException("Failed to generate presigned URL", e)
        } finally {
            val duration = System.currentTimeMillis() - startTime
            metricsService.recordStoragePresign(
                bucket = location.bucket,
                durationMs = duration,
                success = success
            )
        }
    }

    /** Creates the bucket on first use, readable by anyone so browser `<img>` tags can fetch images. */
    private fun ensureBucketExists() {
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
                // Set public read policy for uploads bucket so browser <img> tags can fetch images directly
                val publicReadPolicy = """
                    {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {"AWS": ["*"]},
                                "Action": ["s3:GetObject"],
                                "Resource": ["arn:aws:s3:::$bucketName/*"]
                            }
                        ]
                    }
                """.trimIndent()
                minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                        .bucket(bucketName)
                        .config(publicReadPolicy)
                        .build()
                )
                logger.info("Created bucket with public read policy: $bucketName")
            }
        } catch (e: Exception) {
            logger.error("Failed to ensure bucket exists: $bucketName", e)
            throw StorageException("Failed to ensure bucket exists", e)
        }
    }
}
