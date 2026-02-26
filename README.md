# Eva Angular - نظام تقييم الموظفين

Event Staff Evaluation System — Angular + .NET C# backend

## Frontend (Angular 19)
- Angular 19 standalone components with signals
- TailwindCSS for styling
- Arabic (RTL) UI
- HttpClient connected to the .NET backend

## Backend (.NET 8 C#)
Located in the `backend/` folder of the `evn_api` repo.

## Prerequisites
- Node.js 20+
- .NET 8 SDK
- Angular CLI (`npm install -g @angular/cli`)

## Getting Started

### 1. Start the backend
```bash
cd backend
dotnet run
# API runs on http://localhost:3000
```

### 2. Start the Angular frontend
```bash
npm install
ng serve
# App runs on http://localhost:4200
```

## Pages
- `/` — Dashboard (لوحة التحكم)
- `/events` — Events (الفعاليات)
- `/events/:id` — Event detail & evaluations
- `/employees` — Employees (الموظفين)
- `/evaluations` — Evaluations (التقييمات)
- `/analytics` — Analytics (التحليلات)
