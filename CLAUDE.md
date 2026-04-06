# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CAD (Computer-Aided Dispatch) is a web-based incident and unit dispatch management system for municipal citizen security centers. It's a **frontend-only React application** powered by Firebase for authentication and real-time data.

### Key Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Maps**: Leaflet + OpenStreetMap
- **Routing**: React Router v7
- **Styling**: CSS

## Common Development Commands

All commands should be run from `/home/user/CAD2/frontend`:

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Type check only
tsc -b

# Lint code with ESLint
npm run lint

# Preview production build locally
npm run preview
```

## Architecture Overview

### High-Level Design

The app follows a **service-oriented architecture with React hooks**:

1. **Services Layer** (`src/services/`) - Direct Firebase interactions
   - `auth.ts` - Firebase Authentication (sign in, sign out, user profiles)
   - `incidents.ts` - Incident CRUD and queries
   - `units.ts` - Unit status and location tracking
   - `eventLogs.ts` - Immutable audit logs for incidents
   - `ai.ts` - AI integration services

2. **Custom Hooks** (`src/hooks/`) - State management & async logic
   - `useAuth()` - Authentication context provider and hook; provides `user`, `profile`, `loading`, `error`, `login()`, `logout()`
   - `useIncidents()` - Real-time incident subscriptions and mutations
   - `useUnits()` - Real-time unit subscriptions and status updates

3. **Pages** (`src/pages/`) - Role-based route components
   - `Dashboard.tsx` - OPERADOR (dispatcher) main interface
   - `Admin.tsx` - ADMIN user management and system config
   - `Patrullero.tsx` - PATRULLERO (patrol unit) mobile interface
   - `Supervisor.tsx` - SUPERVISOR incident oversight (appears unused)
   - `Login.tsx` - Authentication entry point

4. **Components** (`src/components/`) - Reusable UI elements
   - Individual reusable React components used across pages

5. **Types** (`src/types/index.ts`) - TypeScript domain models
   - `Incident`, `IncidentStatus`, `IncidentPriority`, `IncidentType`
   - `Unit`, `UnitStatus`, `UnitType`
   - `AppUser`, `UserRole`
   - `EventLog`, `EventLogType`
   - Constants like `INCIDENT_TYPE_OPTIONS`, `PRIORITY_OPTIONS`

6. **Config** (`src/config/firebase.ts`) - Firebase initialization
   - Initializes Firebase app, auth, and Firestore instances

### Data Model

**Firestore Collections:**
- `incidents` - Each incident with type, priority, status, location, assigned units
- `units` - Vehicle/resource with status, type, location, radio callsign
- `users` - Operator/admin/patrol user profiles with roles
- `eventLogs` - Immutable audit trail of all incident modifications

**Key Relations:**
- Incidents reference units via `assignedUnits: string[]` array
- EventLogs reference incidents via `incidentId`
- All documents use `Timestamp` for `createdAt`/`updatedAt`

### Role-Based Access

Three user roles with different views:
- **OPERADOR** - Dispatcher; creates incidents, assigns units, manages dispatch (`/`)
- **ADMIN** - System admin; manages users and configurations (`/admin`)
- **PATRULLERO** - Patrol officer; views assigned incidents, updates location (`/patrulla`)

The `App.tsx` defines role-gated routes using `RoleRoute` component; unauthorized roles are redirected to their default page.

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All domain types; constants for UI dropdowns |
| `src/hooks/useAuth.tsx` | Auth context provider; handles Firebase auth state |
| `src/services/auth.ts` | Firebase auth functions (sign in, get profile, etc.) |
| `src/services/incidents.ts` | Create, update, subscribe to incidents |
| `src/services/units.ts` | Unit status tracking and queries |
| `src/App.tsx` | Main routing and role-based access control |
| `firebase.json` | Firebase project config for hosting/functions |
| `firestore.rules` | Firestore security rules |

## Testing & Linting

```bash
# No existing test runner configured (Jest, Vitest, etc.)

# ESLint validation
npm run lint

# TypeScript type checking
tsc -b
```

## Firebase Setup

- **Project ID**: `cad-seguridad-municipal`
- **Auth Domain**: `cad-seguridad-municipal.firebaseapp.com`
- **Firestore Rules**: Defined in `firestore.rules`
- **Hosting**: Deployed to `https://cad-seguridad-municipal.web.app`

Firebase credentials are embedded in `src/config/firebase.ts`. No environment variables are used.

### Local Firebase Emulator

To use local Firebase emulators (from project root):
```bash
npx firebase-tools emulators:start
```

## Important Patterns

### Real-Time Data with onSnapshot
Services use Firebase's `onSnapshot()` to provide real-time subscriptions. Hooks wrap these and manage cleanup.

### Error Handling in Auth
The `useAuth` hook catches Firebase auth errors and translates them to user-friendly Spanish messages.

### Firestore Timestamps
All date fields use Firebase `Timestamp` type, not JavaScript `Date`. Convert with `.toDate()` when needed.

### Service Functions Pattern
Services are pure functions that operate on Firestore, not class instances. They're imported directly where needed.

### Role-Based Routing
Protected routes use the `RoleRoute` wrapper component that checks `profile.role` against allowed roles.

## Development Tips

- **TypeScript**: Strict mode enabled. Domain types in `src/types/index.ts` are the source of truth.
- **Hooks vs Services**: Use hooks for component state and subscriptions; use services for one-off data operations.
- **Spanish Naming**: Most UI text, error messages, and comments are in Spanish.
- **Component Styling**: Each page component has a corresponding `.css` file with the same name.
- **Firestore Queries**: Services use Firebase SDK queries (e.g., `where()`, `orderBy()`) for filtering.

## Deployment

```bash
# Build
npm run build

# Deploy to Firebase Hosting (from project root)
npx firebase-tools deploy --only hosting
```

Build output goes to `frontend/dist/`.
