# RETRO_TASK API Reference Manual

Welcome to the REST API reference for **RETRO_TASK**. All endpoints are prefixed with `/api/` and output JSON payloads.

---

## Authentication Mechanism

Authentication is handled via **JSON Web Tokens (JWT)**.
Upon registering or logging in, the API issues an `access` token (60-minute validity) and a `refresh` token (7-day validity).

Include the access token in the `Authorization` header for all protected endpoints:
```http
Authorization: Bearer <your_access_token>
```

---

## Endpoints Summary

### 1. Authentication Endpoints

#### `POST /api/auth/register/`
Create a new user account and obtain initial JWT tokens.

- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "cyber_pilot",
    "email": "pilot@retro.com",
    "password": "Password123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "user": {
      "id": 1,
      "username": "cyber_pilot",
      "email": "pilot@retro.com"
    },
    "access": "eyJhbGciOiJIUzI1Ni...",
    "refresh": "eyJhbGciOiJIUzI1Ni...",
    "message": "User registered successfully."
  }
  ```

#### `POST /api/auth/login/`
Authenticate user credentials and receive JWT access & refresh tokens.

- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "cyber_pilot",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1Ni...",
    "refresh": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "username": "cyber_pilot",
      "email": "pilot@retro.com"
    }
  }
  ```

#### `POST /api/auth/refresh/`
Obtain a new access token using a valid refresh token.

- **Access**: Public
- **Request Body**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

---

### 2. Task Endpoints (JWT Required)

Users can strictly read, create, update, and delete **their own tasks**. Requests targeting another user's task ID will receive `404 Not Found` or `403 Forbidden`.

#### `GET /api/tasks/`
List all tasks belonging to the authenticated user. Supports filtering, searching, and sorting.

- **Access**: JWT Required
- **Query Parameters**:
  - `status`: Filter by status (`todo`, `in_progress`, `done`)
  - `priority`: Filter by priority (`low`, `medium`, `high`)
  - `search`: Search substring in `title` or `description`
  - `due_before`: Date ISO format (`YYYY-MM-DD`)
  - `due_after`: Date ISO format (`YYYY-MM-DD`)
  - `ordering`: Field name (`due_date`, `-due_date`, `created_at`, `-created_at`, `title`, `priority`)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "title": "Refactor DRF Serializers",
      "description": "Ensure clean field validation and past date checks.",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2026-08-01",
      "owner": "cyber_pilot",
      "created_at": "2026-07-24T01:25:00Z",
      "updated_at": "2026-07-24T01:30:00Z"
    }
  ]
  ```

#### `POST /api/tasks/`
Create a new task.

- **Access**: JWT Required
- **Validation Rules**:
  - `title` is required and cannot be empty or whitespace only.
  - `due_date` cannot be in the past on creation.
- **Request Body**:
  ```json
  {
    "title": "Deploy to Vercel",
    "description": "Build production bundle and attach backend URL env var.",
    "status": "todo",
    "priority": "high",
    "due_date": "2026-08-10"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": 2,
    "title": "Deploy to Vercel",
    "description": "Build production bundle and attach backend URL env var.",
    "status": "todo",
    "priority": "high",
    "due_date": "2026-08-10",
    "owner": "cyber_pilot",
    "created_at": "2026-07-24T01:35:00Z",
    "updated_at": "2026-07-24T01:35:00Z"
  }
  ```

#### `GET /api/tasks/{id}/`
Retrieve task detail by ID.

- **Access**: JWT Required (Task Owner Only)
- **Response `200 OK`** or **`404 Not Found`**

#### `PUT /api/tasks/{id}/`
Full update of a task.

- **Access**: JWT Required (Task Owner Only)
- **Response `200 OK`**

#### `PATCH /api/tasks/{id}/`
Partial update of a task (e.g. quick status toggle).

- **Access**: JWT Required (Task Owner Only)
- **Request Body**:
  ```json
  {
    "status": "done"
  }
  ```
- **Response `200 OK`**

#### `DELETE /api/tasks/{id}/`
Delete a task by ID.

- **Access**: JWT Required (Task Owner Only)
- **Response `204 No Content`**
