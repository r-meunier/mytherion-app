-- MYT-86: other names for a codex entry, stored like tags.
ALTER TABLE codex_entries ADD COLUMN aliases TEXT[];
