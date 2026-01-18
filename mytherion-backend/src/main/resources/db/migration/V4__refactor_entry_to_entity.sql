-- V4: Refactor Entry to Entity with enhancements
-- This migration renames the entries table to entities and adds new features

-- Step 1: Rename the table
ALTER TABLE entries RENAME TO entities;

-- Step 2: Rename the sequence
ALTER SEQUENCE entry_id_seq RENAME TO entity_id_seq;

-- Step 3: Rename columns
ALTER TABLE entities RENAME COLUMN title TO name;
ALTER TABLE entities RENAME COLUMN body TO description;

-- Step 4: Add soft delete column
ALTER TABLE entities ADD COLUMN deleted_at TIMESTAMP;

-- Step 5: Convert tags from text to text array
-- First, create a temporary column
ALTER TABLE entities ADD COLUMN tags_array text[];

-- Update the array column by splitting the old tags string
UPDATE entities 
SET tags_array = string_to_array(tags, ',')
WHERE tags IS NOT NULL AND tags != '';

-- Drop the old tags column and rename the new one
ALTER TABLE entities DROP COLUMN tags;
ALTER TABLE entities RENAME COLUMN tags_array TO tags;

-- Step 6: Drop old indexes if they exist (from entries table)
DROP INDEX IF EXISTS idx_entries_project_id;
DROP INDEX IF EXISTS idx_entries_type;

-- Step 7: Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_project_id ON entities(project_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_deleted_at ON entities(deleted_at);
CREATE INDEX IF NOT EXISTS idx_entities_tags ON entities USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_entities_name_search ON entities USING GIN(to_tsvector('english', name));

-- Step 8: Add comments for documentation
COMMENT ON TABLE entities IS 'Stores all lore entities (characters, locations, organizations, species, cultures, items)';
COMMENT ON COLUMN entities.metadata IS 'JSONB field for type-specific metadata';
COMMENT ON COLUMN entities.tags IS 'Array of tags for filtering and search';
COMMENT ON COLUMN entities.deleted_at IS 'Soft delete timestamp - NULL means not deleted';
