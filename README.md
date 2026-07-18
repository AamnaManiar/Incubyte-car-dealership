# AutoHub - Car Dealership Inventory System

A production-ready full-stack web application for managing car dealership inventory, built as a TDD (Test-Driven Development) kata.

## 🚀 System Architecture

### Technology Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS, React Router DOM, Axios
- **Backend**: Node.js, Express.js, TypeScript, Jest & Supertest (for TDD)
- **Database**: SQLite (via Prisma ORM v5)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt for password hashing

### Features
- **Role-Based Access Control**: Users vs Admins.
- **Inventory Management**: Full CRUD operations for vehicles (Admins only).
- **Purchasing**: Users can purchase vehicles, which decrements the available stock.
- **Advanced Filtering**: Search vehicles by make, model, category, and price range.
- **RESTful API**: Standardized JSON responses with centralized error handling.

---

## 📸 Screenshots

*A mockup of the AutoHub Dashboard interface showing the vehicle grid and filtering capabilities:*

![Dashboard Mockup](file:///C:/Users/Aamna/.gemini/antigravity/brain/76b4c063-5ffd-4baa-873c-bb1d3aa4a6b1/dashboard_mockup_1784362411869.jpg)

---

## 🧪 Test Report (TDD Workflow)

The backend was built using a strict Red-Green-Refactor TDD cycle. All critical business logic (authentication & vehicle management) is covered by unit tests.

```text
PASS src/modules/vehicles/vehicles.service.test.ts (5.959 s)
PASS src/modules/auth/auth.service.test.ts (6.525 s)

Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        19.67 s
Ran all test suites.
```

---

## 🤖 My AI Usage

As part of this coding kata, I collaborated with an AI assistant to accelerate development while adhering to professional engineering standards.

### How I used AI:
1. **Architecture & Scaffolding**: I used AI to quickly generate the boilerplate for the Express backend, Prisma schema, and Vite React frontend, saving hours of manual setup.
2. **TDD Workflow**: I instructed the AI to write the Jest/Supertest unit tests *before* writing the implementation logic. Once the tests failed (Red), I guided the AI to implement the services to make them pass (Green).
3. **Debugging Complex Dependencies**: During the Prisma configuration, we encountered a breaking change with Prisma v7 SQLite adapters. I collaborated with the AI to debug the error messages, eventually downgrading to Prisma v5 to ensure stable file-based DB support for this kata.
4. **Git Storytelling**: I used the AI to help chunk the codebase into logical, professional Git commits that tell the story of the application's evolution.

### What I learned:
- AI is incredible at scaffolding and writing tests, but it requires strict technical direction (like enforcing TDD).
- When a tool (like Prisma) releases a major breaking version, the AI's training data might be slightly behind or confused by the bleeding-edge docs. I learned that as the human engineer, I must step in to make architectural decisions (e.g., "Let's downgrade to v5 for stability") rather than letting the AI get stuck in a loop.

---

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Demo Credentials
- **Admin**: `admin@cardealership.com` / `admin123`
- **User**: `user@example.com` / `user123`
