# 📋 TaskFlow — Angular 20 Task Management Application

> A high-performance, responsive Task Management Single Page Application (SPA) built with **Angular 20**, **Angular Signals**, **TypeScript**, and **Reactive Forms**.

🔗 **Live Demo on GitHub Pages**: [https://akshay336.github.io/TaskFlow/](https://akshay336.github.io/TaskFlow/)  
📦 **Repository**: [https://github.com/akshay336/TaskFlow](https://github.com/akshay336/TaskFlow)

---

## ✨ Features

- **Dashboard Summary Statistics**: Dynamic real-time metrics showing Total, In-Progress, Completed, and Overdue tasks. Clicking summary cards activates quick filters.
- **Card & Table Layout Switcher**: Seamlessly toggle between visual card grid and structured tabular data view.
- **Advanced Filtering & Sorting**:
  - Real-time debounced title search (300ms)
  - Status filter (`all`, `todo`, `in-progress`, `completed`)
  - Priority filter (`all`, `low`, `medium`, `high`)
  - Multi-attribute sorting (`dueDate`, `priority`, `title`, `status`) with ascending/descending toggle
- **Reusable Reactive Forms**: Single unified form component (`TaskFormComponent`) supporting both task creation and editing with field validation (`required`, `minLength(3)`) and accessible error messages.
- **Overdue Task Tracking**: Tasks past their deadline are dynamically flagged with visual badges and distinct styling.
- **Delete Confirmation Modal**: Custom accessible dialog prevents accidental deletions (supports Escape key and backdrop dismissal).
- **Resilient API Layer & Error Simulation**:
  - Built-in HTTP Interceptor mocking REST endpoints (`GET`, `POST`, `PUT`, `DELETE`) with realistic latency and `localStorage` persistence.
  - Interactive **"Simulate Error"** toggle in the header to demonstrate live failure recovery, retry banners, and toast notifications.
- **Automated CI/CD**: Fully automated deployment to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

---

## 🏗️ Architecture & Project Structure

The project follows Angular's clean feature-sliced architecture:

```text
src/app/
├── core/                         # Core singleton services, interceptors, and data models
│   ├── interceptors/
│   │   └── mock-api.interceptor.ts   # Intercepts /api/tasks, simulates delay & localStorage
│   ├── models/
│   │   └── task.model.ts             # Domain interfaces, union types, and DTOs
│   └── services/
│       ├── task-api.service.ts       # Centralized HTTP calls and error translation
│       ├── task-state.service.ts     # Single source of truth using Angular Signals
│       └── notification.service.ts   # Global toast alert management
├── features/tasks/               # Task management feature module
│   ├── components/
│   │   ├── task-card/                # Individual task card representation
│   │   ├── task-dashboard/           # Summary statistics KPI cards
│   │   ├── task-filter/              # Search, filter, and sort toolbar
│   │   ├── task-form/                # Reusable reactive task form
│   │   └── task-list/                # Task collection with card/table toggle & empty state
│   └── pages/
│       ├── tasks-page/               # Main tasks overview (/tasks)
│       ├── task-create-page/         # New task page (/tasks/new)
│       └── task-edit-page/           # Edit task page (/tasks/:id/edit)
└── shared/                       # Reusable UI components
    └── components/
        ├── confirm-dialog/           # Accessible confirmation modal
        ├── header/                   # Navigation bar & error simulation toggle
        ├── loading-spinner/          # Spinners and skeleton placeholders
        ├── not-found/                # 404 page for unmatched routes
        └── toast/                    # Toast notification container
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.19+ or v20.x recommended)
- npm (v9+ or v10+)

### Installation
```bash
# Clone the repository
git clone https://github.com/akshay336/TaskFlow.git
cd TaskFlow

# Install dependencies
npm install
```

### Local Development Server
```bash
npm start
# or: ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload when modifying source files.

### Production Build
```bash
# Standard production build
npm run build

# Build optimized for GitHub Pages hosting (with /TaskFlow/ base href)
npm run build:gh-pages
```

### Running Tests
```bash
npm test
```

---

## 📝 Technical Assessment Questions

### 1. Why did you choose your state-management approach?
We adopted **Angular Signals (`signal`, `computed`, `effect`)** introduced in modern Angular. Signals offer:
- **Zero-Boilerplate Reactivity**: Eliminates manual `Subject` orchestration, RxJS pipe plumbing, and tedious unsubscribe lifecycle hooks.
- **Granular Change Detection**: Angular can target updates directly to DOM bindings without traversing the full component tree.
- **Derived State Integrity**: Complex aggregations like `summary` (total, overdue, completed counts) and `filteredTasks` (filtering and multi-key sorting) are expressed as declarative `computed` signals that automatically recalculate only when their underlying dependencies change.
- **Single Source of Truth**: All mutations go through a unified `TaskStateService` maintaining immutable updates via `state.update()`.

### 2. How is data passed between the API, state layer, and components?
The application enforces strict unidirectional data flow with separation of concerns:
1. **API Layer (`TaskApiService`)**: Interacts with REST endpoints (`/api/tasks`) using Angular's `HttpClient`. It translates raw HTTP responses or failures into domain-safe errors.
2. **State Layer (`TaskStateService`)**: Acts as the intermediary single source of truth. It invokes the API service (converting Observables to Promises via `firstValueFrom`), updates its internal `signal<TaskState>` immutably, and coordinates toast notifications through `NotificationService`.
3. **Component Layer (Smart & Presentational Components)**: Components inject `TaskStateService` to consume read-only `computed` signals (`stateService.filteredTasks()`, `stateService.summary()`). Components trigger intent via explicit service action methods (e.g., `createTask()`, `setStatusFilter()`) and never interact with `HttpClient` directly.

### 3. What technical trade-offs did you make because of the time limit?
- **Client-Side Filtering & Pagination**: Because the assessment relies on a local mock API, filtering, sorting, and overdue calculations happen in memory on the client. In an enterprise system with large datasets, these would be delegated to server-side query parameters (`?page=1&status=in-progress&sort=dueDate`).
- **Mock Interceptor over Dedicated Backend**: Used an HTTP interceptor with `localStorage` backing rather than spinning up a separate Express/NestJS server or JSON Server. This simplifies setup into a single `npm install && npm start` command while accurately mimicking network delays and error statuses.

### 4. What would you improve before deploying the application to production?
- **Authentication & Authorization**: Integrate OpenID Connect / OAuth2 (e.g., Auth0 or Firebase Auth) with an `auth.interceptor.ts` attaching JWT Bearer tokens to requests.
- **Optimistic UI Updates**: Instantly update the UI on task completion or deletion before the backend confirms, rolling back gracefully if the network call fails.
- **Form Autosave / Draft Recovery**: Persist in-progress task form drafts in `sessionStorage` to prevent data loss on accidental navigation.
- **Full End-to-End Test Suite**: Add Playwright or Cypress workflows to validate critical user journeys (creating, filtering, editing, and deleting tasks) across desktop and mobile viewports.

### 5. How would you support thousands of tasks efficiently?
- **Server-Side Pagination & Infinite Scroll**: Implement cursor-based pagination on the backend (`GET /api/tasks?cursor=xyz&limit=50`) paired with Angular CDK Virtual Scrolling (`cdk-virtual-scroll-viewport`) so only visible DOM rows are rendered.
- **IndexedDB via Dexie.js**: For offline capabilities, store thousands of tasks in IndexedDB rather than `localStorage` (which has a 5MB synchronous limit).
- **Web Workers for Complex Aggregations**: Offload heavy data processing, full-text searching, or multi-faceted grouping to background Web Workers to maintain 60 FPS UI responsiveness.

---

## 🙋 Candidate Declaration
This solution was developed using Angular 20 best practices, standard official Angular documentation, and modern UI patterns. All architectural design choices, component hierarchy, and reactive state management approaches are thoroughly understood and ready for technical discussion and live code modification.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
