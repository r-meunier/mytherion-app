-- Mytherion initial schema.
--
-- Squashed from the previous V1 + V2 as part of MYT-81 (canonical terminology).
-- Renames `entities` to `codex_entries`, drops the `categories` table and the
-- `entities.category_id` column, and renames `metadata` to `content`.
-- See docs/terminology.md.

CREATE TABLE users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    CONSTRAINT fk_email_verification_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(255),
    settings JSONB,
    owner UUID NOT NULL,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_project_owner FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE codex_entries (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    project_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    tags TEXT[],
    thumbnail TEXT,
    content JSONB,
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_codex_entry_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

CREATE INDEX idx_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_expires ON email_verification_tokens(expires_at);

CREATE INDEX idx_project_name_lower ON projects (LOWER(name));
CREATE INDEX idx_projects_user_id ON projects(owner);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_owner_deleted_at ON projects(owner, deleted_at);

CREATE INDEX idx_codex_entries_project_id ON codex_entries(project_id);
CREATE INDEX idx_codex_entries_type ON codex_entries(type);
CREATE INDEX idx_codex_entries_deleted_at ON codex_entries(deleted_at);
CREATE INDEX idx_codex_entries_tags ON codex_entries USING GIN(tags);
CREATE INDEX idx_codex_entries_project_deleted_at ON codex_entries(project_id, deleted_at);
