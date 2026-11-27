-- MYT-96: the story behind Plan and Write. A project's prose is a tree of acts → chapters → scenes;
-- acts come from a structure and carry its beats. See docs/story-model.md and docs/terminology.md.
--
-- Every level is ordered by `position` within its parent and soft-deleted like codex entries.

CREATE TABLE story_acts (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    project_id UUID NOT NULL,
    position INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    -- The built-in structure this act was created from (e.g. "three-act"); provenance only.
    structure_id VARCHAR(64),
    -- Planning prompts: [{ id, name, hint, position }], position = expected place in the story, 0..1.
    beats JSONB NOT NULL DEFAULT '[]',
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_story_act_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_story_acts_project ON story_acts (project_id, position);

CREATE TABLE story_chapters (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    act_id UUID NOT NULL,
    position INTEGER NOT NULL,
    title VARCHAR(255),
    summary TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_story_chapter_act FOREIGN KEY (act_id) REFERENCES story_acts(id) ON DELETE CASCADE
);

CREATE INDEX idx_story_chapters_act ON story_chapters (act_id, position);

CREATE TABLE story_scenes (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    chapter_id UUID NOT NULL,
    position INTEGER NOT NULL,
    title VARCHAR(255),
    -- The prose, as Markdown.
    content TEXT NOT NULL DEFAULT '',
    word_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    -- Scene Card: what the scene does and who and where it involves.
    summary TEXT,
    goal TEXT,
    pov_entry_id UUID,
    location_entry_id UUID,
    character_ids UUID[] NOT NULL DEFAULT '{}',
    -- A beat id from the scene's act (beats live in story_acts.beats, so no foreign key).
    beat_id UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_story_scene_chapter FOREIGN KEY (chapter_id) REFERENCES story_chapters(id) ON DELETE CASCADE,
    -- Entries are soft-deleted in practice; a hard delete clears the link rather than the scene.
    CONSTRAINT fk_story_scene_pov FOREIGN KEY (pov_entry_id) REFERENCES codex_entries(id) ON DELETE SET NULL,
    CONSTRAINT fk_story_scene_location FOREIGN KEY (location_entry_id) REFERENCES codex_entries(id) ON DELETE SET NULL,
    CONSTRAINT chk_story_scene_status CHECK (status IN ('DRAFT', 'REVISED', 'DONE'))
);

CREATE INDEX idx_story_scenes_chapter ON story_scenes (chapter_id, position);
