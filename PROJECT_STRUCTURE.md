# Project Structure

BugFinder follows an enterprise-grade Model-View-Controller (MVC) architecture for the backend and a feature-component structure for the frontend.

## High-Level Architecture

```
bugfinder/
├── backend/            # Express.js API server
│   ├── config/         # Database, Cloudinary, and external service configurations
│   ├── controllers/    # Request handlers and business logic coordination
│   ├── middleware/     # Auth, Validation, Error Handling, File Upload
│   ├── models/         # Mongoose Data Schemas (User, Project, Bug, Report, etc.)
│   ├── routes/         # Express Route definitions
│   ├── services/       # Core business logic (AnalyzerEngine, AI Integrations)
│   ├── uploads/        # Temporary storage for processing ZIP files
│   └── utils/          # Helper functions
│
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components (Sidebar, Topbar, Modals)
│   │   ├── context/    # React Context (Auth, Theme)
│   │   ├── layouts/    # Page wrappers (AuthLayout, DashboardLayout)
│   │   ├── pages/      # Route-level components (Landing, Dashboard, ProjectDetail)
│   │   ├── services/   # Axios API configurations
│   │   ├── styles/     # Additional CSS modules
│   │   ├── App.jsx     # Main Router setup
│   │   └── main.jsx    # Entry point & Providers
│   └── tailwind.config.js # Custom design system definitions
│
└── docs/               # Project documentation
```

## Data Flow

1. **Upload:** User uploads a ZIP on the frontend.
2. **Processing:** Multer saves it to `backend/uploads`.
3. **Analysis:** `analyzerService.js` unzips, reads files, and runs regex/heuristic checks for bugs, perf, security, etc.
4. **Database:** Results are categorized and saved to MongoDB via Mongoose Models (`Project`, `Bug`).
5. **Retrieval:** Frontend fetches data via standard REST API endpoints.
6. **Reporting:** User requests a report. `reportController.js` uses PDFKit/json2csv to format the DB data and sends it back as a downloadable Blob.
