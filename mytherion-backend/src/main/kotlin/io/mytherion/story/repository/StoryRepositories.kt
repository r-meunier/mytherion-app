package io.mytherion.story.repository

import io.mytherion.project.model.Project
import io.mytherion.story.model.Act
import io.mytherion.story.model.Chapter
import io.mytherion.story.model.Scene
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

// Deleted rows are filtered by each entity's @SQLRestriction, so plain finders see only live ones.

interface ActRepository : JpaRepository<Act, UUID> {
    fun findAllByProjectOrderByPositionAsc(project: Project): List<Act>
}

interface ChapterRepository : JpaRepository<Chapter, UUID> {
    fun findAllByActInOrderByPositionAsc(acts: Collection<Act>): List<Chapter>
}

interface SceneRepository : JpaRepository<Scene, UUID> {
    fun findAllByChapterInOrderByPositionAsc(chapters: Collection<Chapter>): List<Scene>
}
