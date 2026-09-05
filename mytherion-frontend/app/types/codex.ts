export enum EntryType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  ORGANIZATION = 'ORGANIZATION',
  SPECIES = 'SPECIES',
  CULTURE = 'CULTURE',
  ITEM = 'ITEM',
  CUSTOM = 'CUSTOM'
}

/** Unified structure for linking entries */
export interface EntryLink {
  targetId: string;
  label?: string;
  content?: Record<string, any>;
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
  entry: EntryLink;
  opinion?: string;
  stance?: string;
}

export interface CulturalLens {
  entry: EntryLink;
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
  birthplace?: EntryLink;
  residence?: EntryLink;
  leaderOf: EntryLink[];
  memberOf: EntryLink[];
  owns: EntryLink[];
  species?: EntryLink;
  culture?: EntryLink;
}

export interface OriginsData {
  birthplace?: EntryLink;
  residence?: EntryLink;
  species?: EntryLink;
  culture?: EntryLink;
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
  parentOrg?: EntryLink;
  subsidiaries: EntryLink[];
  leaders: EntryLink[];
  members: EntryLink[];
  operatingLocations: EntryLink[];
  affiliatedSpecies: EntryLink[];
  culture?: EntryLink;
  ownedItems: EntryLink[];
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
  locations: EntryLink[];
  leaders: EntryLink[];
  members: EntryLink[];
  parentCulture?: EntryLink;
  derivatives: EntryLink[];
  species: EntryLink[];
  affiliatedOrgs: EntryLink[];
  ownedItems: EntryLink[];
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
  locations: EntryLink[];
  ancestors: EntryLink[];
  subspecies: EntryLink[];
  affiliatedOrgs: EntryLink[];
  ownedItems: EntryLink[];
  culture?: EntryLink;
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
  parentLocation?: EntryLink;
  species: EntryLink[];
  cultures: EntryLink[];
  bornHere: EntryLink[];
  residents: EntryLink[];
  items: EntryLink[];
  organizations: EntryLink[];
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
  currentLocation?: EntryLink;
  owners: EntryLink[];
}

export interface PerspectiveData {
  views: OpinionLink[];
}

export enum SectionType {
  BIO = 'BIO',
  APPEARANCE = 'APPEARANCE',
  PSYCHOLOGY = 'PSYCHOLOGY',
  SOCIAL = 'SOCIAL',
  HISTORY = 'HISTORY',
  CHARACTER_RELATIONS = 'CHARACTER_RELATIONS',
  ORGANIZATION_DETAILS = 'ORGANIZATION_DETAILS',
  ORGANIZATION_RELATIONS = 'ORGANIZATION_RELATIONS',
  ORIGINS = 'ORIGINS',
  CULTURE_DETAILS = 'CULTURE_DETAILS',
  CULTURE_RELATIONS = 'CULTURE_RELATIONS',
  SPECIES_DETAILS = 'SPECIES_DETAILS',
  SPECIES_RELATIONS = 'SPECIES_RELATIONS',
  LOCATION_DETAILS = 'LOCATION_DETAILS',
  LOCATION_RELATIONS = 'LOCATION_RELATIONS',
  ITEM_DETAILS = 'ITEM_DETAILS',
  ITEM_RELATIONS = 'ITEM_RELATIONS',
  PERSPECTIVES = 'PERSPECTIVES',
  CUSTOM_FIELDS = 'CUSTOM_FIELDS'
}

// --- Component Union Type ---

export type EntrySection = 
  | { id: string; type: SectionType.BIO; data: BioData }
  | { id: string; type: SectionType.APPEARANCE; data: AppearanceData }
  | { id: string; type: SectionType.PSYCHOLOGY; data: PsychologyData }
  | { id: string; type: SectionType.SOCIAL; data: SocialData }
  | { id: string; type: SectionType.HISTORY; data: HistoryData }
  | { id: string; type: SectionType.CHARACTER_RELATIONS; data: CharacterRelationsData }
  | { id: string; type: SectionType.ORGANIZATION_DETAILS; data: OrganizationData }
  | { id: string; type: SectionType.ORGANIZATION_RELATIONS; data: OrgRelationsData }
  | { id: string; type: SectionType.ORIGINS; data: OriginsData }
  | { id: string; type: SectionType.CULTURE_DETAILS; data: CultureData }
  | { id: string; type: SectionType.CULTURE_RELATIONS; data: CultureRelationsData }
  | { id: string; type: SectionType.SPECIES_DETAILS; data: SpeciesData }
  | { id: string; type: SectionType.SPECIES_RELATIONS; data: SpeciesRelationsData }
  | { id: string; type: SectionType.LOCATION_DETAILS; data: LocationData }
  | { id: string; type: SectionType.LOCATION_RELATIONS; data: LocationRelationsData }
  | { id: string; type: SectionType.ITEM_DETAILS; data: ItemData }
  | { id: string; type: SectionType.ITEM_RELATIONS; data: ItemRelationsData }
  | { id: string; type: SectionType.PERSPECTIVES; data: PerspectiveData }
  | { id: string; type: SectionType.CUSTOM_FIELDS; data: Record<string, any> };

export interface EntryContent {
  sections: EntrySection[];
}

export interface CodexEntry {
  id: string;
  projectId: string;
  type: EntryType;
  name: string;
  description?: string;
  notes?: string;
  tags: string[];
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
  content?: EntryContent;
}

export interface UpdateEntryRequest {
  type?: EntryType;
  name?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  content?: EntryContent;
  version?: number;
}

export interface EntryFilters {
  type?: EntryType;
  tags?: string[];
  search?: string;
}
