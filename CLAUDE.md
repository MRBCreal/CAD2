# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**CAD2** is a Computer-Aided Dispatch (CAD) web application for municipal security citizen centers. It provides real-time incident management, unit dispatch, and administrative dashboards for multiple user roles.

Single frontend project: React + Vite frontend with Firebase backend (Firestore, Authentication, Hosting).

## Quick Start

### Development
```bash
cd frontend
npm install
npm run dev                    # Vite dev server on port 5173
npm run lint                   # Run ESLint
npm run build                  # Production build
```

### Firebase (Local/Remote)
```bash
# Local emulators (from project root)
npx firebase-tools emulators:start

# Deploy to Firebase Hosting (from project root)
npm run build --workspace frontend
firebase deploy --only hosting
```

## Project Structure

```
CAD2/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── pages/            # Views: Login, Dashboard, RolePages (Operator, Admin, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom hooks (useAuth, useIncidents, useUnits)
│   │   ├── services/         # Firebase API layer (auth, incidents, units, eventLogs)
│   │   ├── types/            # TypeScript interfaces (User, Incident, Unit, EventLog)
│   │   ├── config/           # Firebase configuration
│   │   ├── assets/           # Static assets
│   │   └── main.tsx          # Entry point
│   ├── vite.config.ts        # Vite configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json
├── firebase.json             # Firebase project config (Hosting, Firestore, Auth)
├── .firebaserc               # Firebase CLI project alias
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore composite indexes
└── README.md
```

## Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend Framework** | React 19 + Vite |
| **Language** | TypeScript 5.9 |
| **Routing** | React Router v7 |
| **Maps** | Leaflet + OpenStreetMap |
| **State** | Firebase SDK (real-time listeners) |
| **Authentication** | Firebase Authentication (email/password) |
| **Database** | Cloud Firestore (real-time) |
| **Hosting** | Firebase Hosting |
| **Build Tools** | Vite, ESLint |

## Architecture & Data Model

### User Roles
- **Operator** (`operador`) — dispatch incidents, assign units
- **Supervisor** (`supervisor`) — oversee operations, review incidents
- **Admin** (`admin`) — manage users, organizations, system settings
- **Patrullero** (`patrullero`) — field responder, update unit status

### Firestore Collections

**`incidents`** — Each incident has:
- `id`, `type`, `priority`, `status`, `address`, `coordinates` (Leaflet map support)
- `assignedUnits` (array of unit IDs)
- `createdAt`, `updatedAt`, `createdBy`

**`units`** — Resource vehicles/staff:
- `id`, `type`, `radioCode`, `status`, `location`
- `crewMembers`, `availability`

**`users`** — System users:
- `uid`, `email`, `role`, `organization`, `status`
- `createdAt`, `lastLogin`

**`eventLogs`** — Immutable audit trail:
- `id`, `userId`, `action`, `resourceType`, `resourceId`, `timestamp`
- Used for compliance/investigation

### Real-Time Features
- Firestore listeners in `useIncidents` / `useUnits` hooks provide live updates
- Admin/Supervisor dashboards update instantly when incidents change
- Unit locations broadcast to operators in real-time

## Firebase Configuration

**Project**: `cad-seguridad-municipal`
**Region**: South America (southamerica-east1)
**Auth**: Email/password only

### Key Setup Files
- `firebase.json` — Hosting, Firestore, Auth providers
- `firestore.rules` — Security rules enforce role-based access
- `firestore.indexes.json` — Composite indexes for queries

### Environment
Create `.env.local` in `frontend/` with Firebase config (if not using default):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# (typically auto-loaded from .firebaserc)
```

## Common Development Tasks

### Add a New Page/Feature
1. Create component(s) in `frontend/src/components/`
2. Create page in `frontend/src/pages/YourPage.tsx`
3. Add route in `frontend/src/main.tsx` (React Router)
4. Use existing hooks (`useAuth`, `useIncidents`) to fetch data
5. Call service methods from `frontend/src/services/` as needed

### Add Firestore Query
1. Add method to relevant service (`frontend/src/services/incidentsService.ts`, etc.)
2. Use `getFirestore()`, `collection()`, `query()` from Firebase SDK
3. Return unsubscribe function if using listener pattern
4. Call from hook and manage cleanup in `useEffect`

### Update Firestore Rules
- Edit `firestore.rules`
- Test locally with `firebase-tools emulators:start`
- Deploy with `firebase deploy --only firestore:rules`

### Deploy
```bash
# Build and deploy (from root)
cd frontend && npm run build && cd ..
firebase deploy
```

## Incident Lifecycle

1. **Created** → Operator receives report (phone, system)
2. **Assigned** → Units assigned based on type/priority/location
3. **En Ruta** → Unit status changes to enroute
4. **En Escena** → Unit at scene, incident status updates
5. **Resolved** → Incident closed, units become available
6. All transitions logged in `eventLogs` for audit trail

## Role-Based Access

- **Operator**: Create incidents, assign units, view dashboard
- **Supervisor**: View all incidents, generate reports, manage operators
- **Admin**: User management, organization settings, system config
- **Patrullero**: View assigned incidents, update own unit status

Access enforced via:
- `useAuth()` hook (checks `currentUser.role`)
- Firestore security rules (server-side enforcement)
- Route guards in React Router

## Testing & Debugging

### Local Development
- **HMR** enabled by default (Vite hot reload)
- **ESLint** run with `npm run lint`
- **Console** check browser DevTools for Firebase debug logs
- **Firestore emulator** simulate database locally

### Firebase Console
- View live data: https://console.firebase.google.com/
- Check Auth users, Firestore documents
- Monitor Cloud Firestore usage and billing

## Deployment

**Hosting**: Firebase Hosting (cad-seguridad-municipal.web.app)

**CI/CD**: GitHub Actions workflow (`.github/workflows/`) deploys on pushes to `main`

**Manual Deploy**:
```bash
firebase deploy --only hosting  # Frontend only
firebase deploy                 # All (Firestore, Auth, Hosting)
```

## Notes

- **No backend services** — Firebase provides all persistence, auth, real-time updates
- **Chilean context** — UI in Spanish; incident types and organizational structure follow Chilean municipal standards
- **Security Rules** — Firestore rules restrict direct read/write; client calls services which enforce rules
- **Event Logging** — All incident changes logged to `eventLogs` for compliance with Chilean security regulations
