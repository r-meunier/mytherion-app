export enum EntityType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  ORGANIZATION = 'ORGANIZATION',
  SPECIES = 'SPECIES',
  CULTURE = 'CULTURE',
  ITEM = 'ITEM'
}

export interface Entity {
  id: number;
  projectId: number;
  type: EntityType;
  name: string;
  summary?: string;
  description?: string;
  tags: string[];
  imageUrl?: string;
  metadata?: string; // JSON string (Phase 5 will parse this)
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityRequest {
  type: EntityType;
  name: string;
  summary?: string;
  description?: string;
  tags?: string[];
  metadata?: string;
}

export interface UpdateEntityRequest {
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  metadata?: string;
}

export interface EntityFilters {
  type?: EntityType;
  tags?: string[];
  search?: string;
}
