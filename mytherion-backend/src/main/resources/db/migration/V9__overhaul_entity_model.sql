-- 1. Create scalable Category table
CREATE SEQUENCE IF NOT EXISTS category_id_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE categories (
    id BIGINT NOT NULL DEFAULT nextval('category_id_seq'),
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT fk_categories_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Unique index to prevent duplicate category names per project
CREATE UNIQUE INDEX idx_categories_project_name ON categories (project_id, LOWER(name));

-- 2. Modify Entities table
ALTER TABLE entities RENAME COLUMN image_url TO thumbnail;

-- Drop obsolete summary column
ALTER TABLE entities DROP COLUMN summary;

-- Add version column for optimistic locking
ALTER TABLE entities ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Replace string category with a foreign key
ALTER TABLE entities DROP COLUMN category;
ALTER TABLE entities ADD COLUMN category_id BIGINT;
ALTER TABLE entities ADD CONSTRAINT fk_entities_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
