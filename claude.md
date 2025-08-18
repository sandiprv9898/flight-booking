# ✈️ Flight Booking System – Project Policy & Rule Book

## Project Overview
Flight Booking System is a **Laravel + Vue 3** based airline reservation platform with interactive seat selection, dynamic pricing, multi-language support, and comprehensive booking management.  
This project follows **strict UI/UX guidelines**, modular architecture patterns, and test-driven development to ensure enterprise-grade quality and user experience.

---

## 🚨 CRITICAL UI/UX RULES
1. **ALWAYS use centralized UI components** (`/components/ui/`) - NO custom components outside design system.
2. **NEVER use inline styles** or custom CSS files - ONLY TailwindCSS utilities.
3. **Vue 3 Composition API** with `<script setup>` is MANDATORY.
4. **Multi-step booking flow** MUST use compact stepper with breadcrumbs (no vertical space waste).
5. **Flight search filters** MUST be inline (airlines, stops, price, time) - NO sidebar filters.
6. **Seat Selection** requires interactive visual seat map with:
   - Color coding (available/booked/selected)
   - Real-time availability updates
   - Dynamic pricing per seat class
7. **Price Summary Sidebar** MUST be:
   - Sticky on desktop (always visible)
   - Collapsible drawer on mobile
   - Show real-time fare breakdown
8. **Flight Listings** use card/grid layout with:
   - Airline logo, duration, stops, price
   - Inline sorting (price/duration/departure)
   - Lazy loading for performance
9. **Form Standards**:
   - Input height: `h-10` (consistent)
   - Real-time validation with tooltips
   - Autocomplete for airports/cities
10. **Admin Dashboards** use data tables (NO card grids) with:
    - Pagination: 25 default (10/25/50/100 options)
    - Column visibility toggle
    - Bulk actions support
11. **Mobile-First Responsive**:
    - <768px: Compact single column
    - 768-1024px: 2-column layouts
    - >1024px: Full grid/table views
12. **NO hero sections** on functional pages - maximize information density.

---

## Core Development Principles

### 1. Task Management
- **Task Division**: Break features into 2–4 hour focused tasks
- **Task Numbering**: Sequential format (`FB-001`, `FB-002`, ...) [FB = Flight Booking]
- **Subtasks Required**: Each task must have measurable subtasks
- **Documentation**: Store in `/docs/tasks/` with status tracking
- **Progress Tracking**: Use TodoWrite for session tasks, maintain task log

### 2. Development Workflow (Mandatory)

#### Phase 1: Analysis & Planning
- Review requirements (`/docs/UI_UX_requirement.md`)
- Create implementation plan with component breakdown
- Impact assessment (affected components/APIs/stores)
- Identify external dependencies (Stripe, airport APIs)

#### Phase 2: Implementation
- **Frontend Architecture**:
  - Vue 3 Composition API with TypeScript
  - Pinia stores for state (booking, user, seat)
  - Composables for business logic
  - Centralized API client with interceptors
- **Backend Architecture**:
  - Laravel Service Layer Pattern
  - Repository Pattern for data access
  - Form Requests for validation
  - API Resources for responses
  - Queue jobs for email/notifications
- **Real-time Features**:
  - WebSocket for seat availability
  - Price updates via broadcasting
  - Session-based seat locking

#### Phase 3: Testing & Validation
- **Unit Tests**: Services, pricing engine, composables
- **Integration Tests**: Booking flow, payment processing
- **E2E Tests**: Complete user journey (search → confirmation)
- **Performance Tests**: <3s load, <300ms search results
- **Coverage Target**: 80% minimum
- **Manual Testing**: Cross-browser, mobile responsiveness

#### Phase 4: Documentation & Commit
- Add JSDoc/PHPDoc for complex functions
- Update component README files
- Semantic commits: `feat:`, `fix:`, `test:`, `docs:`
- Update task status and known issues
- **🚨 MANDATORY: After EVERY task/change → `git commit` → `git push`**

---

## 3. Code Quality Standards

### Backend Standards (Laravel)
- **Architecture Patterns**:
  - Controllers: Thin, delegate to services
  - Services: Business logic layer
  - Repositories: Data access abstraction
  - Form Requests: Input validation
  - API Resources: Response transformation
- **Database Best Practices**:
  - Migrations with rollback support
  - Seeders for test data
  - Eager loading to prevent N+1
  - Database indexes on search fields
  - Soft deletes for bookings/users
- **API Design**:
  - RESTful endpoints
  - Consistent error responses
  - Rate limiting for public endpoints
  - API versioning (v1, v2)

### Frontend Standards (Vue 3)
- **Component Architecture**:
  - Atomic design: atoms → molecules → organisms
  - Single responsibility per component
  - Props validation with TypeScript
  - Emit events for parent communication
- **State Management (Pinia)**:
  - Separate stores by domain (booking, user, flight)
  - Getters for computed values
  - Actions for async operations
  - Persist critical state (localStorage)
- **Performance Optimization**:
  - Lazy load routes and heavy components
  - Virtual scrolling for long lists
  - Image optimization (WebP, lazy loading)
  - Code splitting by route

### Flight Booking Specific Standards
- **Search & Filters**:
  - Debounced airport autocomplete (300ms)
  - Real-time filter updates without page reload
  - URL state sync for shareable searches
- **Seat Selection**:
  - Optimistic UI updates
  - Seat locking mechanism (15min timeout)
  - Visual feedback for hover/select states
- **Booking Flow**:
  - Progress persistence across sessions
  - Form data validation at each step
  - Back navigation preserves state
