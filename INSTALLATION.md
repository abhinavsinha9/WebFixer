# Installation Guide

Follow these steps to set up the BugFinder platform locally.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas Account (or local MongoDB)
- Cloudinary Account
- OpenAI API Key (Optional, but required for AI suggestions)

## 1. Clone & Install Dependencies

```bash
# Clone the repository (if applicable)
# git clone <repo-url>
# cd bugfinder

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Environment Variables

### Backend Configuration

1. In the `backend` directory, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
2. Update `.env` with your actual credentials:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A long random string.
   - `CLOUDINARY_*`: Your Cloudinary credentials.
   - `OPENAI_API_KEY`: Your OpenAI key (if missing, it falls back to rule-based analysis).

### Frontend Configuration

1. In the `frontend` directory, create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Running the Application

Open two terminal windows.

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# Vite server will start on http://localhost:5173
```

## 4. Usage

1. Open `http://localhost:5173` in your browser.
2. Sign up for a new account.
3. You will automatically be logged in to the dashboard.
4. Click "New Project" and upload a ZIP file (e.g., a small React or HTML project) to test the analysis engine.
