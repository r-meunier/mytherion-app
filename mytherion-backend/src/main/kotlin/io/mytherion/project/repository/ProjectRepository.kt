package io.mytherion.project.repository

import io.mytherion.project.model.Project
import io.mytherion.user.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface ProjectRepository : JpaRepository<Project, UUID> {
    fun findAllByOwner(owner: User): List<Project>

    @Query("SELECT p FROM Project p JOIN FETCH p.owner WHERE p.owner = :owner")
    fun findAllByOwner(owner: User, pageable: Pageable): Page<Project>

    @Query("""
        SELECT p FROM Project p 
        WHERE p.owner = :owner 
        AND p.deletedAt IS NULL
        AND (:namePattern IS NULL OR LOWER(p.name) LIKE :namePattern ESCAPE '\')
        AND (:genre IS NULL OR p.genre = :genre)
    """)
    fun searchProjects(
        @Param("owner") owner: User, 
        @Param("namePattern") namePattern: String?, 
        @Param("genre") genre: String?, 
        pageable: Pageable
    ): Page<Project>

    @Query("SELECT p FROM Project p JOIN FETCH p.owner WHERE p.id = :id")
    fun findByIdWithOwner(@Param("id") id: UUID): Project?

    @Query("SELECT p FROM Project p JOIN FETCH p.owner WHERE p.id = :id AND p.owner = :owner AND p.deletedAt IS NULL")
    fun findByIdAndOwnerAndDeletedAtIsNullWithOwner(@Param("id") id: UUID, @Param("owner") owner: User): Project?

    fun findAllByOwnerAndDeletedAtIsNull(owner: User, pageable: Pageable): Page<Project>
    fun findByIdAndDeletedAtIsNull(id: UUID): Project?

    fun countByOwnerAndDeletedAtIsNull(owner: User): Long
    
    fun existsByIdAndOwnerAndDeletedAtIsNull(id: UUID, owner: User): Boolean
    
    fun findByIdAndOwnerAndDeletedAtIsNull(id: UUID, owner: User): Project?
}
