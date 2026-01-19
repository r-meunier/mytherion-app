package io.mytherion.project.repository

import io.mytherion.project.model.Project
import io.mytherion.user.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface ProjectRepository : JpaRepository<Project, Long> {
    fun findAllByOwner(owner: User): List<Project>

    @Query("SELECT p FROM Project p JOIN FETCH p.owner WHERE p.owner = :owner")
    fun findAllByOwner(owner: User, pageable: Pageable): Page<Project>

    fun findAllByOwnerAndDeletedAtIsNull(owner: User, pageable: Pageable): Page<Project>
    fun findByIdAndDeletedAtIsNull(id: Long): Project?
}
