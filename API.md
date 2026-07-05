# API Documentation

Base URL (Development): `http://localhost:5000/api`

## Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/login` | Login user and get JWT | No |
| GET | `/auth/me` | Get current user data | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| POST | `/auth/forgot-password` | Send password reset email | No |

## Project Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/projects/upload` | Upload and import ZIP project | Yes |
| POST | `/projects/url` | Import project via URL | Yes |
| GET | `/projects` | Get all user projects | Yes |
| GET | `/projects/:id` | Get specific project details | Yes |
| GET | `/projects/:id/files` | Get project file tree | Yes |
| GET | `/projects/:id/file/*` | Get specific file content | Yes |

## Analysis & AI Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analysis/:id` | Trigger project analysis engine | Yes |
| GET | `/analysis/:id/performance` | Get Core Web Vitals & Perf data | Yes |
| POST | `/ai/:id/suggestions` | Get GPT-4o-mini code suggestions | Yes |

## Bug Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/bugs/project/:id` | Get all bugs for a project | Yes |
| GET | `/bugs/:bugId` | Get specific bug details | Yes |
| PUT | `/bugs/:bugId` | Update bug status | Yes |
| POST | `/bugs/:bugId/comments`| Add a comment to a bug | Yes |

## Report Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reports/:projectId` | Generate a new report | Yes |
| GET | `/reports/:id/export/pdf`| Download report as PDF | Yes |
| GET | `/reports/:id/export/csv`| Download report as CSV | Yes |
