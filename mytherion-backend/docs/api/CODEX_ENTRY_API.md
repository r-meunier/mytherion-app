# Codex Entry API

> Vocabulary follows [`terminology.md`](../../../docs/terminology.md). The entry model behind
> `content` is described in [`codex-entry-model.md`](../../../docs/codex-entry-model.md).

## Overview

Endpoints for the codex entries (characters, locations, organizations, species, cultures, items and
custom entries) inside a project, plus the built-in templates a new entry starts from.

---

## Base URL

```
http://localhost:8080/api
```

---

## Authentication

All endpoints require JWT authentication via HttpOnly cookie (set during login). Every
`/api/projects/{projectId}/**` route also checks that the project is yours (`ProjectAccessInterceptor`).

---

## Entry Types

`CHARACTER`, `LOCATION`, `ORGANIZATION`, `SPECIES`, `CULTURE`, `ITEM`, `CUSTOM`

---

## The entry

```json
{
  "id": "8d0c1c5e-4f2a-4d3b-9a51-2f6c0e7b1a90",
  "projectId": "aab61b78-ee8b-4ba0-b3e3-9e4655bbde8f",
  "type": "CHARACTER",
  "name": "Mira Vell",
  "description": "A disgraced cartographer who charts the flooded districts.",
  "notes": "Secretly the heir.",
  "tags": ["cartographer", "exile"],
  "aliases": ["The Cartographer"],
  "thumbnail": "mytherion-uploads/entries/8d0c…/1737238800000_mira.jpg",
  "content": {
    "templateId": "character-basic",
    "details": [
      { "id": "3b1f…", "label": "Story role", "value": "Protagonist", "hint": "Protagonist, antagonist…", "role": "IDENTITY" },
      { "id": "9e4a…", "label": "Voice", "value": null, "hint": "How do they talk?", "role": "VOICE" }
    ]
  },
  "version": 3,
  "createdAt": "2026-10-08T10:00:00Z",
  "updatedAt": "2026-10-08T11:00:00Z"
}
```

- `notes` are private to the author; `description` is the main lore text.
- `content.details` is an ordered, author-controlled list. `hint` and `role` come from the template the
  detail was started from; `role` is one of `IDENTITY`, `APPEARANCE`, `VOICE`, `MOTIVATION`,
  `BACKSTORY`, `SENSORY`, `CURRENT_STATE`, or absent.
- `version` is for optimistic locking: send it back on update (see Update Entry).

**`content` rules** (otherwise `400 INVALID_ENTRY_CONTENT`): at most 100 details; detail ids unique;
every label non-blank and at most 100 characters; values at most 20,000 characters; hints at most 500;
`templateId`, when present, 1 to 64 characters.

---

## Endpoints

### List Entries

Get a paginated list of entries in a project with optional filters.

**Request:**

```http
GET /api/projects/{projectId}/entries?type=CHARACTER&tags=hero,mage&search=mira&page=0&size=20
```

**Query Parameters:**

- `type` (optional) - Filter by entry type
- `tags` (optional) - Comma-separated list of tags
- `search` (optional) - Case-insensitive match on name, aliases, description and notes
- `page` (optional, default: 0) - Page number, 0 or more
- `size` (optional, default: 20) - Page size, 1 to 100. Out-of-range values return 400 `VALIDATION_FAILED`.

**Response:** `200 OK`, a page of entries, newest first:

```json
{
  "content": [ { "id": "8d0c…", "name": "Mira Vell", "type": "CHARACTER", "…": "…" } ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 1,
  "totalPages": 1
}
```

---

### Create Entry

**Request:**

```http
POST /api/projects/{projectId}/entries
Content-Type: application/json

{
  "type": "CHARACTER",
  "name": "Mira Vell",
  "description": "A disgraced cartographer…",
  "tags": ["cartographer"],
  "aliases": ["The Cartographer"],
  "content": {
    "templateId": "character-basic",
    "details": [{ "id": "3b1f…", "label": "Story role", "value": "Protagonist", "role": "IDENTITY" }]
  }
}
```

**Fields:** `type` required; `name` required, 1-255 characters; `description`, `notes`, `tags`,
`aliases`, `thumbnail` and `content` optional. The client creates detail ids (UUIDs).

**Response:** `201 Created` with the entry.

