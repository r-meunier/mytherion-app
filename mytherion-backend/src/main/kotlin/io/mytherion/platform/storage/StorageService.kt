package io.mytherion.platform.storage

import java.io.InputStream

/**
 * Provider-agnostic file storage. Can be implemented with MinIO, S3, or any other object storage
 * provider; where files live (bucket, container, region) is the implementation's configuration, so
 * callers never name it.
 *
 * A stored file is identified by its **file reference**: the opaque string [uploadFile] returns. Callers
 * keep it (e.g. as an entry's `thumbnail`) and pass it back to read, link or delete the file.
 *
 * Every method throws [StorageException] when the provider fails or the reference isn't one of its own.
 */
interface StorageService {

    /**
     * Store a file.
     * @param objectKey Where to store it, e.g. `entries/<id>/<timestamp>_<name>`
     * @param inputStream The file content
     * @param contentType The MIME type, kept with the file
     * @param size The file size in bytes
     * @return The file reference
     */
    fun uploadFile(objectKey: String, inputStream: InputStream, contentType: String, size: Long): String

    /** Delete a stored file. */
    fun deleteFile(fileReference: String)

    /**
     * Read a stored file in full. Meant for small files, such as entry images (uploads are capped).
     * @return The file's bytes and the content type it was stored with
     */
    fun downloadFile(fileReference: String): StoredFile

    /** A URL that gives temporary read access to a stored file (default 1 hour). */
    fun getPresignedUrl(fileReference: String, expirySeconds: Int = 3600): String
}

/** A file read back from storage. [contentType] is null when the provider didn't record one. */
class StoredFile(val bytes: ByteArray, val contentType: String?)

/** A storage operation failed, or was given a reference that isn't a stored file. */
class StorageException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
