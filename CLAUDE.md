# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Last of Guss** is a browser-based multiplayer goose-tapping game where players compete to achieve the highest score during timed rounds. Players tap on an ASCII art goose that has been infected with the G-42 mutation.

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run linter
yarn lint
```

## Architecture

### State Management

**CRITICAL:** This project uses **Zustand** for state management. When adding new global state:
- Create stores in `src/store/`
- Use Zustand's `create` function with TypeScript interfaces
- Persist authentication state using the `persist` middleware (already implemented in `useAuthStore`)

Example pattern:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  // state properties
  // action methods
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // implementation
    }),
    { name: 'storage-key' }
  )
);
```

### Authentication & Authorization

The app implements a **role-based access control** system with two roles:
- **ADMIN**: Can create new rounds (via "Создать раунд" button)
- **SURVIVOR**: Regular player, can only view and participate in rounds

Authentication flow:
1. User logs in via `AuthPage` → `/api/v1/auth/login`
2. Backend returns `{ token, username, isAdmin }` (or `{ token, username, role }`)
3. Token and role stored in Zustand store with persistence
4. Protected routes check `useAuthStore` for token presence
5. Admin features conditionally rendered based on `isAdmin` flag

### API Integration

All API calls go through `src/services/api.ts`. The backend is hosted at:
- **Production**: `http://v2991160.hosted-by-vdsina.ru`
- **API Base**: `/api/v1/`

API endpoints:
- `POST /auth/login` - Authentication (returns token, username, role/isAdmin)
- `GET /rounds` - List all rounds
- `GET /rounds/:id` - Get specific round details
- `POST /rounds` - Create new round (admin only)
- `POST /rounds/:id/tap` - Submit tap for active round
- `GET /rounds/:id/stats` - Get round statistics after completion

### Routing Structure

The app uses React Router v7 with three main routes:

1. **`/` (AuthPage)**: Login/registration page
2. **`/rounds` (RoundsListPage)**: List of all rounds (active, scheduled, cooldown)
3. **`/rounds/:id` (RoundDetailPage)**: Individual round gameplay page

All routes except `/` require authentication. Users without tokens are redirected to `/`.

### Round Status Logic

Rounds have three statuses based on current time vs start/end times:

- **Запланирован (Scheduled)**: `now < startTime` - Round hasn't started
- **Активен (Active)**: `startTime <= now < endTime` - Round is live, tapping enabled
- **Cooldown**: `now >= endTime` - Round completed, stats displayed

Status is computed client-side in real-time using intervals.

### Page-Specific Patterns

**RoundsListPage:**
- Shows ALL rounds (including completed ones with "Cooldown" status)
- "Создать раунд" button visible only if `isAdmin === true`
- Clicking "Создать раунд" creates round and navigates to `/rounds/:id`
- Each round card is a clickable link to the round detail page

**RoundDetailPage:**
- Uses `setInterval` to update countdown timer every second
- Goose ASCII art is clickable only when round status is "active"
- Automatically loads stats when round completes
- Tapping is debounced with `isTapping` state to prevent double-taps

### Styling Conventions

**Multi-line className formatting** is required for readability:

```tsx
<element
  className="[Line 1: Layout & interaction basics]
    [Line 2: Visual styling (border, background, spacing)]
    [Line 3: Effects (opacity, shadows, transforms)]
    [Line 4: Transitions/animations]
    [Line 5: Hover/focus states]"
>
```

Example:
```tsx
<button
  className="block w-full cursor-pointer
    rounded-lg border border-gray-300 bg-white p-4
    shadow-sm
    transition-all duration-150
    hover:border-gray-400 hover:bg-gray-50"
>
```

Rules:
- Use multi-line format for className strings > 60 characters
- Group classes logically by purpose
- Indent continuation lines with 2 spaces

## Tech Stack

- **React 18** with TypeScript
- **React Router v7** for routing
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Vite** as build tool

## Admin Credentials (for testing)

- Username: `admin`
- Password: `pass`
