-- V5: Enhance Project model with soft delete and settings
-- Add soft delete and settings JSONB field to projects table

-- Step 1: Add soft delete column
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP;

-- Step 2: Add settings JSONB column
ALTER TABLE projects ADD COLUMN settings JSONB DEFAULT '{}';

-- Step 3: Add index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN projects.settings IS 'JSONB field for project-level settings and configuration';
COMMENT ON COLUMN projects.deleted_at IS 'Soft delete timestamp - NULL means not deleted';
