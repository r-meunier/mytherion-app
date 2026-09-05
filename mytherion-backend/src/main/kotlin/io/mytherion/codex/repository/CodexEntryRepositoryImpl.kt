package io.mytherion.codex.repository

import io.mytherion.codex.model.CodexEntry
import io.mytherion.codex.model.EntryType
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository

import java.util.UUID

@Repository
class CodexEntryRepositoryImpl : CodexEntryRepositoryCustom {

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    override fun searchEntries(
        projectId: UUID,
        type: EntryType?,
        tags: List<String>?,
        search: String?,
        pageable: Pageable
    ): Page<CodexEntry> {
        val whereClauses = mutableListOf("e.project_id = :projectId", "e.deleted_at IS NULL")
        val parameters = mutableMapOf<String, Any>("projectId" to projectId)

        type?.let {
            whereClauses.add("e.type = :type")
            parameters["type"] = it.name
        }

        if (!tags.isNullOrEmpty()) {
            whereClauses.add("e.tags && cast(:tags as text[])")
            parameters["tags"] = tags.toTypedArray()
        }

        if (!search.isNullOrBlank()) {
            whereClauses.add("(e.name ILIKE :search OR e.description ILIKE :search OR e.notes ILIKE :search)")
            parameters["search"] = "%${search}%"
        }

        val whereString = "WHERE " + whereClauses.joinToString(" AND ")
        
        // Sorting
        val orderClauses = pageable.sort.map { 
            val property = when(it.property) {
                "createdAt" -> "created_at"
                "updatedAt" -> "updated_at"
                else -> it.property
            }
            "e.${property} ${it.direction.name}" 
        }.joinToString(", ")
        
        val orderByString = if (orderClauses.isNotEmpty()) "ORDER BY $orderClauses, e.id DESC" else "ORDER BY e.created_at DESC, e.id DESC"

        val querySql = "SELECT * FROM codex_entries e $whereString $orderByString"
        val countSql = "SELECT COUNT(*) FROM codex_entries e $whereString"

        val query = entityManager.createNativeQuery(querySql, CodexEntry::class.java)
        val countQuery = entityManager.createNativeQuery(countSql)

        parameters.forEach { (key, value) ->
            query.setParameter(key, value)
            countQuery.setParameter(key, value)
        }

        query.firstResult = pageable.offset.toInt()
        query.maxResults = pageable.pageSize

        @Suppress("UNCHECKED_CAST")
        val content = query.resultList as List<CodexEntry>
        val total = (countQuery.singleResult as Number).toLong()

        return PageImpl(content, pageable, total)
    }
}
