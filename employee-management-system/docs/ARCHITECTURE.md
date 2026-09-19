# Architecture

## Layered backend design

Each request flows through the same four layers in one direction only —
a controller never touches a repository directly, and a repository never
knows a DTO exists:

```
HTTP request
   │
   ▼
Controller        @RestController - maps URLs to Java methods, applies @Valid
   │                (AuthController, EmployeeController, DepartmentController)
   ▼
Service           interface + impl - business rules live here: duplicate
   │                checks, "does this department exist", entity <-> DTO mapping
   │                (EmployeeService / EmployeeServiceImpl, ...)
   ▼
Repository        Spring Data JPA - just data access, no logic
   │                (EmployeeRepository extends JpaRepository<Employee, Long>)
   ▼
Database          MySQL or H2
```

Why bother with this split for a project this size? Because it's the
shape every real Spring Boot codebase takes, and each layer is
independently testable: `EmployeeServiceImplTest` mocks the repositories
and never touches a database; `EmployeeControllerTest` mocks the service
and never touches business logic. That's also why controllers never
return entities directly — see "DTOs, not entities" below.

## Data model

```
┌───────────────┐          ┌───────────────┐
│  Department   │ 1      * │   Employee    │
│───────────────│──────────│───────────────│
│ id            │          │ id            │
│ name (unique) │          │ firstName     │
│ location      │          │ lastName      │
└───────────────┘          │ email (unique)│
                            │ phone         │
                            │ designation   │
                            │ salary        │
                            │ dateOfJoining │
                            │ department_id │──▶ FK
                            └───────────────┘

┌───────────────┐
│     User      │   Deliberately separate from Employee: not every
│───────────────│   employee needs a login, and this table only exists
│ id            │   to answer "who can log in and what can they do".
│ username      │
│ email         │
│ password (BCrypt hash)
│ role (ROLE_ADMIN | ROLE_USER)
└───────────────┘
```

`Department.employees` is the inverse side of the relationship
(`mappedBy = "department"`) with `cascade = ALL, orphanRemoval = true` —
deleting a department deletes its employees along with it. That's a
deliberate choice for this size of app (see `DepartmentController`'s
`DELETE`); a larger system would more likely block the delete instead and
make the caller reassign employees first.

## JWT request flow

```
1. POST /api/auth/login {username, password}
        │
        ▼
   AuthServiceImpl.login()
        │  delegates to Spring Security's AuthenticationManager, which
        │  calls CustomUserDetailsService to load the user and checks
        │  the password with BCryptPasswordEncoder
        ▼
   JwtUtil.generateToken(username, role)
        │  signs a token: subject=username, claim "role"=ROLE_ADMIN/ROLE_USER,
        │  24h expiry, HMAC-SHA signed with app.jwt.secret
        ▼
   { "token": "...", "username": "...", "role": "..." }  →  stored by the
                                                             React app in
                                                             localStorage

2. Any later request:  Authorization: Bearer <token>
        │
        ▼
   JwtAuthFilter (runs once per request, before Spring's own checks)
        │  no/malformed header → passes through unauthenticated
        │  valid header → extracts username, loads UserDetails, and if
        │  the token is valid, populates SecurityContextHolder
        ▼
   SecurityConfig's authorizeHttpRequests rules
        │  GET  → authenticated() is enough
        │  POST/PUT/DELETE → hasRole("ADMIN") required
        ▼
   Controller method runs (or Spring returns 401/403 first)
```

Sessions are stateless (`SessionCreationPolicy.STATELESS`) — nothing is
stored server-side between requests. Every request re-proves who it is
via the token, which is what makes the backend easy to scale
horizontally later (any instance can handle any request).

## DTOs, not entities

Controllers and services pass `EmployeeDTO`/`DepartmentDTO` across the
wire, never the JPA `Employee`/`Department` entities themselves. Three
reasons:

1. **Validation lives on the DTO** (`@NotBlank`, `@Email`, ...) — those
   annotations describe "what a valid request looks like", which is a
   different concern from "what a database row looks like".
2. **Avoids Hibernate lazy-loading surprises.** `Employee.department` is
   `FetchType.LAZY`; serializing the entity directly outside a
   transaction is a classic `LazyInitializationException` waiting to
   happen. Mapping to a flat DTO (`departmentId` + `departmentName`)
   inside the service, while the transaction is still open, sidesteps
   the whole problem.
3. **Decouples the API shape from the schema.** The database can gain a
   column tomorrow without every API consumer breaking.

The mapping itself is written by hand (`toDTO(...)` private methods in
each service impl) rather than via a library like MapStruct — for a
project this size, explicit mapping is easier to read and to debug, and
one less annotation processor to reason about.

## Frontend structure

React Router's declarative API (`<BrowserRouter>`, `<Routes>`, `<Route>`)
guards routes with a single `<ProtectedRoute>` wrapper that checks
`AuthContext`; `adminOnly` routes (the create/edit forms) redirect
non-admins back to the dashboard. This is a UX convenience only — the
backend enforces the same rule independently in `SecurityConfig`, so
there's no security relying on the frontend behaving.

`AuthContext` is the one piece of global state: it holds the decoded
login response (`token`, `username`, `role`) in memory and mirrors it to
`localStorage` so a page refresh doesn't log you out. Everything else
(employee lists, form state) is local `useState` inside the page that
needs it — there's no Redux/Zustand/etc. here, deliberately, since a
handful of CRUD pages doesn't need a global store.

## A few version/library decisions worth explaining

- **Spring Boot 3.5.16, not 4.x.** Spring Boot 4.0 (GA'd November 2025)
  is a genuine major version with well over a hundred documented breaking
  changes (Jackson 2 → 3, Hibernate 7, a Spring Security DSL rewrite, and
  more). 3.5.16 is the final, most mature release of the 3.x line — the
  APIs used throughout this codebase (the `SecurityFilterChain` lambda
  DSL, `jakarta.*` imports, standard Hibernate 6 behavior) are what
  you'll find in the overwhelming majority of current tutorials, Stack
  Overflow answers, and course material. If/when you outgrow this and
  want to track the latest release, Spring's own [4.0 migration
  guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide)
  is the right next stop.
- **`react-router-dom`, not the newer `react-router` package name.**
  React Router v8 (June 2026) dropped the `react-router-dom` package
  entirely in favor of importing from `react-router` directly. This
  project pins to the actively-maintained `react-router-dom` 7.x line,
  which still ships the classic `<BrowserRouter>/<Routes>/<Route>` API
  used here.
- **`ddl-auto=create-drop`, not `update`.** Every restart rebuilds the
  schema and re-runs `data.sql` — predictable while you're learning or
  demoing, at the cost of not persisting data across restarts. Switch to
  `update` (and turn off `data.sql` re-seeding) once that trade-off stops
  making sense for you; see the comments in
  `application-mysql.properties`.
- **BCrypt via Spring Security's `BCryptPasswordEncoder`**, not a custom
  hashing scheme — it salts automatically and is the standard,
  well-audited choice for password storage in the Spring ecosystem.
