export enum EntityType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  ORGANIZATION = 'ORGANIZATION',
  SPECIES = 'SPECIES',
  CULTURE = 'CULTURE',
  ITEM = 'ITEM',
  CUSTOM = 'CUSTOM'
}

/** Unified structure for linking entities */
export interface EntityLink {
  targetId: number;
  label?: string;
  metadata?: Record<string, any>;
}

/** Generic numerical value with units */
export interface Quantity {
  value?: number;
  unit?: string;
  label?: string;
}

// --- Narrative Sub-types ---

export interface MotivationData {
  externalGoal?: string;
  internalNeed?: string;
  justification?: string;
}

export interface CharacterArc {
  type?: string;
  theme?: string;
  moralChoice?: string;
}

export interface OpinionLink {
  entity: EntityLink;
  opinion?: string;
  stance?: string;
}

export interface CulturalLens {
  entity: EntityLink;
  opinion?: string;
}

// --- Component Data Definitions ---

export interface BioData {
  status?: string;
  age: Quantity;
  gender?: string;
  sex?: string;
  role?: string;
  condition?: string;
}

export interface AppearanceData {
  physicalFeatures?: string;
  clothingStyle?: string;
  distinguishingMarks?: string;
  skinAndMarkings?: string;
  height: Quantity;
  weight: Quantity;
}

export interface PsychologyData {
  motivations: MotivationData;
  arc: CharacterArc;
  positiveTraits: string[];
  negativeTraits: string[];
  quirks: string[];
  mannerisms?: string;
  perspective?: string;
}

export interface SocialData {
  occupations: string[];
  hobbies: string[];
  skills: string[];
  talents: string[];
  sociology?: string;
  affiliations?: string;
}

export interface HistoryData {
  backstory?: string;
  journey?: string;
}

export interface CharacterRelationsData {
  birthplace?: EntityLink;
  residence?: EntityLink;
  leaderOf: EntityLink[];
  memberOf: EntityLink[];
  owns: EntityLink[];
  species?: EntityLink;
  culture?: EntityLink;
}

export interface OriginsData {
  birthplace?: EntityLink;
  residence?: EntityLink;
  species?: EntityLink;
  culture?: EntityLink;
}

export interface OrganizationData {
  population: Quantity;
  agenda?: string;
  powerStructure?: string;
  laws?: string;
  internalCulture?: string;
  diplomacy?: string;
  products: string[];
  assets?: string;
}

export interface OrgRelationsData {
  parentOrg?: EntityLink;
  subsidiaries: EntityLink[];
  leaders: EntityLink[];
  members: EntityLink[];
  operatingLocations: EntityLink[];
  affiliatedSpecies: EntityLink[];
  culture?: EntityLink;
  ownedItems: EntityLink[];
}

export interface CultureData {
  language?: string;
  population?: string;
  values?: string;
  rituals?: string;
  mythos?: string;
  expression?: string;
  history?: string;
}

export interface CultureRelationsData {
  locations: EntityLink[];
  leaders: EntityLink[];
  members: EntityLink[];
  parentCulture?: EntityLink;
  derivatives: EntityLink[];
  species: EntityLink[];
  affiliatedOrgs: EntityLink[];
  ownedItems: EntityLink[];
}

export interface SpeciesData {
  pluralName?: string;
  scientificName?: string;
  isSapient: boolean;
  lifespan: Quantity;
  anatomy?: string;
  uniqueAbilities?: string;
  reproduction?: string;
  habitat?: string;
  diet?: string;
  origins?: string;
}

export interface SpeciesRelationsData {
  locations: EntityLink[];
  ancestors: EntityLink[];
  subspecies: EntityLink[];
  affiliatedOrgs: EntityLink[];
  ownedItems: EntityLink[];
  culture?: EntityLink;
}

export interface LocationData {
  population: Quantity;
  geology?: string;
  ecology?: string;
  economy?: string;
  demographics?: string;
  energy?: string;
  security?: string;
  history?: string;
}

