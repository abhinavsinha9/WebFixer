# BugFinder — AI-Powered Website Analysis Platform

BugFinder is a premium SaaS platform designed to help developers and teams identify bugs, optimize performance, and improve the overall health of their web projects. It combines static analysis, dynamic rendering checks, and AI-powered suggestions to deliver professional, actionable reports.

## Key Features

- **Automated Bug Detection:** Finds broken links, console errors, React issues, unused code, and vulnerabilities.
- **Performance Auditing:** Lighthouse-style metrics (LCP, INP, CLS, TTFB, FCP) and bundle size analysis.
- **Accessibility Checks:** WCAG 2.1 compliance verification (ARIA labels, contrast, navigation).
- **Security Scanner:** Detects XSS vulnerabilities, hardcoded secrets, and dependency issues.
- **AI-Powered Code Review:** GPT-4o-mini integration for refactoring, architecture, and code quality suggestions.
- **Interactive Code Explorer:** Built-in Monaco editor to navigate and inspect project files directly from the dashboard.
- **Professional Reports:** Export comprehensive PDF, CSV, and Excel reports for stakeholders.
- **Project Import Flexibility:** Import via ZIP upload, GitHub connection, or raw URL scanning.

## Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS (Custom Design System, Dark Mode, Glassmorphism)
- React Router DOM
- React Query
- Framer Motion (Smooth UI animations)
- Monaco Editor
- Recharts / Chart.js

### Backend
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- Socket.IO (Real-time notifications)
- JWT Authentication & RBAC (Role-Based Access Control)
- OpenAI API (GPT-4o-mini)
- Cloudinary (Storage)
- Multer (File uploads & parsing)
- PDFKit, json2csv, ExcelJS (Report Generation)

## Getting Started

Please see the [INSTALLATION.md](./INSTALLATION.md) for local setup instructions.

## Deployment

Please see [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to Vercel and Render.

## License

MIT
