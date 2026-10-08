export enum EntryType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  ORGANIZATION = 'ORGANIZATION',
  SPECIES = 'SPECIES',
  CULTURE = 'CULTURE',
  ITEM = 'ITEM',
  CUSTOM = 'CUSTOM'
}

/** What a detail is for, so the AI Context Pack can pick it for a scene. Mirrors ContextRole.kt. */
export enum ContextRole {
  IDENTITY = 'IDENTITY',
  APPEARANCE = 'APPEARANCE',
  VOICE = 'VOICE',
  MOTIVATION = 'MOTIVATION',
  BACKSTORY = 'BACKSTORY',
  SENSORY = 'SENSORY',
  CURRENT_STATE = 'CURRENT_STATE'
}

/** How much a template starts with. Mirrors TemplateLevel in EntryTemplate.kt. */
export enum TemplateLevel {
  BLANK = 'BLANK',
  BASIC = 'BASIC',
  FULL = 'FULL'
}

/** One author-controlled label/value pair on an entry. See docs/codex-entry-model.md. */
export interface EntryDetail {
  id: string;
  label: string;
  value?: string | null;
  hint?: string | null;
  role?: ContextRole | null;
}

export interface EntryContent {
  /** Template the entry was created from; provenance only. */
  templateId?: string | null;
  details: EntryDetail[];
}

/** A detail as a template declares it: no id and no value. */
export interface TemplateDetail {
  label: string;
  hint?: string | null;
  role?: ContextRole | null;
}

export interface EntryTemplate {
  id: string;
  entryType: EntryType;
  level: TemplateLevel;
  name: string;
  description?: string | null;
  details: TemplateDetail[];
}

export interface CodexEntry {
  id: string;
  projectId: string;
  type: EntryType;
  name: string;
  description?: string;
  notes?: string;
  tags: string[];
  aliases?: string[] | null;
  thumbnail?: string;
  content?: EntryContent | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryRequest {
  type: EntryType;
  name: string;
  description?: string;
  notes?: string;
  tags?: string[];
  aliases?: string[];
  content?: EntryContent;
}

export interface UpdateEntryRequest {
  type?: EntryType;
  name?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  aliases?: string[];
  content?: EntryContent;
  version?: number;
}

export interface EntryFilters {
  type?: EntryType;
  tags?: string[];
  search?: string;
}
