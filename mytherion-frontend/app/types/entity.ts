export enum EntityType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  ORGANIZATION = 'ORGANIZATION',
  SPECIES = 'SPECIES',
  CULTURE = 'CULTURE',
  ITEM = 'ITEM',
  CUSTOM = 'CUSTOM'
}

export interface EntityComponent {
  type: string;
  data: Record<string, any>;
}

export interface EntityMetadata {
  components: EntityComponent[];
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
  metadata?: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityRequest {
  type: EntityType;
  name: string;
  summary?: string;
  description?: string;
  tags?: string[];
  metadata?: EntityMetadata;
}

export interface UpdateEntityRequest {
  type?: EntityType;
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  metadata?: EntityMetadata;
}

export interface EntityFilters {
  type?: EntityType;
  tags?: string[];
  search?: string;
}
