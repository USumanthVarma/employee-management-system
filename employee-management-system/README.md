# Employee Management System

A full-stack capstone project built for the *Full Stack Java, JavaScript
Development & DSA* course. It's a small internal tool for managing
employees and departments — the kind of CRUD-plus-auth application that
shows up in almost every enterprise Java job — built with a Spring Boot
REST API and a React frontend.

**Stack:** Java 21 · Spring Boot 3.5 · Spring Security (JWT) · Spring Data
JPA / Hibernate · MySQL (or H2) · React 19 (Vite) · React Router · Axios ·
Docker

See [`docs/CURRICULUM_MAPPING.md`](docs/CURRICULUM_MAPPING.md) for exactly
which day/module of the course each part of this project corresponds to.

---

## Features

- **Auth** — register/login, JWT issued on success, stateless sessions
- **Role-based access** — `ROLE_ADMIN` can create/edit/delete; `ROLE_USER`
  is read-only; enforced both in the API (Spring Security) and in the UI
- **Employees** — CRUD, search by name, filter by department
- **Departments** — CRUD, with a live headcount per department
- **Validation** — bean validation on the backend (`@NotBlank`, `@Email`,
  ...), surfaced as field-level errors in the React forms
- **API docs** — interactive Swagger UI, no frontend required to explore it
- **Tests** — JUnit 5 + Mockito service test, a MockMvc controller test
- **Docker** — one `docker compose up` brings up MySQL + backend + frontend

---

## Project structure

```
employee-management-system/
├── backend/                  Spring Boot REST API
│   ├── src/main/java/com/ems/
│   │   ├── config/            Security + OpenAPI configuration
│   │   ├── controller/        REST endpoints
│   │   ├── dto/                Request/response objects + validation rules
│   │   ├── entity/             JPA entities (Employee, Department, User, Role)
│   │   ├── exception/          Custom exceptions + global @RestControllerAdvice
│   │   ├── repository/         Spring Data JPA repositories
│   │   ├── security/           JWT filter, JwtUtil, UserDetailsService
│   │   └── service/            Interfaces + implementations (business logic)
│   ├── src/main/resources/     application*.properties, data.sql
│   ├── src/test/               JUnit 5 / Mockito / MockMvc tests
│   └── Dockerfile
├── frontend/                  React (Vite) single-page app
│   ├── src/api/                axios wrappers per resource
│   ├── src/context/            AuthContext (JWT + role, in memory + localStorage)
│   ├── src/pages/               one component per route
│   └── Dockerfile + nginx.conf
├── database/
│   └── schema.sql              Reference DDL/DML/joins/views/stored procedures
├── docs/
│   ├── API_REFERENCE.md         Every endpoint, with example requests/responses
│   ├── ARCHITECTURE.md          Layered design, security flow, design decisions
│   └── CURRICULUM_MAPPING.md    Course day/module -> file in this repo
└── docker-compose.yml
```

---

## Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| JDK | 21+ | building/running the backend |
| Maven | 3.9+ (or use the Maven wrapper if you add one) | building the backend |
| Node.js | 20+ | building/running the frontend |
| MySQL | 8.0+ | the default database profile (optional — see below) |
| Docker | any recent version | the one-command setup (optional) |

You do **not** need MySQL installed to try this out — see the H2 option
below.

---

## Quick start

### Option A — Docker Compose (easiest)

```bash
docker compose up --build
```

This starts MySQL, the backend (on `:8080`), and the frontend (on
`:5173`). Wait for the `ems-mysql` healthcheck to pass before the backend
finishes starting (compose handles the ordering for you).

- Frontend: http://localhost:5173
- Swagger UI: http://localhost:8080/swagger-ui.html

### Option B — Run locally against MySQL

1. Create a MySQL user/password you're happy with (or use `root`/`root`
   for local dev — that's the default the app assumes).
2. Start the backend:

   ```bash
   cd backend
   # optional: export DB_USERNAME=root DB_PASSWORD=root JWT_SECRET=...
   mvn spring-boot:run
   ```

   The schema is created automatically (`ddl-auto=create-drop`) and
   `data.sql` seeds a couple of departments, employees, and two demo
   logins every time the app starts. See
   [`backend/src/main/resources/application-mysql.properties`](backend/src/main/resources/application-mysql.properties)
   for how to switch to persistent data once you're past the demo stage.

3. Start the frontend:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

   Open http://localhost:5173.

### Option C — Run locally with zero install (H2, in-memory)

No MySQL required — everything lives in memory and resets each restart.

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

Then start the frontend the same way as Option B, step 3. The H2 console
(if you want to poke at the tables directly) is at
http://localhost:8080/h2-console — JDBC URL `jdbc:h2:mem:ems_db`, user
`sa`, blank password.

---

## Demo logins

Seeded by `data.sql` on every startup:

| Username | Password | Role | Can do |
|---|---|---|---|
| `admin` | `Admin@123` | `ROLE_ADMIN` | Everything (read + create/edit/delete) |
| `jdoe` | `User@123` | `ROLE_USER` | Read-only |

You can also register a new account from the UI — self-registration
always creates a `ROLE_USER` account (see `AuthServiceImpl`).

---

## Running the tests

```bash
cd backend
mvn test
```

This runs the H2-backed test slice (`src/test/resources/application.properties`
points at an in-memory database, so `mvn test` never touches MySQL):

- `EmployeeServiceImplTest` — Mockito unit test of the service layer
  (duplicate-email checks, missing-department checks, DTO mapping)
- `EmployeeControllerTest` — MockMvc slice test of request/response
  mapping and bean validation

---

## Environment variables

| Variable | Default | Used by |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `mysql` | backend — `mysql` or `h2` |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/ems_db...` | backend |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `root` | backend |
| `JWT_SECRET` | a demo value baked into `application.properties` | backend — **override this for anything beyond local demo use** |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | backend |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | frontend |

---

## Further reading

- [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) — every endpoint, with
  example requests/responses and status codes
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layered design, the JWT
  request flow, and why a few specific version/library choices were made
- [`docs/CURRICULUM_MAPPING.md`](docs/CURRICULUM_MAPPING.md) — maps each
  day of the 45-day syllabus to the file(s) in this repo that demonstrate it

## Where to go from here

This covers Modules 1–7 of the syllabus end-to-end but stays deliberately
single-service. Natural next steps, if you want to push further (Module
7's "Microservices Architecture" topic):

- Split into `employee-service` / `department-service` with their own
  databases, and have them talk over REST or a message broker
- Add pagination to `GET /api/employees` once the dataset is large
- Add refresh tokens (access tokens currently just expire after 24h and
  require logging in again)
- Wire up CI (GitHub Actions: `mvn test` + `npm run build` on every push)
