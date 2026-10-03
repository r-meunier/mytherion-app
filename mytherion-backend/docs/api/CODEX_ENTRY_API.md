# Entry Management API Documentation

> Vocabulary follows [`terminology.md`](../../../docs/terminology.md). `Category` was removed in MYT-81.


## Overview

The Entry Management API provides endpoints for managing lore entries (characters, locations, organizations, species, cultures, and items) within projects.

---

## Base URL

```
http://localhost:8080/api
```

---

## Authentication

All endpoints require JWT authentication via HttpOnly cookie (set during login).

---

## Entry Types

- `CHARACTER` - Characters in your lore
- `LOCATION` - Places and locations
- `ORGANIZATION` - Groups, guilds, factions
- `SPECIES` - Races and species
- `CULTURE` - Cultures and civilizations
- `ITEM` - Objects and artifacts

---

## Endpoints

### List Entries

Get a paginated list of entries in a project with optional filters.

**Request:**

```http
GET /api/projects/{projectId}/entries?type=CHARACTER&tags=hero,mage&search=gandalf&page=0&size=20
```

**Query Parameters:**

- `type` (optional) - Filter by entry type
- `tags` (optional) - Comma-separated list of tags
- `search` (optional) - Search in name, summary, description
- `page` (optional, default: 0) - Page number, 0 or more
- `size` (optional, default: 20) - Page size, 1 to 100. Out-of-range values return 400 `VALIDATION_FAILED`.

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "projectId": 1,
      "type": "CHARACTER",
      "name": "Gandalf",
      "summary": "A wise wizard",
      "description": "Gandalf the Grey, later Gandalf the White...",
      "tags": ["wizard", "hero", "mage"],
      "thumbnail": "mytherion-uploads/entries/1/gandalf.jpg",
      "content": "{\"age\": \"2000+\", \"role\": \"Wizard\"}",
      "createdAt": "2026-01-18T22:00:00Z",
      "updatedAt": "2026-01-18T22:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1
}
```

---

### Create Entry

Create a new entry in a project.

**Request:**

```http
POST /api/projects/{projectId}/entries
Content-Type: application/json

{
  "type": "CHARACTER",
  "name": "Aragorn",
  "summary": "Heir to the throne of Gondor",
  "description": "Aragorn II, son of Arathorn...",
  "tags": ["ranger", "king", "hero"],
  "content": "{\"age\": \"87\", \"role\": \"Ranger/King\"}"
}
```

**Validation:**

- `type` - Required
- `name` - Required, 1-255 characters
- `summary` - Optional, max 1000 characters
- `description` - Optional
- `tags` - Optional array
- `content` - Optional JSON object of entry sections

**Response:** `201 Created`

```json
{
  "id": 2,
  "projectId": 1,
  "type": "CHARACTER",
  "name": "Aragorn",
  "summary": "Heir to the throne of Gondor",
  "description": "Aragorn II, son of Arathorn...",
  "tags": ["ranger", "king", "hero"],
  "thumbnail": null,
  "content": "{\"age\": \"87\", \"role\": \"Ranger/King\"}",
  "createdAt": "2026-01-18T23:00:00Z",
  "updatedAt": "2026-01-18T23:00:00Z"
}
```

---

### Get Entry

Get a single entry by ID.

**Request:**

```http
GET /api/projects/{projectId}/entries/{id}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "projectId": 1,
  "type": "CHARACTER",
  "name": "Gandalf",
  "summary": "A wise wizard",
  "description": "Gandalf the Grey...",
  "tags": ["wizard", "hero"],
  "thumbnail": "mytherion-uploads/entries/1/gandalf.jpg",
  "content": "{\"age\": \"2000+\"}",
  "createdAt": "2026-01-18T22:00:00Z",
  "updatedAt": "2026-01-18T22:00:00Z"
}
```

**Error Responses:**

- `404 Not Found` (`ENTRY_NOT_FOUND`) - Entry not found or deleted
- `404 Not Found` (`PROJECT_NOT_FOUND`) - Project missing, deleted or not yours

---

### Update Entry

Update an existing entry (partial update).

**Request:**

```http
PATCH /api/projects/{projectId}/entries/{id}
Content-Type: application/json

