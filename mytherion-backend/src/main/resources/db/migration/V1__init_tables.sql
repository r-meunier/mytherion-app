CREATE TABLE users (
    id              BIGSERIAL,
    username        VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(50)     NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE projects (
    id              BIGSERIAL,
    owner           BIGINT          NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE entries (
    id              BIGSERIAL,
    project_id      BIGINT          NOT NULL,
    type            VARCHAR(50)     NOT NULL, -- CHARACTER, ORG, LOCATION, ITEM, SPECIES, CULTURE
    title           VARCHAR(255)    NOT NULL,
    summary         TEXT,
    body            TEXT,
    tags            TEXT, -- simple comma-separated for now
    image_url       TEXT,
    metadata        JSONB,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user_id ON projects(owner);
CREATE INDEX idx_entities_project_id ON entries(project_id);
CREATE INDEX idx_entities_type ON entries(type);

CREATE SEQUENCE user_id_seq START 1 INCREMENT 50;
CREATE SEQUENCE project_id_seq START 1 INCREMENT 50;
CREATE SEQUENCE entry_id_seq START 1 INCREMENT 50;