# Curriculum Mapping

Where each part of the 45-day syllabus shows up in this repository — and
where it honestly doesn't, since a single CRUD application can't be a
1:1 substitute for every topic (DSA practice and multithreading in
particular are separate tracks, not something a REST API naturally
exercises). Use this as a map back and forth between the syllabus and
real code, not as a replacement for either.

## Module 1 — Java Programming Fundamentals (Days 1–7)

| Day | Topic | Where |
|---|---|---|
| 1 | Program structure, JVM/JDK | `EmsApplication.java` — the `main` method Spring Boot boots from |
| 2 | Variables, data types, operators | Field declarations throughout every entity/DTO |
| 3 | Decision making & loops | `EmployeeServiceImpl` (`if` duplicate-checks), stream loops everywhere |
| 4 | Arrays & strings | `String` fields + validation (`EmployeeDTO`), `Employee[]`-shaped JSON arrays over HTTP |
| 5 | Methods & recursion | Methods throughout; **no recursion** — a CRUD service has no natural use for it, so keep that practice separate (tree/graph problems in Module 3 are where it belongs) |
| 6 | OOP (class, object, inheritance, polymorphism, abstraction, encapsulation) | Encapsulation: private fields + Lombok-generated accessors on every entity. Abstraction/polymorphism: `EmployeeService` interface with `EmployeeServiceImpl` as one implementation — a test or a future alternate implementation can swap in transparently |
| 7 | Exception handling, packages, best practices | `exception/` package in full: `ResourceNotFoundException`, `DuplicateResourceException`, `GlobalExceptionHandler` |

## Module 2 — Advanced Java (Days 8–12)