{
  "name": "Gandalf the White",
  "summary": "The White Wizard",
  "tags": ["wizard", "hero", "white"]
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:** `200 OK`

```json
{
  "id": 1,
  "projectId": 1,
  "type": "CHARACTER",
  "name": "Gandalf the White",
  "summary": "The White Wizard",
  "description": "Gandalf the Grey...",
  "tags": ["wizard", "hero", "white"],
  "thumbnail": "mytherion-uploads/entries/1/gandalf.jpg",
  "content": "{\"age\": \"2000+\"}",
  "createdAt": "2026-01-18T22:00:00Z",
  "updatedAt": "2026-01-18T23:05:00Z"
}
```

---

### Delete Entry

Soft delete an entry.

**Request:**

```http
DELETE /api/projects/{projectId}/entries/{id}
```

**Response:** `204 No Content`

**Note:** This is a soft delete. The entry is marked as deleted but not removed from the database.

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

**Response:** `200 OK`

```json
{
  "url": "mytherion-uploads/entries/1/1737238800000_gandalf.jpg",
  "objectKey": "entries/1/1737238800000_gandalf.jpg",
  "bucketName": "mytherion-uploads",
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

- `404 Not Found` - No image found for entry

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
  "id": 1,
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
  "path": "/api/projects/1/entries",
  "timestamp": "2026-01-18T23:00:00Z",
  "errors": { "name": ["Name is required"] }
}
```

- `error` is always the status's reason phrase.
- **Branch on `code`**, never on `message`; messages are for humans and may be reworded.
- `path` never includes the query string.
- `errors` (field → list of reasons, sorted) appears only with `VALIDATION_FAILED`.

The full list of codes is `ErrorCode.kt` (backend) / `types/apiError.ts` (frontend); CI fails if
they drift.

### Common Error Codes

| Status | Codes |
|---|---|
| `400 Bad Request` | `VALIDATION_FAILED`, `MALFORMED_REQUEST` (bad JSON or multipart), `INVALID_PARAMETER`, `INVALID_FILE`, `BAD_REQUEST` |
| `401 Unauthorized` | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` |
| `403 Forbidden` | `ACCESS_DENIED`: identical body for every role or account-ownership denial |
| `404 Not Found` | `PROJECT_NOT_FOUND` (missing, deleted or someone else's: one body for all three), `ENTRY_NOT_FOUND`, `USER_NOT_FOUND`, `THUMBNAIL_NOT_FOUND`, `NOT_FOUND` (no such endpoint) |
| `405` / `415` | `METHOD_NOT_ALLOWED`, `UNSUPPORTED_MEDIA_TYPE` |
| `409 Conflict` | `PROJECT_HAS_ENTRIES`, `CONCURRENT_MODIFICATION` (stale `version` on update; reload and retry) |
| `413 Content Too Large` | `FILE_TOO_LARGE` |
| `500 Internal Server Error` | `INTERNAL_ERROR`: the cause is logged, never returned |

---

## Example Workflows

### Create a Character with Image

1. Create the character:

```bash
curl -X POST http://localhost:8080/api/projects/1/entries \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CHARACTER",
    "name": "Frodo Baggins",
    "summary": "Ring bearer",
    "tags": ["hobbit", "hero"]
  }'
```

2. Upload an image:

```bash
curl -X POST http://localhost:8080/api/projects/{projectId}/entries/3/thumbnail \
  -F "file=@frodo.jpg"
```

### Search for Entries

Search for all wizard characters:

```bash
curl "http://localhost:8080/api/projects/1/entries?type=CHARACTER&tags=wizard&page=0&size=10"
```

### Update and Delete

Update entry:

```bash
curl -X PATCH http://localhost:8080/api/entries/1 \
  -H "Content-Type: application/json" \
  -d '{"summary": "Updated summary"}'
```

Delete entry:

```bash
curl -X DELETE http://localhost:8080/api/entries/1
```
