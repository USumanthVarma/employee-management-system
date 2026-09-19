# EMS Frontend

React (Vite) single-page app for the Employee Management System. See the
project root [README.md](../README.md) for full setup instructions and
[docs/](../docs) for architecture and API reference.

## Quick start

```bash
npm install
cp .env.example .env    # adjust VITE_API_BASE_URL if the backend isn't on localhost:8080
npm run dev             # http://localhost:5173
```

## Scripts

| Command           | Purpose                              |
|--------------------|---------------------------------------|
| `npm run dev`      | Start the Vite dev server with HMR    |
| `npm run build`    | Production build to `dist/`           |
| `npm run preview`  | Serve the production build locally    |
| `npm run lint`     | Run oxlint over `src/`                 |

## Structure

```
src/
├── api/          axios wrappers for each backend resource (auth, employees, departments)
├── context/      AuthContext - holds the JWT + user, exposes login()/logout()
├── components/   Sidebar, ProtectedRoute
├── pages/        one component per route (Dashboard, EmployeeList, EmployeeForm, ...)
├── App.jsx       route table
└── index.css     design tokens + all styling (no CSS-in-JS, no component libraries)
```