---

### Get Entry

```http
GET /api/projects/{projectId}/entries/{id}
```

**Response:** `200 OK` with the entry.

**Error Responses:**

- `404 Not Found` (`ENTRY_NOT_FOUND`) - Entry not found or deleted
- `404 Not Found` (`PROJECT_NOT_FOUND`) - Project missing, deleted or not yours

---

### Update Entry

Partial update: only the fields you send change. The entry page saves one field at a time this way.

```http
PATCH /api/projects/{projectId}/entries/{id}
Content-Type: application/json

{ "name": "Mira Vell-Arden", "version": 3 }
```

- `content`, when sent, replaces the whole `content`: send every detail, not just the changed one.
- `version`: when sent and it is not the stored version, the update is refused with
  `409 CONCURRENT_MODIFICATION`. Reload the entry and retry.

**Response:** `200 OK` with the updated entry, including its new `version`. Send that version with the
next update.

---

### Delete Entry

```http
DELETE /api/projects/{projectId}/entries/{id}
```

**Response:** `204 No Content`. This is a soft delete: the entry is marked as deleted but not removed
from the database.

---

### List Templates

The built-in starting points for a new entry (Blank, Basic) for one entry type. Not project-scoped.

```http
GET /api/codex/templates?type=CHARACTER
```

**Response:** `200 OK`

```json
[
  { "id": "character-blank", "entryType": "CHARACTER", "level": "BLANK", "name": "Blank",
    "description": "Start empty and add only the details you want.", "details": [] },
  { "id": "character-basic", "entryType": "CHARACTER", "level": "BASIC", "name": "Basic",
    "description": "A handful of key details to get you started.",
    "details": [{ "label": "Story role", "hint": "Protagonist, antagonist…", "role": "IDENTITY" }] }
]
```

A template's details have no `id` or `value`: the client gives each one an id when it copies them into
an entry.

---

### Upload Image

Upload an image for an entry.

**Request:**

```http
POST /api/projects/{projectId}/entries/{id}/thumbnail
Content-Type: multipart/form-data

file: [binary image data]
```

**Validation:**

- **Allowed types:** JPEG, PNG, GIF, WebP
- **Max size:** 5MB by default, set by `MAX_UPLOAD_FILE_SIZE` (`spring.servlet.multipart.max-file-size`)

**Response:** `200 OK`. The entry's `thumbnail` changes too; fetch the entry again for it and its new `version`.

```json
{
  "url": "mytherion-uploads/entries/8d0c…/1737238800000_mira.jpg",
  "objectKey": "entries/8d0c…/1737238800000_mira.jpg",
  "contentType": "image/jpeg",
  "size": 245678
}
```

**Error Responses:**

- `400 Bad Request` (`INVALID_FILE`) - File is empty or not an accepted image type
- `413 Content Too Large` (`FILE_TOO_LARGE`) - File exceeds the upload limit. Raised while the
  request is parsed, before the endpoint runs.

---

### Delete Image

Delete an entry's image.

**Request:**

```http
DELETE /api/projects/{projectId}/entries/{id}/thumbnail
```

**Response:** `204 No Content`

**Error Responses:**

- `404 Not Found` (`THUMBNAIL_NOT_FOUND`) - The entry has no image

---

## Export

### Export Project

The whole project as a zip of the project folder format
([ADR 0001 §4](../../../docs/decisions/0001-local-first-desktop-client.md)): `project.json`, one Markdown
file per entry (YAML frontmatter + `## Description` / `## Notes`) under `codex/<type>/`, and the entry
images under `media/`.

```http
GET /api/projects/{projectId}/export
```

**Response:** `200 OK`, `Content-Type: application/zip`, with
`Content-Disposition: attachment; filename="<project-slug>-<date>.zip"`. The date is the server's, in UTC.

```
stellar-drift/
├── project.json
├── codex/characters/mira-vell.md
├── codex/locations/the-drowned-quarter.md
└── media/<entry id>.png
```

- Deleted entries are left out.
- An image is named after its stored content type (`jpg`, `png`, `gif`, `webp`), or `img` if unknown.
- All or nothing: the zip is built in full before it is sent (with a `Content-Length`), so a failure is
  always an error response, never a partial download.
- `502 EXPORT_FAILED` when an entry's image can't be read from storage. No zip is made; the message names
  the entry.
