# 📖 Worldbuilder Persona: *Elena creates the World of "Aeloria"*

> **Goal:** Elena is setting up a new dark fantasy world, creating her protagonist (*Kaelen Voss*), attaching character lore and artwork, organizing categories, and testing search and editing flows.

---

## 🧭 Step-by-Step Test Journey

### 📍 Phase 1: Authentication & Session Verification
* **Goal:** Test validation, route protection, token storage, and redirection.

1. **Navigate to:** `http://localhost:3000/register`
2. **Action — Negative Test:** Attempt submitting with mismatched passwords or empty fields. [RESULT: Frontend shows "Passwords do not match" red error under Confirm Password field. The error message's UI does NOT match the error message UX on the LOGIN screen (e.g. "Incorrect email or password. Please check your credentials and try again." shows up in a bubble, whereas on the "Register" page there is no bubble.)]
   * *Look out for:* Does inline validation catch errors before submitting? Are error messages clear?
3. **Action — Positive Test:** Register a fresh test account:
   * **Username:** `elena_scribe`
   * **Email:** `elena@aeloria.dev`
   * **Password:** `ArcanePass123!`
   [RESULT: Verification email takes a while (a couple seconds) to arrive. Verification is fast. Redirects to login page.
   NOTE: we provide "username" upon registering but we ask for an "email address" for logging in, creating a somewhat confusing, unequal auth experience. We do use the "Username" later on the logged in app, but that's later.]
4. **Action — Login:** Log in at `/login` with the credentials.
   * *Look out for:* Does it redirect smoothly to the Dashboard without flashing unstyled content? Does page reload keep you logged in?
   [RESULT: Redirects to login page. THERE IS a brief second of FLASHING of empty "World cards" upon logging in before the page loads.]
   [NOTE: Upon logging in, we get API calls to /login, /me, /stats, /projects?page=0&size=8, and /?_rsc=Grhfg4Gu3S6SqYlJ. The console shows 

   console-log.service.ts:51 NativeMessaging port disconnected because of error: Specified native messaging host not found.
console-log.service.ts:43 [Native Messaging IPC] Connecting to Bitwarden Desktop app...
console-log.service.ts:43 Retrieving application id
console-log.service.ts:51 NativeMessaging port disconnected because of error: Specified native messaging host not found.
console-log.service.ts:43 [Native Messaging IPC] Connecting to Bitwarden Desktop app...
console-log.service.ts:43 Retrieving application id
console-log.service.ts:51 NativeMessaging port disconnected because of error: Specified native messaging host not found.
bootstrap-autofill-overlay.js:16 Uncaught (in promise) NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
    at Ha.Node.insertBefore (bootstrap-autofill-overlay.js:16:17235)
    at AutofillInlineMenuContentService.<anonymous> (bootstrap-autofill-overlay.js:6794:30)
    at Generator.next (<anonymous>)
    at fulfilled (bootstrap-autofill-overlay.js:6495:58)
bootstrap-autofill-overlay.js:16 Uncaught (in promise) NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
]

---

### 📍 Phase 2: Dashboard & Project Creation
* **Goal:** Verify dashboard metrics, project creation modals, and duplicate submission guards.

1. **Dashboard Overview:** Notice the initial state (zero projects, zero entities).
   * *Look out for:* Are empty state placeholders styled nicely?
   [RESULT: "Your Worlds" screen shows with "Access and manage your multi-verse projects." subheader, and with a card for "Create New World/Begin a new chronicle", as well as Search/Filter, Sort By, Genre and View As options. I don't believe when the very new, first-time user has NO WORLDS, we should be showing anything. Also, not all of these sort/filter/search features work, but I'm unable to test yet. There is FLASHING occurring when I try to search but 0 worlds load. "Search/Filter" if I type 'setsets', it loads "/api/projects?page=0&size=8&search=setsets", and inconsistently, the page flashes (Same empty World cards flashing.). "Sort by" only seems to Log "Sort: {sort_by_type}". "Genre" dropdown if I select something other than default "All Genres", e.g. 'Mystery', it loads "/api/projects?page=0&size=8&search=setsets&genre={Mystery}", case-sensitive added to the URL; flashing occurs randomly. Selecting between View as: Grid or List only logs "View: grid" or "View: list", but makes no API call.]
   [RESULT (NAVBAR): "Mytherion" logo and icon clicked make API calls /?_rsc=b0khqZwsBCoct6V9 and /?_rsc=uHGJWiZIljB4yWji within 100ms, but nothing visible happens. "Dashboard" - same. "Community" - same (the page does not redirect to the Community page but this is expected as we do NOT have this implemented.) "Assets" - same (the page does not redirect to the Assets page but this is expected; we do NOT have this implemented.). Search bar within navbar if I enter text does nothing. If I hit enter, does nothing. There is no functionality; the searchbar is a placeholder as of right now. Notification Icon clicked lights up, does nothing, opens no dropdown, nothing happens; not implemented. User Icon when HOVERED over, the User menu opens, displaying the Username "elena_scribe", the user's "Verified User Level 4" which is a placeholder text, a hoverable Settings button and a hoverable Log out button. Log out button correctly clears the JWT token and redirects to Login page. Settings button upon clicking calls "/?_rsc=aqVcNHEBULYR2oBV" (?), but nothing happens. "New Project" button hoverable and clickable, Clicking brings up the "Initiate New World" modal. Note: Confusing naming on "New Project" if it brings up "New World".]
2. **Action — Open Project Modal:** Click **"New Project"** / **"Summon World"**. [RESULT: We do NOT have a "Summon World" button. We have "New Project" in the navbar and "Create New World" card, both bring up the "Initiate New World" modal.]
3. **Fill Project Data:**
   * **Title:** `Chronicles of Aeloria`
   * **Genre:** `Dark Fantasy / Arcane Punk` [RESULT: We do not have these genres, we currently only have "High Fantasy", "Sci-Fi", "Grimdark", "Steampunk", "Cyberpunk" genres. I will use "High Fantasy"]
   * **Description:** `A fractured world bound by fading ley-lines and ancient clockwork spires.`
4. **Action — Rapid Double-Click Submit:** Click the create button rapidly twice. [RESULT: Only 1 project is created upon rapid double clicking, modal disappears quickly, the new World Card gets created with the name "Chronicles of Aeloria", the description given, and "High Fantasy" tag. We have "0 entities" and "1h ago" texts visible. 0 entities is currently correct (a World gets created with 0 entities), but "1h ago" is incorrect, as it was more like 1 minute ago. We also have two icons for Edit and Delete, both hoverable, and both do nothing upon clicking. We also have a ... hamburger menu, hoverable but NOTHING happens when you click it. Further issue: The card when hovered, animates and zooms in on the picture but the bottom 1 pixel of the picture is flashing upon animation.]
   * *Look out for:* Does the button disable during submission? Does it create only **one** project or duplicate?
5. **Action — Project Card Inspection:** Verify the new project card appears with its derived visual style. Click into the project.
[RESULT: Clicked into the project. The Project page loads. We have the dual sidebar. The first sidebar has 4 items: Overview, Codex, Timeline, Atlas. The Overview button does nothing clicked when already on the overview. Codex loads the Codex page. Second part of dual sidebar has the title of the Project "Chronicles of Aeloria" but it cuts of at "Ael..." because it's too long text, with "ACTIVE WORLD" subheader. "NAVIGATION" subheader has 6 nav elements: Overview, Codex, Timeline, Characters, Atlas, Project Notes. "LIBRARY" subheader has 1 nav element: Bestiary. Only "Codex" works and redirects to Codex page, the rest have API calls to like "?_rsc=bwmCjFC88tmtRudN". TOP NAVBAR: "Dashboard" button changed to "Back to Worlds" button and it correctly takes you back to the dashboard. "New Project" button gone. The MAIN project page content area has the "Back to Worlds" button again (!), "CHRONICLES OF AELORIA" in capitalized golden letters. We have "Project Overview" with 3 cards: Total Entities, Characters, Locations. The numbers in all 3 are placeholders and don't correspond to reality. We have "World Modules" subheader in inconsistent font style compared to previous subheaders. We have 3 cards "Codex Browser", "Timeline" (half opacity), "Relationship Map" (half opacity). "Codex Browser" redirects to "Codex" page. We have "QUICK CREATE" section with yet another, inconsistent font style. 3 buttons here: "New Character", "New Location", "New Lore Entry", all hoverable, none working. I believe this Project page needs serious, serious overhaul in the long run.]

---

### 📍 Phase 3: Category Taxonomy Setup
* **Goal:** Test category persistence and dropdown integration in entities.

1. **Action:** Navigate to project category management (or trigger inside Entity modal). [RESULT: WE DO NOT have such a thing. It is NOT "Project category management" we have. We do have "Category" within "Summon New Entity" modal, but that is a different thing.]
2. **Create Categories:**
   * `Dramatis Personae` (Characters & NPCs)
   * `Relics & Artifacts` (Items & Magic)
   * `Forbidden Realms` (Locations)
3. *Look out for:* Do categories immediately populate selectors without requiring a manual page refresh?

---

### 📍 Phase 4: Entity Creation with Semantic Modules & Image Upload
* **Goal:** Test full entity lifecycle: multipart image upload to MinIO, JSONB metadata modules, tag inputs, and Redux sync.

1. **Action:** Click **"Create Entity"** / **"Summon New Entity"**. [RESULT: lots of unnecessary INFO level logging on frontend.]
2. **Step A — Basic Classification:**
   * **Type:** `Character`
   * **Name:** `Kaelen Voss`
   * **Category:** Select `Dramatis Personae` [RESULT: we do not have this. I can CREATE new categories and add them.]
   * **Tags:** Type `protag`, `blood-mage`, `outcast` (hit Enter after each). [RESULT: adding a tag modifies the size of the Summon New Entity modal because the tag gets added.]
3. **Step B — Image Upload Stress-Test:**
   * *Edge Case Test:* Select an invalid file (e.g. `.txt` or a file `> 5MB`). [RESULT: Get error message "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" but it modifies the modal's size. Upon reuploading correct file format, the error disappears.]
     * *Look out for:* Does it immediately display a red validation error without crashing?
   * *Valid Test:* Select any standard `.png` / `.jpg` image (<5MB).
     * *Look out for:* Does the image preview render inside the form? Does the "Remove" / "Change" button work? [RESULT: Change button does nothing. Remove button removes it. Uploading the image does not SAVE it to MINIO until the form is sent.]
     [RESULT: Image is uploaded but the image is not resizable, and is cut off to the container's size.]
4. **Step C — Narrative & Semantic Modules:**
   * **Public Description:** `Former inquisitor turned rogue blood-mage seeking redemption in the Sunken Undercity.`
   * **Private Notes:** `Secret: Carries the shard of the Shattered Crown in his left gauntlet.`
   * **Semantic Modules (Metadata):** Fill in Bio, Appearance (e.g., *Height: 6'1", Eyes: Violet*), Psychology traits.
5. **Step D — Submit:** Click **"Create Entity"**.
   * *Look out for:*
     * How many milliseconds does saving take?
     * Does the modal close cleanly?
     * Does `Kaelen Voss` appear on the grid with his **uploaded image** displayed on the `EntityCard`?
     [RESULT: Kaelen Voss appears on grid with its uploaded image, description and first 3 tags. Further tags get collapsed into +4. We get a text-based "Created 9/1/2026" tag on the bottom which is inconsistent with World cards. Hovering brings up Edit and DELETE icon buttons. Edit brings up the Entity modal. Delete brings up an alert modal Delete Entity?. Editing seems to be working, the changes get saved.]

---

### 📍 Phase 5: Entity Detail View & Multi-Archetype Test
* **Goal:** Verify deep-link routing, hero banner display, and alternate metadata schemas.

1. **Action — Open Detail View:** Click on the `Kaelen Voss` card (`/projects/[projectId]/entities/[entityId]`).
   * *Look out for:*
     * Does the **Hero Banner Image** render at the top? [RESULT: yes]
     * Are all semantic modules (Bio, Appearance, Notes) rendered accurately? [RESULT yes]
     * Does the back navigation / breadcrumb return to the project codex smoothly?
2. **Action — Create a Second Entity (Item Archetype):**
   * **Type:** `Item`
   * **Name:** `The Sunken Crucible`
   * **Category:** `Relics & Artifacts`
   * **Tags:** `artifact`, `ancient`, `fire`
   * **Description:** `An obsidian chalice that burns with eternal blue soulfire.`
   * *Look out for:* Do the semantic modules dynamically switch from Character fields (Bio/Psychology) to Item fields (Attunement/Rarity/Value)?
   [RESULT: Summon New Entity modal is dynamically changed upon changing "Entity Type", however the modal's size is changing every time, rendering according to the components' size which gives a bad UX.]

---

### 📍 Phase 6: Search, Filter, & Sorting Responsiveness
* **Goal:** Test client-side and server-side filtering speed and accuracy.

1. **Filter by Type:** Select `Item` filter ➔ verify only `The Sunken Crucible` is visible. [RESULT: yes]
2. **Filter by Category:** Select `Dramatis Personae` ➔ verify only `Kaelen Voss` is visible. [RESULT: WE DO NOT have a category-based filter on Entity Codex page.]
3. **Live Search Bar:** [RESULT searched in Entity codex page, "Search entities..."]
   * Type `"blood"` ➔ Check if Kaelen appears instantly. [RESULT: yes]
   * Type `"xyznonexistent"` ➔ Check if empty search state renders gracefully. [RESULT: No entities found. Try adjusting your filters or search terms]
   * *Look out for:* Is typing in the search bar snappy or does it lag/stutter? [RESULT: flashing in the entity cards. Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received]

---

### 📍 Phase 7: Edit & Reshape (State Sync & Optimistic Locking)
* **Goal:** Verify versioning, data loss prevention, and updates.

1. **Action:** Click **Edit** on `Kaelen Voss`.
2. **Modifications:**
   * Change Name to: `Lord Kaelen Voss`
   * Add a new Tag: `nobility`
   * Edit Appearance or Psychology details.
3. **Submit:** Click **"Update Entity"**.
4. **Action — Hard Refresh (F5 / Ctrl+R):**
   * *Look out for:* Did all changes (including nested JSON metadata) persist without data loss or rollback?
   [RESULT: hard refresh clears filters, so if I had a search/filter set, it removes it. "Lord Kaelen Voss" is visible, with the new "nobility" tag added if I click into the individual Entity page.]

---

### 📍 Phase 8: Deletion & Soft-Delete Cleanup
* **Goal:** Verify deletion confirmation modals and instant UI removal.

1. **Action:** Click **Delete** on `The Sunken Crucible`.
2. *Look out for:*
   * Is there a confirmation dialog to prevent accidental deletion? [RESULT: yes]
   * Does the card immediately disappear from the UI without requiring a refresh? [RESULT: yes]
   [Confirmation modal doesn't disappear when clicking out of it, only by clicking Cancel.]

---

## 📋 Interactive Audit Scorecard (What to note while clicking)

| Flow Area | Key UX & Performance Questions | Notes / Bugs Found |
| :--- | :--- | :--- |
| **Auth & Routing** | Did login redirect immediately? Did session persist on reload? | `[ i think so ]` |
| **Modal Behavior** | Did modals close properly on backdrop click / Escape? Did buttons show loading spinners? | `[ not all ]` |
| **Image Upload** | Was upload speed fast? Did thumbnail render crisp without layout shift? | `[ seemingly yes ]` |
| **Semantic Data** | Did any custom fields get wiped or ignored during save/edit? | `[ no, it was correctly showing ]` |
| **Search & Filters** | Was filter switching instant (<100ms)? Did tag clicking work? | `[ i dont know ]` |
| **Console Health** | Press `F12` — Are there any React hydration warnings or 400/500 errors in the console? | `[ some ]` |

---
