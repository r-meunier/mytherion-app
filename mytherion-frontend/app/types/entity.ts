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

// --- Component Union Type ---

export type EntityComponent = 
  | { type: 'BIO'; data: BioData }
  | { type: 'APPEARANCE'; data: AppearanceData }
  | { type: 'PSYCHOLOGY'; data: PsychologyData }
  | { type: 'SOCIAL'; data: SocialData }
  | { type: 'HISTORY'; data: HistoryData }
  | { type: 'CHARACTER_RELATIONS'; data: CharacterRelationsData }
  | { type: 'ORGANIZATION'; data: OrganizationData }
  | { type: 'ORG_RELATIONS'; data: OrgRelationsData }
  | { type: 'CULTURE'; data: CultureData }
  | { type: 'CULTURE_RELATIONS'; data: CultureRelationsData }
  | { type: 'SPECIES'; data: SpeciesData }
  | { type: 'SPECIES_RELATIONS'; data: SpeciesRelationsData }
  | { type: 'LOCATION'; data: LocationData }
  | { type: 'LOCATION_RELATIONS'; data: LocationRelationsData }
  | { type: 'ITEM'; data: ItemData }
  | { type: 'ITEM_RELATIONS'; data: ItemRelationsData }
  | { type: 'PERSPECTIVES'; data: PerspectiveData }
  | { type: 'CUSTOM'; data: Record<string, any> };

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
