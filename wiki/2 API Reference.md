# API Reference

The Code Comments backend exposes a RESTful API consumed by two client applications:

- **Client app** -- the code commenting viewer (comments, categories, threads)
- **Manager app** -- project setup and administration (authentication, project CRUD)

Both apps share the same server but use different endpoint subsets.

## Base URL Structure

All endpoints are prefixed with `/api/v1/`. Project-scoped endpoints use:

```
{ServerBaseUrl}/api/v1/project/{projectId}/...
```

## Authentication

JWT-based. After logging in via `POST /api/v1/auth/login`, include the token in all subsequent requests:

```http
Authorization: Bearer <token>
```

### CORS

The backend must allow cross-origin requests from the client domain:

- `Access-Control-Allow-Origin`: `*` or specific client domain
- `Access-Control-Allow-Methods`: `GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, Authorization`

---

## Endpoints

### Auth

#### `POST /api/v1/auth/login`

Authenticates with a project password and returns a JWT token.

- **Request body**: `LoginRequestDto` (`base/app/types/authentication.ts`)
- **Response**: `AuthResponseDto` (`base/app/types/authentication.ts`)

### Projects

#### `GET /api/v1/project`

Returns all projects.

- **Response**: `ProjectDto[]` (`base/app/types/dtos/project-dto.ts`)

#### `POST /api/v1/project`

Creates a new project with its associated repository. Requires authentication.

- **Request body**: `ProjectSetupRequest` (`base/app/types/project-setup-request.ts`)
- **Response**: `ProjectDto`

### Comments

All comment endpoints are scoped to a project: `/api/v1/project/{projectId}/comments`

#### `GET /api/v1/project/{projectId}/comments`

Returns all comments for the specified project.

- **Response**: `CommentDto[]` (`base/app/types/dtos/comment-dto.ts`)

#### `GET /api/v1/project/{projectId}/comments/{commentId}`

Returns a single comment by ID.

- **Response**: `CommentDto`

#### `GET /api/v1/project/{projectId}/comments/{commentId}/thread`

Returns the full thread (root comment and all descendants).

- **Response**: `CommentDto[]`

#### `POST /api/v1/project/{projectId}/comments`

Creates a new root-level comment. Requires authentication.

- **Request body**: `CommentDto` (without `id`)
- **Response**: `CommentDto` (with server-assigned `id`)

#### `POST /api/v1/project/{projectId}/comments/{parentCommentId}/reply`

Creates a reply to an existing comment, forming a thread.

- **Request body**: `CommentDto` (the reply)
- **Response**: `CommentDto` (the created reply)

#### `PUT /api/v1/project/{projectId}/comments/{commentId}`

Updates an existing comment's content and category. Requires authentication.

- **Request body**: `CommentDto`
- **Response**: `CommentDto`

#### `DELETE /api/v1/project/{projectId}/comments/{commentId}`

Deletes a comment. Requires authentication.

- **Response**: `204 No Content`

### Categories

#### `GET /api/v1/category`

Returns all available comment categories.

- **Response**: `CategoryDto[]` (`base/app/types/dtos/category-dto.ts`)

---

## Data Models

All DTOs are defined as TypeScript interfaces in `base/app/types/`:

| DTO | File | Key Fields |
|-----|------|------------|
| `LoginRequestDto` | `authentication.ts` | `password` |
| `AuthResponseDto` | `authentication.ts` | `success`, `message`, `token?` |
| `ProjectDto` | `dtos/project-dto.ts` | `id`, `name`, `serverBaseUrl`, `repository` |
| `ProjectSetupRequest` | `project-setup-request.ts` | `serverBaseUrl`, `repositoryUrl`, `name`, `branch`, `repositoryType?` |
| `CommentDto` | `dtos/comment-dto.ts` | `id`, `content`, `type`, `location`, `categoryId`, `parentCommentId`, `rootCommentId`, `replies?` |
| `LocationDto` | `dtos/location-dto.ts` | `filePath`, `type`, `lineNumber?`, `startLineNumber?`, `endLineNumber?`, `description?` |
| `CommentType` | `dtos/comment-type.ts` | `Singleline`, `Multiline`, `File`, `Project` |
| `CategoryDto` | `dtos/category-dto.ts` | `id`, `label`, `description` |

---

## App Usage Matrix

| Endpoint | Client | Manager |
|----------|--------|---------|
| `POST /auth/login` | * | * |
| `GET /project` | | * |
| `POST /project` | | * |
| `GET /project/{id}/comments` | * | |
| `GET /project/{id}/comments/{id}` | * | |
| `GET /project/{id}/comments/{id}/thread` | * | |
| `POST /project/{id}/comments` | * | |
| `POST /project/{id}/comments/{id}/reply` | * | |
| `PUT /project/{id}/comments/{id}` | * | |
| `DELETE /project/{id}/comments/{id}` | * | |
| `GET /category` | * | |

---

## Example Payloads

### Login

```json
// POST /api/v1/auth/login
{
  "password": "my-project-password"
}

// Response
{
  "success": true,
  "message": "Authentication Successful",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Create Project

```json
// POST /api/v1/project
{
  "serverBaseUrl": "https://api.example.com",
  "repositoryUrl": "https://github.com/user/repo",
  "name": "My Code Review",
  "branch": "main",
  "repositoryType": "github"
}
```

### Create Comment

```json
// POST /api/v1/project/{projectId}/comments
{
  "id": null,
  "categoryId": "bug",
  "type": "Singleline",
  "content": "This function needs refactoring.",
  "location": {
    "id": null,
    "type": "Singleline",
    "filePath": "src/utils/math.ts",
    "lineNumber": 42
  },
  "rootCommentId": null,
  "parentCommentId": null
}
```
