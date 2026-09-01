-- Optimization indexes for soft-deletion and project-scoped queries

-- Composite index on entities for project-scoped active entity queries
CREATE INDEX IF NOT EXISTS idx_entities_project_deleted_at ON entities(project_id, deleted_at);

-- Composite index on categories for project-scoped active category queries
CREATE INDEX IF NOT EXISTS idx_categories_project_deleted_at ON categories(project_id, deleted_at);

-- Composite index on projects for user-owned active project queries
CREATE INDEX IF NOT EXISTS idx_projects_owner_deleted_at ON projects(owner, deleted_at);
