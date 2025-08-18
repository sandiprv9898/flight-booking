# ✈️ Flight Booking System – Project Policy & Rule Book

## Project Overview
Flight Booking System is a **Laravel + Vue.js** based multi-step booking platform with seat selection, dynamic pricing, and admin management.  
This project follows **strict UI/UX rules**, modular coding standards, and a structured development workflow to ensure scalability, maintainability, and reliability.

---

## 🚨 CRITICAL UI/UX RULES
1. **ALWAYS use centralized UI components** (`/components/ui/`) - NO custom components outside design system.
2. **NEVER use inline styles** or custom CSS files.
3. **ONLY use Tailwind utilities** for styling.
4. **Vue components MUST follow Composition API with `<script setup>`**.
5. **Multi-step booking flow** MUST follow compact stepper UI (progress bar at top).
6. **Filters must be INLINE** (search + dropdowns in header).
7. **Seat Selection** MUST use an interactive grid layout with real-time availability.
8. **Dynamic Pricing** display rules:
   - Show base price + modifiers (seat type, time, demand).
   - Price updates in real-time when seat/option changes.
9. **Data Tables ONLY** for CRUD modules in admin (NO card grids).
10. **Consistent Input Height**: All form inputs/buttons MUST be `h-10`.
11. **Pagination Requirements (Admin)**:
    - Default: 25 rows
    - Options: 10, 25, 50, 100
    - Show range: "Showing X–Y of Z"
12. **Column Visibility Toggle**: Icon-only button above data tables.
13. **Compact Layouts**: No hero sections, no oversized headers.
14. **Booking Summary Panel**: MUST always be visible during checkout.

---

## Core Development Principles

### 1. Task Management
- **Task Division**: Break into 2–4 hour tasks
- **Task Numbering**: Use sequential format (`task-001`, `task-002`, …)
- **Subtasks Required**: Each task must have subtasks
- **Documentation**: Save in `/Docs/Tasks/`
- **Tracking**: Use TodoWrite or project board for tracking

### 2. Development Workflow (Mandatory)

#### Phase 1: Analysis & Planning
- Requirements analysis (Docs/Requirements/)
- Implementation plan
- Impact assessment (which modules/files affected)
- Dependencies list

#### Phase 2: Implementation
- Write **modular, reusable** code
- **Follow Laravel best practices** (Service Layer, Repository Pattern)
- **Follow Vue best practices** (Composable functions, Pinia store)
- Type hints for PHP functions
- Centralized error handling
- Logging in backend (`monolog`)

#### Phase 3: Testing & Validation
- Unit tests (PHPUnit for Laravel, Vitest/Jest for Vue)
- Integration tests for booking/payment APIs
- E2E tests for booking flow (Cypress)
- Minimum 80% coverage
- Fix bugs before merge

#### Phase 4: Documentation & Commit
- Add docblocks/docstrings
- Update task documentation
- Git commit referencing task
- Status report (progress + testing notes)

---

## 3. Code Quality Standards

### Laravel Standards
- Follow **PSR-12** coding style
- Use **Service Layer & Repository Pattern** (no logic in controllers)
- Use **Form Requests** for validation
- Use **Resource Classes** for API responses
- Type-hint all methods
- Keep controllers thin
- Database queries: optimize with indexes, avoid N+1

### Vue.js Standards
- Use **Composition API** with `<script setup>`
- Pinia for state management
- Centralized components under `/components/ui/`
- No direct API calls in components (use composables)
- Error/loading states handled in all views
- Proper props typing with `defineProps`

### UI/UX Standards
- Booking steps must be **compact, minimal vertical space**
- Seat maps must use **interactive grid with seat icons**
- Pricing updates shown in real-time
- Data density prioritized over large cards
- Filters/search always inline
- Responsive on all breakpoints

---

## 4. Testing Requirements

### Test Categories
- Unit tests: Functions, services, pricing engine
- Integration tests: Booking flow, seat locking
- E2E: Search → Select → Book → Pay → Confirm
- Performance tests: API response time, seat availability updates

### Standards
- Test naming: `BookingTest.php`, `useBookingFlow.spec.js`
- Mock external APIs (payments, SMS)
- Test edge cases (sold-out flights, failed payments)
- Ensure booking lock prevents double-booking seats

---

## 5. Documentation Standards

### Code Documentation
- PHP: Docblocks for all controllers/services
- Vue: JSDoc for complex functions
- Document pricing engine rules & assumptions

### Task Documentation Template
```markdown
# Task-XXX: [Task Title]

## Overview
[Brief description]

## Objectives
- [ ] Objective 1
- [ ] Objective 2

## Subtasks
1. [ ] Subtask 1
2. [ ] Subtask 2

## Implementation Details
[Technical plan]

## Testing
- Unit tests: [List files]
- Integration: [List scenarios]
- Manual steps: [Instructions]

## Results
[Outcome]

## Known Issues
[Limitations or future improvements]