- **Payment Security**:
  - PCI compliance via Stripe
  - No card details stored locally
  - SSL/TLS for all transactions

---

## 4. Testing Requirements

### Test Coverage Requirements
- **Unit Tests**: 80% minimum coverage
  - Pricing calculations
  - Seat availability logic
  - Date/time utilities
  - Validation rules
- **Integration Tests**:
  - Complete booking flow
  - Payment processing
  - Seat locking mechanism
  - Email notifications
- **E2E Tests (Critical Paths)**:
  - One-way booking: Search → Select → Pay → Confirm
  - Round-trip booking with seat selection
  - Booking cancellation flow
  - User registration → Profile → Booking history
- **Performance Benchmarks**:
  - Page load: <3 seconds
  - Search results: <300ms
  - Seat map render: <500ms
  - Payment processing: <5 seconds

### Flight Booking Test Scenarios
- **Edge Cases**:
  - Last seat booking race condition
  - Payment timeout handling
  - Session expiry during booking
  - Network failure recovery
- **Business Rules**:
  - Dynamic pricing updates
  - Infant/child passenger rules
  - Baggage allowance calculations
  - Cancellation policy enforcement

---

## 5. Documentation Standards

### Code Documentation
- **Backend (PHP)**:
  - PHPDoc blocks for all public methods
  - @param, @return, @throws annotations
  - Business logic explanations in services
- **Frontend (Vue/JS)**:
  - JSDoc for composables and utilities
  - Component prop descriptions
  - Store action documentation
- **API Documentation**:
  - OpenAPI/Swagger specification
  - Request/response examples
  - Error code references

### Flight Booking Documentation Structure
```
/docs
├── /architecture      # System design docs
├── /api              # API specifications
├── /components       # Component library docs
├── /tasks           # Task tracking (FB-XXX)
├── /testing         # Test plans & reports
└── /deployment      # Server setup & CI/CD
```

### Task Documentation Template
```markdown
# FB-XXX: [Feature/Fix Title]

## Context
[Why this task is needed - business value]

## Scope
- Affected components: [List Vue components]
- API endpoints: [List Laravel routes]
- Database changes: [Migrations needed]

## Implementation Plan
1. [ ] Backend changes
2. [ ] Frontend components
3. [ ] State management updates
4. [ ] API integration
5. [ ] Testing
6. [ ] Documentation

## Acceptance Criteria
- [ ] User can [specific action]
- [ ] System validates [specific rule]
- [ ] Performance meets [specific metric]

## Test Coverage
- Unit: [List test files]
- Integration: [Test scenarios]
- E2E: [User journey tests]

## Deployment Notes
[Environment variables, migrations, etc.]
```

---

## 6. Project-Specific Rules

### Flight Booking Domain Rules
- **Booking Reference**: 6-character alphanumeric (e.g., ABC123)
- **Seat Lock Duration**: 15 minutes during checkout
- **Payment Window**: 30 minutes after seat selection
- **Cancellation Policy**: 24hr free cancellation for full fare tickets
- **Check-in Window**: Opens 24hr before departure
- **Infant Policy**: Max 1 infant per adult
- **Group Booking**: 10+ passengers requires special handling

### API Rate Limits
- **Public Search**: 100 requests/minute
- **Authenticated**: 500 requests/minute
- **Payment**: 10 requests/minute per user
- **Admin**: Unlimited

### Data Retention
- **User Sessions**: 30 days
- **Incomplete Bookings**: 7 days
- **Completed Bookings**: 7 years
- **Payment Records**: 10 years
- **Search History**: 90 days

---

## 7. Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/FB-XXX-description`: Feature branches
- `bugfix/FB-XXX-description`: Bug fix branches
- `hotfix/FB-XXX-description`: Emergency production fixes

### Commit Messages
```
feat(booking): add seat selection component
fix(payment): resolve Stripe timeout issue
test(flight): add unit tests for pricing engine
docs(api): update booking endpoint documentation
refactor(search): optimize airport autocomplete
```

### Pull Request Requirements
- Link to task (FB-XXX)
- Description of changes
- Screenshots for UI changes
- Test coverage report
- Reviewer checklist

---

## 8. Performance Targets

### Frontend Metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: <500KB initial

### Backend Metrics
- **API Response Time**: <200ms average
- **Database Queries**: <50ms
- **Queue Processing**: <30s
- **Cache Hit Rate**: >90%

### Real-time Updates
- **Seat Availability**: <500ms propagation
- **Price Updates**: <1s reflection
- **Booking Confirmation**: <5s email delivery

---

## 9. Security Requirements

### Authentication & Authorization
- **JWT tokens** with 1hr expiry
- **Refresh tokens** with 30-day expiry
- **2FA** for admin accounts
- **OAuth2** for social logins

### Data Protection
- **Encryption at rest** for sensitive data
- **TLS 1.3** for all connections
- **PCI DSS** compliance for payments
- **GDPR** compliance for EU users

### Security Headers
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

---

## 10. Monitoring & Logging

### Application Monitoring
- **APM**: Response times, error rates
- **Real User Monitoring**: Core Web Vitals
- **Uptime Monitoring**: 99.9% SLA
- **Alert Thresholds**: Error rate >1%, Response time >500ms

### Logging Strategy
- **Application Logs**: Info, Warning, Error levels
- **Audit Logs**: All booking modifications
- **Security Logs**: Failed auth attempts
- **Performance Logs**: Slow queries, API calls

### Analytics Tracking
- **User Journey**: Funnel analysis
- **Conversion Rate**: Search to booking
- **Drop-off Points**: Form abandonment
- **Revenue Metrics**: Average booking value