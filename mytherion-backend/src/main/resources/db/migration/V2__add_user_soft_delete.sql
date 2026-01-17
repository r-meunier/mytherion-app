-- Add soft delete support to users table
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- Add index for better query performance when filtering out deleted users
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
