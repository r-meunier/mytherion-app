# {Project Name} MVP

**Notes**: MVP should be... Create Character / Organization / Culture / Species / Location / Items. Possibility to store images (at least one per entry) Simple, structured fields Clean templates for each type Tagging + search functionality Collections ("Projects") Relationship-mapping (could be a later feature) UI-wise I want Beautiful (later customizable) card view + data mode Export as PNG or PDF (auto export? auto view?) Gentle suggestions / guidance (I personally always struggle with finding where a specific entry should belong category-wise and I'm sure I'm not the only one.) I also want to combine the painpoints from various existing writing tools and provide a LIGHTWEIGHT solution.

## Core Entries
- Character
- Organization
- Culture
- Species
- Location
- Item

### Entry Fields
- Name
- Short Description / Summary
- Optional long notes
- Tags
- Image (1 per entry for now)
- "Type-specific fields" (minimal for now); 
	- e.g. Character → Age, Role, Affiliations
	- e.g. Locations → Region, Climate, Key events
	- e.g. Items → Origin, Purpose

### Images
- One image upload per entry MVP
- Stored in S3 / cloud storage
- Shown in Card View
- Optional, later:
	- gallery
	- AI image help
	- moodboards

### Projects / Collections

Each "Project" contains:
- Entries
- Tags scoped inside project
- Simple overview page

No team features / multi-user collaboration / permissions for now.

### Search & Tags
- Search by name + description + tags
- Tag filter sidebar MAYBE

### Basic AI Features
- Gentle guidance from AI (suggestions on where to place based on notes)
	- eg. Paste chaos text → AI suggests: looks like a Character, or could also be a Faction, or split into Character + Organization

- Basic Structure suggester:

Idea: User writes sloppy text: "Julien is a rogue vampire... grandfather abused him... blah blah trauma..."

AI restructures IF needed the Role, Personality traits, Motivation, Conflict, Relationships.
User can edit. Should not feel intrusive.

## UI

### CARD MODE (Makes the world feel "real")
- Beautiful
- Minimal
- Visual browsing
- Grid
- Gently Aesthetic

### DATA MODE
- structured fields
- clean layout
- clutterless
- inline editing
- collapsible sections

## Export

MVP can do:
- PDF export
- PNG card export (optional)

Expectations:
- Simple stylesheet
- Good typography
- One "pretty" default template

Later:
- Premium export styles
- Booklet export
- Project-level export



Things we should not do in MVP:
❌ Timelines
❌ Relationship graph
❌ Collaboration
❌ Full AI plot engines
❌ Scenes / chapters / manuscript tools
❌ “Write your novel here”