| Day | Topic | Where |
|---|---|---|
| 8 | Collections framework | `List<EmployeeDTO>` return types everywhere, `Map<String,String>` for validation errors, `Optional<Employee>` from repositories |
| 9 | Generics, Comparable, Comparator | `JpaRepository<Employee, Long>` (Spring Data's generic repository); no custom `Comparator` was needed here, but `EmployeeRepository` is the natural place to add `findAll(Sort.by(...))` if you want to practice one |
| 10 | Multithreading & Executor framework | **Not directly exercised.** Spring MVC handles one thread per request under the hood, but the application code itself is single-threaded business logic — this topic is genuinely separate from a CRUD app and worth practicing standalone |
| 11 | Streams API, lambdas, functional programming | Every service's `list.stream().map(this::toDTO).collect(Collectors.toList())`; method references (`this::toDTO`) throughout |
| 12 | JDBC & file handling | Spring Data JPA is the modern abstraction over JDBC (see `EmployeeRepository`); `database/schema.sql` shows the raw SQL underneath it |

## Module 3 — Advanced DSA & Problem Solving (Days 13–22)

This module (complexity analysis, searching/sorting, stacks/queues,
linked lists, trees/BSTs, heaps, hashing, graphs, greedy, DP) is
algorithm practice, not application code — it doesn't map onto a
business CRUD app in any honest way, and forcing it in would mean adding
contrived, unused algorithm classes just to tick a box. Keep this as its
own track (the syllabus's own "100+ Coding Problems / HackerRank /
LeetCode" hands-on block is the right place for it). If it would help,
ask and a separate set of DSA practice problems — in Java, with test
cases — can be put together the same way this project was.

## Module 4 — Database & Backend (Days 23–27)

| Day | Topic | Where |
|---|---|---|
| 23 | DBMS & SQL basics | `database/schema.sql` |
| 24 | DDL, DML | Same file — `CREATE TABLE`, `INSERT`/`UPDATE`/`DELETE` sections |
| 25 | Joins, views, functions, stored procedures | Same file — `department_summary` view, `GetEmployeesByDepartment` procedure, `TotalPayroll` function |
| 26 | JDBC integration | `application-mysql.properties` + every `*Repository` interface |
| 27 | Mini backend project | The whole `backend/` folder |

## Module 5 — Front-End Development (Days 28–33)

| Day | Topic | Where |
|---|---|---|
| 28–29 | HTML5, CSS3 | `frontend/index.html`, `frontend/src/index.css`. Plain CSS with custom properties was used instead of Bootstrap, so the styling is hand-written rather than a component-kit default — worth comparing against a Bootstrap version if the course specifically wants that practice |
| 30 | JavaScript basics, DOM programming | Every `.jsx` file is JavaScript; React abstracts direct DOM calls, but form handling (`onChange`, `onSubmit`) is the DOM-events layer underneath |
| 31–32 | ES6 features, React components | Arrow functions, destructuring, template literals, and ES modules throughout; components in `frontend/src/pages/` and `frontend/src/components/` |
| 33 | React Hooks & API integration | `useState`/`useEffect`/`useContext` throughout; `frontend/src/api/` for the integration layer (axios) |

## Module 6 — Spring Boot & REST APIs (Days 34–38)

| Day | Topic | Where |
|---|---|---|
| 34–35 | Spring Core & DI, Boot architecture, Maven | `backend/pom.xml`; constructor injection via `@RequiredArgsConstructor` everywhere (e.g. `EmployeeController` receiving `EmployeeService`) |
| 36 | REST API development | `controller/` package |
| 37 | Spring Data JPA & Hibernate | `entity/`, `repository/` |
| 38 | Spring Security & JWT authentication | `security/` (`JwtUtil`, `JwtAuthFilter`, `CustomUserDetailsService`) + `config/SecurityConfig.java` |

## Module 7 — Microservices, Testing & Deployment (Days 39–43)

| Day | Topic | Where |
|---|---|---|
| 39 | Microservices architecture | **Not implemented** — this is one service by design (see `docs/ARCHITECTURE.md`'s "Where to go from here"). Splitting `EmployeeService`/`DepartmentService` into two independently-deployable services with their own databases is a well-scoped follow-on exercise once this version is solid |
| 40 | REST client / API integration | `frontend/src/api/*.js` — axios is exactly a "REST client" from the JS side |
| 41 | Unit testing (JUnit 5 & Mockito) | `backend/src/test/` — `EmployeeServiceImplTest` (Mockito), `EmployeeControllerTest` (MockMvc) |
| 42 | Logging, exception handling, Docker | Exception handling: `GlobalExceptionHandler`. Docker: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`. (Logging uses Spring Boot's default SLF4J/Logback setup — nothing custom was added; a good next step is swapping in structured JSON logs if you want to practice that specifically) |
| 43 | Full stack enterprise project | The entire repository |

## Module 8 — Capstone, Assessments & Placement Readiness (Days 44–45)

| Day | Topic | Where |
|---|---|---|
| 44 | Git, GitHub, debugging | Both `backend/` and `frontend/` ship their own `.gitignore` — `git init`, commit, and push to GitHub as-is |
| 45 | Project presentation, viva, interview prep | See below |

### Likely viva / interview questions this project sets you up for

- **"Why did you use DTOs instead of returning entities directly?"** —
  validation belongs on the request shape, not the schema; and it avoids
  `LazyInitializationException` on `Employee.department`. Full answer in
  `docs/ARCHITECTURE.md`.
- **"Walk me through what happens when a request comes in with a JWT."**
  — `JwtAuthFilter` runs once per request, reads `Authorization: Bearer
  ...`, and populates `SecurityContextHolder` before Spring Security's
  own authorization rules run. Diagram in `docs/ARCHITECTURE.md`.
- **"Why is the session stateless? What would you have to change to
  make it stateful?"** — no server-side session store; every request
  re-proves identity via the token, which is what lets you run multiple
  backend instances behind a load balancer without sticky sessions.
- **"How would you stop two employees from ever sharing an email?"** —
  a unique constraint at the database level (`@Column(unique = true)`)
  *and* an explicit `existsByEmail` check in the service layer, so the
  API returns a clean `409` instead of leaking a raw SQL constraint
  violation to the client.
- **"What happens if you delete a department that still has
  employees?"** — cascading delete (`orphanRemoval = true`), by design
  for this app's size; be ready to argue the alternative (block the
  delete, force reassignment first) for a larger system.
- **"How is `admin` different from a self-registered account?"** — only
  the seeded `admin` user is `ROLE_ADMIN`; `AuthServiceImpl.register()`
  hardcodes `ROLE_USER` for anyone who signs up, so privilege escalation
  isn't just "sign up and claim to be an admin."
