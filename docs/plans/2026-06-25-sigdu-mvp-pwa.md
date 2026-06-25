# SIGDU MVP PWA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete GovTech PWA for tracking disappearances/kidnappings in Douala, Cameroon — fully local, no backend, demable before jury/police/mayor.

**Architecture:** Vite + React 19 SPA PWA, DexieJS/IndexedDB for all persistence, Zustand for state, 4 separate RBAC spaces (Citizen/Agent/Supervisor/Admin), Leaflet for SIG maps.

**Tech Stack:** React 19, TypeScript, Vite, Vite-Plugin-PWA, TailwindCSS v4, shadcn/ui, Lucide Icons, DexieJS, Zustand, React Hook Form, Zod, Leaflet, React-Leaflet, Leaflet.MarkerCluster, Leaflet.Heat, Recharts, Sonner

---

## PHASE 1 – Project Bootstrap

### Task 1: Wipe Next.js template, init Vite PWA project

**Files:**
- Delete all Next.js files
- Create: `vite.config.ts`, `index.html`, `package.json`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts`

### Task 2: Install all deps

```bash
npm create vite@latest . -- --template react-ts --force
npm install react@19 react-dom@19
npm install zustand dexie dexie-react-hooks
npm install react-leaflet leaflet leaflet.markercluster leaflet.heat
npm install @types/leaflet @types/leaflet.markercluster
npm install react-hook-form @hookform/resolvers zod
npm install recharts sonner date-fns
npm install lucide-react clsx tailwind-merge
npm install -D vite-plugin-pwa workbox-window
npm install -D @tailwindcss/vite tailwindcss
```

---

## PHASE 2 – Core Types & Schemas

### Task 3: TypeScript types
- Create: `src/types/index.ts` — all domain types

### Task 4: Zod validation schemas
- Create: `src/schemas/index.ts` — form validation schemas

---

## PHASE 3 – Database & State

### Task 5: DexieJS database
- Create: `src/lib/database.ts` — all IndexedDB tables + migrations

### Task 6: Zustand stores
- Create: `src/stores/authStore.ts`
- Create: `src/stores/incidentStore.ts`
- Create: `src/stores/uiStore.ts`
- Create: `src/stores/alertStore.ts`

---

## PHASE 4 – Mock Data Seeder (Douala)

### Task 7: Complete seeder
- Create: `src/lib/seeder.ts` — 135 users, 100 incidents with real Douala GPS coords

---

## PHASE 5 – RBAC & Auth

### Task 8: RBAC config
- Create: `src/lib/rbac.ts` — permissions matrix per role

### Task 9: Auth pages + protected routes
- Create: `src/pages/auth/LoginPage.tsx`
- Create: `src/components/auth/ProtectedRoute.tsx`
- Create: `src/router/index.tsx`

---

## PHASE 6 – Design System

### Task 10: Design tokens + globals
- Create: `src/styles/globals.css` — CSS variables, dark/light mode

### Task 11: Core UI components
- Create: `src/components/ui/` — Button, Card, Badge, Modal, Skeleton, etc.

### Task 12: Layout components
- Create: `src/components/layout/CitizenLayout.tsx`
- Create: `src/components/layout/AgentLayout.tsx`
- Create: `src/components/layout/SupervisorLayout.tsx`
- Create: `src/components/layout/AdminLayout.tsx`

---

## PHASE 7 – Citizen Space (5 pages)

### Task 13: Citizen Home Dashboard
### Task 14: Citizen Map page (Leaflet)
### Task 15: Citizen Report Form (Disparition/Enlèvement/Retrouvé)
### Task 16: Citizen Alerts list
### Task 17: Citizen Profile/Account

---

## PHASE 8 – Agent Space (5 pages)

### Task 18: Agent Dashboard
### Task 19: Agent Incidents management
### Task 20: Agent SIG Map
### Task 21: Agent Assignments
### Task 22: Agent Investigations

---

## PHASE 9 – Supervisor Space (6 pages)

### Task 23: Supervisor Dashboard
### Task 24: Supervisor Validation
### Task 25: Supervisor Incidents
### Task 26: Supervisor Map
### Task 27: Supervisor Statistics (Recharts)
### Task 28: Supervisor Reports

---

## PHASE 10 – Admin Space (8 pages)

### Task 29: Admin Dashboard
### Task 30: Admin User Management
### Task 31: Admin Incidents
### Task 32: Admin Map + Sensitive Zones
### Task 33: Admin Reports
### Task 34: Admin Configuration + Seeder Reset
### Task 35: Admin Audit Log

---

## PHASE 11 – SIG Map Module

### Task 36: Shared map components
- Create: `src/components/map/SIGMap.tsx` — reusable map with clustering, heatmap, filters

---

## PHASE 12 – PWA

### Task 37: PWA manifest + service worker + install prompt

---

## TEST CHECKLIST (jury)
- [ ] Login as each role
- [ ] Create incident with photos + GPS
- [ ] Change workflow status
- [ ] Validate a dossier (supervisor)
- [ ] Create alert
- [ ] View map with clusters/heatmap
- [ ] Filter incidents
- [ ] Close browser → reopen → all data intact
- [ ] Reset demo data (admin)
- [ ] Install as PWA
