CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE entities (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL, -- CHARACTER, ORG, LOCATION, ITEM, SPECIES, CULTURE
    title           VARCHAR(255) NOT NULL,
    summary         TEXT,
    body            TEXT,
    tags            TEXT, -- simple comma-separated for now
    image_url       TEXT,
    metadata        JSONB,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_entities_project_id ON entities(project_id);
CREATE INDEX idx_entities_type ON entities(type);