export interface LocationRelationsData {
  parentLocation?: EntityLink;
  species: EntityLink[];
  cultures: EntityLink[];
  bornHere: EntityLink[];
  residents: EntityLink[];
  items: EntityLink[];
  organizations: EntityLink[];
}

export interface ItemData {
  rarity?: string;
  material?: string;
  condition?: string;
  weight: Quantity;
  value: Quantity;
  properties: string[];
  history?: string;
}

export interface ItemRelationsData {
  currentLocation?: EntityLink;
  owners: EntityLink[];
}

export interface PerspectiveData {
  views: OpinionLink[];
}

export enum ComponentType {
  BIO = 'BIO',
  APPEARANCE = 'APPEARANCE',
  PSYCHOLOGY = 'PSYCHOLOGY',
  SOCIAL = 'SOCIAL',
  HISTORY = 'HISTORY',
  CHARACTER_RELATIONS = 'CHARACTER_RELATIONS',
  ORGANIZATION = 'ORGANIZATION',
  ORG_RELATIONS = 'ORG_RELATIONS',
  ORIGINS = 'ORIGINS',
  CULTURE = 'CULTURE',
  CULTURE_RELATIONS = 'CULTURE_RELATIONS',
  SPECIES = 'SPECIES',
  SPECIES_RELATIONS = 'SPECIES_RELATIONS',
  LOCATION = 'LOCATION',
  LOCATION_RELATIONS = 'LOCATION_RELATIONS',
  ITEM = 'ITEM',
  ITEM_RELATIONS = 'ITEM_RELATIONS',
  PERSPECTIVES = 'PERSPECTIVES',
  CUSTOM = 'CUSTOM'
}

// --- Component Union Type ---

export type EntityComponent = 
  | { id: string; type: ComponentType.BIO; data: BioData }
  | { id: string; type: ComponentType.APPEARANCE; data: AppearanceData }
  | { id: string; type: ComponentType.PSYCHOLOGY; data: PsychologyData }
  | { id: string; type: ComponentType.SOCIAL; data: SocialData }
  | { id: string; type: ComponentType.HISTORY; data: HistoryData }
  | { id: string; type: ComponentType.CHARACTER_RELATIONS; data: CharacterRelationsData }
  | { id: string; type: ComponentType.ORGANIZATION; data: OrganizationData }
  | { id: string; type: ComponentType.ORG_RELATIONS; data: OrgRelationsData }
  | { id: string; type: ComponentType.ORIGINS; data: OriginsData }
  | { id: string; type: ComponentType.CULTURE; data: CultureData }
  | { id: string; type: ComponentType.CULTURE_RELATIONS; data: CultureRelationsData }
  | { id: string; type: ComponentType.SPECIES; data: SpeciesData }
  | { id: string; type: ComponentType.SPECIES_RELATIONS; data: SpeciesRelationsData }
  | { id: string; type: ComponentType.LOCATION; data: LocationData }
  | { id: string; type: ComponentType.LOCATION_RELATIONS; data: LocationRelationsData }
  | { id: string; type: ComponentType.ITEM; data: ItemData }
  | { id: string; type: ComponentType.ITEM_RELATIONS; data: ItemRelationsData }
  | { id: string; type: ComponentType.PERSPECTIVES; data: PerspectiveData }
  | { id: string; type: ComponentType.CUSTOM; data: Record<string, any> };

export interface EntityMetadata {
  components: EntityComponent[];
}

export interface Entity {
  id: number;
  projectId: number;
  type: EntityType;
  name: string;
  category?: string;
  summary?: string;
  description?: string;
  notes?: string;
  tags: string[];
  imageUrl?: string;
  metadata?: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityRequest {
  type: EntityType;
  name: string;
  category?: string;
  summary?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  metadata?: EntityMetadata;
}

export interface UpdateEntityRequest {
  type?: EntityType;
  name?: string;
  category?: string;
  summary?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  metadata?: EntityMetadata;
}

export interface EntityFilters {
  type?: EntityType;
  tags?: string[];
  search?: string;
}
