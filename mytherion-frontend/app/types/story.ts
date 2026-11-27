/**
 * The story behind Plan and Write (docs/story-model.md): acts from a structure, chapters, scenes.
 * Mirrors the backend `story` domain; the contract parity check compares the enums.
 */

/** How far along a scene is. */
export enum SceneStatus {
  DRAFT = 'DRAFT',
  REVISED = 'REVISED',
  DONE = 'DONE',
}

/** A beat as a structure declares it. `position` is where it is expected, as a fraction (0..1). */
export interface StructureBeat {
  name: string;
  hint?: string;
  position?: number;
}

export interface StructureAct {
  title: string;
  description?: string;
  beats: StructureBeat[];
}

/** A built-in structure (Three-Act, Save the Cat, …) from GET /api/story/structures. */
export interface StoryStructure {
  id: string;
  name: string;
  description?: string;
  order: number;
  acts: StructureAct[];
}