- `404 PROJECT_NOT_FOUND` when the project is missing, deleted or not yours.

---

## Project Endpoints

### Get Project Statistics

Get entry count and breakdown by type for a project.

**Request:**

```http
GET /api/projects/{id}/stats
```

**Response:** `200 OK`

```json
{
  "id": "aab61b78-ee8b-4ba0-b3e3-9e4655bbde8f",
  "name": "Middle Earth",
  "description": "Tolkien's world",
  "entryCount": 25,
  "entryCountByType": {
    "CHARACTER": 10,
    "LOCATION": 8,
    "ORGANIZATION": 4,
    "SPECIES": 2,
    "ITEM": 1
  },
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-18T23:00:00Z"
}
```

---

## Error Responses

Every failure on every endpoint returns the same body (MYT-23), whether it comes from a
controller, a framework error (malformed JSON, bad path variable, unknown route) or Spring
Security.

### Error Response Format

```json
{
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "path": "/api/projects/aab61b78-ee8b-4ba0-b3e3-9e4655bbde8f/entries",
  "timestamp": "2026-01-18T23:00:00Z",
  "requestId": "3f2c9a4e-1b7d-4c2a-9e8f-5d6a7b8c9d0e",
  "errors": { "name": ["Name is required"] }
}
```

- `error` is always the status's reason phrase.
- **Branch on `code`**, never on `message`; messages are for humans and may be reworded.
- `path` never includes the query string.
- `errors` (field → list of reasons, sorted) appears only with `VALIDATION_FAILED`.
- `requestId` matches the `X-Request-Id` response header and the server logs; quote it when reporting a problem.

The full list of codes is `ErrorCode.kt` (backend) / `types/apiError.ts` (frontend); CI fails if
they drift.

### Common Error Codes

| Status | Codes |
|---|---|
| `400 Bad Request` | `VALIDATION_FAILED`, `INVALID_ENTRY_CONTENT` (breaks a `content` rule), `MALFORMED_REQUEST` (bad JSON or multipart), `INVALID_PARAMETER`, `INVALID_FILE`, `BAD_REQUEST` |
| `401 Unauthorized` | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` |
| `403 Forbidden` | `ACCESS_DENIED`: identical body for every role or account-ownership denial |
| `404 Not Found` | `PROJECT_NOT_FOUND` (missing, deleted or someone else's: one body for all three), `ENTRY_NOT_FOUND`, `USER_NOT_FOUND`, `THUMBNAIL_NOT_FOUND`, `NOT_FOUND` (no such endpoint) |
| `405` / `415` | `METHOD_NOT_ALLOWED`, `UNSUPPORTED_MEDIA_TYPE` |
| `409 Conflict` | `PROJECT_HAS_ENTRIES`, `CONCURRENT_MODIFICATION` (stale `version` on update; reload and retry) |
| `413 Content Too Large` | `FILE_TOO_LARGE` |
| `500 Internal Server Error` | `INTERNAL_ERROR`: the cause is logged, never returned |

---

## Example Workflows

`$PROJECT` and `$ENTRY` stand for UUIDs; `-b cookies.txt` sends the session cookie saved at login.

### Create a Character with Image

1. Create the character:

```bash
curl -b cookies.txt -X POST http://localhost:8080/api/projects/$PROJECT/entries \
  -H "Content-Type: application/json" \
  -d '{ "type": "CHARACTER", "name": "Frodo Baggins", "tags": ["hobbit", "hero"] }'
```

2. Upload an image:

```bash
curl -b cookies.txt -X POST http://localhost:8080/api/projects/$PROJECT/entries/$ENTRY/thumbnail \
  -F "file=@frodo.jpg"
```

### Search for Entries

```bash
curl -b cookies.txt "http://localhost:8080/api/projects/$PROJECT/entries?type=CHARACTER&tags=wizard&page=0&size=10"
```

### Update and Delete

```bash
curl -b cookies.txt -X PATCH http://localhost:8080/api/projects/$PROJECT/entries/$ENTRY \
  -H "Content-Type: application/json" \
  -d '{ "description": "Updated description", "version": 3 }'

curl -b cookies.txt -X DELETE http://localhost:8080/api/projects/$PROJECT/entries/$ENTRY
```
