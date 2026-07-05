# Deployment Guide

BugFinder is designed for scalable deployment. We recommend **Vercel** for the frontend and **Render** for the backend.

## 1. Backend Deployment (Render)

1. Push your code to a GitHub repository.
2. Log in to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Environment Variables:
   - Copy all variables from your local `backend/.env` file.
   - Update `CLIENT_URL` to your future Vercel frontend URL (e.g., `https://bugfinder-app.vercel.app`).
6. Deploy the service. Note the deployed backend URL (e.g., `https://bugfinder-backend.onrender.com`).

## 2. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Connect your GitHub repository.
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
4. Environment Variables:
   - Add `VITE_API_URL` and set it to your deployed Render URL (e.g., `https://bugfinder-backend.onrender.com/api`).
5. Click **Deploy**.

## 3. Post-Deployment Checklist

- [ ] Ensure MongoDB Network Access is set to `0.0.0.0/0` (Allow access from anywhere) so Render can connect.
- [ ] Verify CORS: Ensure the backend `server.js` CORS configuration allows requests from your Vercel URL.
- [ ] Test the file upload (ZIP) in production to ensure Cloudinary integration is working.
- [ ] Test PDF/CSV generation and download.
