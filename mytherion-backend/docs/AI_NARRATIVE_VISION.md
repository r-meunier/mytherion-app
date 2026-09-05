# Mytherion: AI & Narrative Expansion Vision

## 1. The Core Objective

To evolve Mytherion from a structured world-building wiki into an **Interactive Narrative Engine**. The goal is a one-stop platform where users can **Build** their world, **Write** their stories with real-time lore assistance, and **Chat** with their characters in a deep, context-aware roleplay environment.

---

## 2. Pillar 1: The Context Engine (Lorebook 2.0)

Most AI roleplay tools (SillyTavern, etc.) use flat text blobs. Mytherion's **Semantic Component System** provides a "Deep Context" advantage.

- **Dynamic Prompting**: Automatically assemble a character's "Prompt Dossier" using their Psychology (Wounds/Lies), Social (Standing/Skills), and History components.
- **Relationship Awareness**: The AI will understand its stance toward the player/other characters based on the `Perspectives` and `Relations` components.
- **World State Injection**: Automatically inject the current Location's climate, Culture's values, and Organization's laws into the AI's short-term memory.

---

## 3. Pillar 2: The Virtual Persona System

Introduce a dedicated **`AI_PERSONA`** component for every entry:

- **Voice & Tone**: 5-10 "Sample Dialogue" lines to train the AI's speech pattern.
- **First Message**: The default "greeting" for starting a chat.
- **Behavioral Constraints**: High-level instructions (e.g., "Never reveal the secret in the PSYCHOLOGY component until X happens").
- **System Prompt Templates**: Custom templates for different LLM models (Ollama, OpenAI, Anthropic).

---

## 4. Pillar 3: Integrated Writing Environment

A writing suite that "knows" your world.

- **Lore-Checking**: As you write "Julien drew his silver sword," the system highlights "silver sword" and links it to the ITEM entry.
- **Consistency Alerts**: If you write that a character is in a location they shouldn't be, the system flags it based on the `RELATIONS` data.
- **AI Drafting**: Use AI to expand descriptions or brainstorm dialogue, with the AI already aware of the character's `Mannerisms` and `Quirks`.

---

## 5. Pillar 4: Interactive Chat (SillyTavern/Character.AI Style)

A dedicated Chat UI within the app:

- **Group Chats**: Chat with multiple characters at once; they will interact with each other based on their `Perspectives`.
- **World-Events**: Use the `Timeline` (future feature) to have the AI react to major world events.
- **RAG (Retrieval-Augmented Generation)**: Efficiently search through the millions of words in your `History` and `Notes` components to feed relevant facts to the AI.

---

## 6. Technical Roadmap

- [ ] **LLM Connector**: Plugin system for local (Ollama) or cloud (OpenAI/Claude) models.
- [ ] **Context Formatter**: Tools to export components into standard formats (V2 Cards, WWI, JSON).
- [ ] **Vector Database**: Integration (e.g., pgvector) to allow the AI to "remember" huge amounts of lore.
