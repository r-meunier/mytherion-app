# Semantic Entity Component System - Implementation Plan

> **Historical record.** Vocabulary predates [`terminology.md`](../../docs/terminology.md):
> "Entity" = Codex Entry, "Component" = Entry Section, "World" = Project.
> Category was removed in MYT-81.


## 1. Core Architecture (Current State)

The Mytherion entity system uses a **Semantic Component Architecture**. Entities are thin containers, and all domain-specific data is stored in modular, polymorphic components within a JSONB `metadata` column.

### 1.1. Universal Entity Structure

- [x] **Base Info**: ID, Type, Name, Summary, Description.
- [x] **Structural**: `category` (e.g., "Protagonist").
- [x] **Scratchpad**: `notes` (internal/private text).
- [x] **Filtering**: `tags` (Native PostgreSQL string array).
- [x] **Metadata**: A collection of typed **Components**.

### 1.2. The Relationship System (Unified Links)

- [x] **EntityLink**: Unified structure for all connections.
- [x] **Semantic Fields**: Using `EntityLink` for specific roles (Birthplace, ParentOrg, etc.).

---

## 2. Component Taxonomy (Implemented)

### 2.1. Character Components

- [x] **BIO**: Vitality & Stats (Status, Age, Sex, Height, etc.).
- [x] **APPEARANCE**: Physical description (Features, Clothing, Skin/Markings).
- [x] **PSYCHOLOGY**: Internal drivers (Motivations, Arc, Traits, Quirks, Mannerisms, Perspective).
- [x] **CHARACTER_RELATIONS**: Birthplace, Residence, LeaderOf, MemberOf, Owns, Species, Culture.
- [x] **SOCIAL**: Occupations, Hobbies, Skills, Sociology, Affiliations.
- [x] **HISTORY**: Backstory and Journey.

### 2.2. Organization, Culture, Species

- [x] **ORGANIZATION**: Agenda, Power Structure, Laws, Diplomacy, Products, Assets.
- [x] **CULTURE**: Language, Values, Rituals, Mythos, Expression, History.
- [x] **SPECIES**: Biology, Taxonomy, Sapience, Lifespan.
- [x] **RELATIONS**: All entities have dedicated semantic relations components.

### 2.3. Locations & Items

- [x] **LOCATION**: Geology, Ecology, Economy, Demographics, Energy, Security, History.
- [x] **LOCATION_RELATIONS**: `parentLocation` hierarchy and Occupant tracking.
- [x] **ITEM**: Rarity, Material, Condition, Weight, Value, Properties, History.
- [x] **ITEM_RELATIONS**: `currentLocation` and `owners`.

---

## 3. Future Roadmap (TODOs)

### 3.1. Advanced Narrative Systems

- [ ] **TIMELINE Component**: Date-stamped events and chronological tracking.
- [ ] **MAGIC/SYSTEM**: Tracking mana, power levels, or ability stats.
- [ ] **COORDINATES**: Map-pin data for visual world-mapping.
- [ ] **DISCOVERY/RESEARCH/INVENTIONS**: Tracking significant milestones, inventions, or researched lore (Discoverer, Date, Impact).

### 3.2. Image Gallery System

- [ ] **GALLERY Component**: List of images with captions, tags, and "Primary" flag.

### 3.3. Technical Enhancements

- [ ] **Schema Registry**: Enforce data types for standard components in the backend.
- [ ] **Graph Querying**: API endpoint to fetch a "Social Web" visualization.
- [ ] **Bidirectional Sync**: Auto-update "MemberOf" in a character when "MemberIds" is updated in an organization.

### 3.4. Deep Narrative Expansion (Post-MVP)

- [ ] **The "Ghost" System**: Wound, Lie, and Fear tracking.
- [ ] **Secrets & Mysteries**: Encrypted or hidden components for intrigue.
- [ ] **Complex Arcs**: Integration with Timeline for dynamic arc tracking.

---

## 4. Future Improvements: Meta-Data Driven UI

To avoid manual updates when adding new components, we could implement a system where:

- **Schema Registry**: The backend provides a `/api/entities/components/schema` endpoint.
- **Dynamic Forms**: The frontend uses this schema to dynamically generate forms (e.g., using a JSON Schema form builder).
- **Single Source of Truth**: This would allow adding components purely by changing the backend models, with the UI adapting automatically.
