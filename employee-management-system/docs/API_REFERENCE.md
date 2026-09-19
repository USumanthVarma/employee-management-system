# API Reference

Base URL: `http://localhost:8080/api`

An interactive version of this same API is always available at
`http://localhost:8080/swagger-ui.html` while the backend is running — use
it to try requests directly from the browser, JWT and all.

## Authentication

Every endpoint except `/api/auth/**` requires a JWT in the request header:

```
Authorization: Bearer <token>
```

You get a token from `/api/auth/login` or `/api/auth/register`. Tokens
expire after 24 hours by default (`app.jwt.expiration-ms`) — after that,
the API returns `401` and you need to log in again.

**Access rules** (enforced in `SecurityConfig`):

| Method | Who |
|---|---|
| `GET` | any authenticated user (`ROLE_USER` or `ROLE_ADMIN`) |
| `POST`, `PUT`, `DELETE` | `ROLE_ADMIN` only |

A `ROLE_USER` calling a write endpoint gets `403 Forbidden`. No token at
all gets `401 Unauthorized`.

---

## Auth

### `POST /api/auth/register`

Creates a new account. Always assigned `ROLE_USER` — see
[`ARCHITECTURE.md`](ARCHITECTURE.md) for why self-registered accounts
aren't admins by default.

**Request**
```json
{
  "username": "asmith",
  "email": "asmith@example.com",
  "password": "Str0ngPass!"
}
```

**Response** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "asmith",
  "role": "ROLE_USER"
}
```

**Errors**: `400` (validation — e.g. password under 6 characters), `409`
(username or email already taken).

### `POST /api/auth/login`

**Request**
```json
{ "username": "admin", "password": "Admin@123" }
```

**Response** `200 OK` — same shape as register's response.

**Errors**: `401` if the username/password pair doesn't match.

---

## Employees

All endpoints under `/api/employees`.

### `GET /api/employees`

Returns every employee.

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "firstName": "Aditi",
    "lastName": "Sharma",
    "email": "aditi.sharma@ems.com",
    "phone": "9876500001",
    "designation": "Software Engineer",
    "salary": 65000.0,
    "dateOfJoining": "2022-03-14",
    "departmentId": 1,
    "departmentName": "Engineering"
  }
]
```

### `GET /api/employees/{id}`

**Response** `200 OK` — a single employee object (shape above).
**Errors**: `404` if no employee has that id.

### `GET /api/employees/search?keyword={text}`

Case-insensitive match against first name OR last name.
`GET /api/employees/search?keyword=shar` → matches "Sharma".

**Response** `200 OK` — array of employee objects (possibly empty).

### `GET /api/employees/department/{departmentId}`

All employees in one department.

**Response** `200 OK` — array of employee objects.

### `POST /api/employees` — `ROLE_ADMIN` only

**Request**
```json
{
  "firstName": "New",
  "lastName": "Hire",
  "email": "new.hire@ems.com",
  "phone": "9876512345",
  "designation": "QA Engineer",
  "salary": 58000,
  "dateOfJoining": "2026-09-01",
  "departmentId": 1
}
```

**Response** `201 Created` — the created employee, including its new `id`.

**Errors**:
- `400` — validation failure. Response body includes `validationErrors`,
  keyed by field:
  ```json
  {
    "status": 400,
    "message": "Validation failed",
    "validationErrors": { "email": "Email must be a valid address" }
  }
  ```
- `404` — `departmentId` doesn't exist
- `409` — another employee already has that email

### `PUT /api/employees/{id}` — `ROLE_ADMIN` only

Same request/response/error shape as `POST`, but replaces an existing
record. `404` if `id` doesn't exist.

### `DELETE /api/employees/{id}` — `ROLE_ADMIN` only

**Response** `204 No Content`. **Errors**: `404` if `id` doesn't exist.

---

## Departments

All endpoints under `/api/departments`.

### `GET /api/departments`

**Response** `200 OK`
```json
[
  { "id": 1, "name": "Engineering", "location": "Bengaluru", "employeeCount": 2 }
]
```

`employeeCount` is computed by the service layer (`Department.employees.size()`)
— it's never sent by the client and is ignored if you include it in a
request body.

### `GET /api/departments/{id}`

**Response** `200 OK` — a single department object. **Errors**: `404`.

### `POST /api/departments` — `ROLE_ADMIN` only

**Request**
```json
{ "name": "Marketing", "location": "Chennai" }
```

**Response** `201 Created`. **Errors**: `400` (validation), `409` (name
already exists — case-insensitive).

### `PUT /api/departments/{id}` — `ROLE_ADMIN` only

Same shape as `POST`. **Errors**: `400`, `404`, `409`.

### `DELETE /api/departments/{id}` — `ROLE_ADMIN` only

**Response** `204 No Content`. **Errors**: `404`.

Deleting a department also deletes its employees (`cascade = ALL,
orphanRemoval = true` on `Department.employees` — see
[`ARCHITECTURE.md`](ARCHITECTURE.md)). The frontend warns you about the
headcount before confirming a delete for exactly this reason.

---

## Error response shape

Every non-2xx response from the API has the same shape
(`GlobalExceptionHandler` / `ErrorResponse`):

```json
{
  "timestamp": "2026-09-13T10:15:30",
  "status": 404,
  "error": "Not Found",
  "message": "No employee found with id: 999",
  "path": "/api/employees/999",
  "validationErrors": null
}
```

`validationErrors` is only populated for `400`s caused by
`@Valid` failures; it's omitted (not just `null`) from the JSON otherwise.

## Status code summary

| Code | Meaning here |
|---|---|
| 200 | Successful GET/PUT/login |
| 201 | Resource created (POST) |
| 204 | Successful DELETE (no body) |
| 400 | Bean validation failed |
| 401 | Missing/invalid/expired JWT, or wrong login credentials |
| 403 | Valid JWT, but the role doesn't allow this action |
| 404 | No resource with that id |
| 409 | Uniqueness conflict (email, username, or department name) |
| 500 | Unhandled server error |
