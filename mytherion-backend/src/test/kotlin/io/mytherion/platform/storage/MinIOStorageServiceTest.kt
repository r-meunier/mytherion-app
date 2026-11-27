package io.mytherion.platform.storage

import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource

/** File references the service can't place are refused before any call to MinIO (none is running here). */
class MinIOStorageServiceTest {

    private val service = MinIOStorageService(
        endpoint = "http://localhost:1",
        accessKey = "test",
        secretKey = "test",
        bucketName = "mytherion-uploads",
        metricsService = mockk(relaxed = true),
    )

    @ParameterizedTest
    @ValueSource(strings = ["", "no-slash", "/entries/x.png", "mytherion-uploads/"])
    fun `a reference without both a bucket and an object key is refused`(reference: String) {
        val read = assertThrows<StorageException> { service.downloadFile(reference) }
        val delete = assertThrows<StorageException> { service.deleteFile(reference) }

        assertEquals("Not a stored file reference: $reference", read.message)
        assertEquals("Not a stored file reference: $reference", delete.message)
    }
}
