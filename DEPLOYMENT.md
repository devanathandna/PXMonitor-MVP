# 🚀 Deployment Guide: PXMonitor MVP

This guide will walk you through deploying the PXMonitor MVP:
- **Backend** hosted on **Render**
- **Frontend** hosted on **Vercel**

---

## Part 1: Git Setup (Required for both)

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. **Push to GitHub/GitLab/Bitbucket**:
   - Create a new repository on GitHub.
   - Push your code to the remote repository.

---

## Part 2: Deploy Backend to Render

1. **Sign up/Login** to [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. **Configure the Service**:
   - **Name**: `pxmonitor-backend`
   - **Root Directory**: `backend` (Important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index-mvp.js`
   - **Instance Type**: Free

5. **Environment Variables**:
   Under the "Environment" tab, add:
   - `GEMINI_API_KEY`: [Your Google Gemini API Key]
   - `PORT`: `3001` (or let Render assign one, usually 10000)

6. Click **Deploy Web Service**.

**After Deployment:**
- Render will give you a URL (e.g., `https://pxmonitor-backend.onrender.com`).
- **Copy this URL**, you'll need it for the frontend.

---

## Part 3: Deploy Frontend to Vercel

1. **Sign up/Login** to [Vercel.com](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Configure the Project**:
   - **Framework Preset**: Vite (should detect automatically)
   - **Root Directory**: `./` (Default)

5. **Environment Variables**:
   Add the following variables:
   - `VITE_BACKEND_URL`: The URL from Render (e.g., `https://pxmonitor-backend.onrender.com`)
     *(Note: Do NOT add a trailing slash `/`)*
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API Key

6. Click **Deploy**.

### Understanding the Build Process
You might be wondering: *"Do I need to run `npm run build` myself?"*
**No!** Vercel handles this automatically on their servers:
1. Vercel clones your repo.
2. It runs `npm install` to download dependencies.
3. It runs `npm run build` (your `vite build` command).
4. It takes the resulting `dist` folder and serves it to the world.

---

## Part 4: Final Configuration

### Update Backend CORS
Once you have your Vercel frontend URL (e.g., `https://pxmonitor.vercel.app`), you need to tell the backend to allow requests from it.

1. Go back to your code.
2. Open `backend/index-mvp.js`.
3. Update the CORS configuration (Line 31):
   ```javascript
   app.use(cors({
       origin: [
           'http://localhost:3000', 
           'http://localhost:8080', 
           'http://localhost:5173',
           'https://your-vercel-project.vercel.app' // Add your Vercel URL here
       ],
       credentials: true
   }));
   ```
4. Commit and push the changes:
   ```bash
   git add backend/index-mvp.js
   git commit -m "Update CORS for production"
   git push
   ```
5. Render will automatically redeploy the backend.

---

## ✅ You're Done!

- Your **Backend** is running on Render, generating mock data.
- Your **Frontend** is running on Vercel, displaying the beautiful UI.

### Troubleshooting

- **Backend Logs**: Check Render "Logs" tab if the backend fails to start.
- **Frontend Errors**: Check browser console (F12) if data isn't loading.
- **CORS Errors**: Ensure the Vercel URL in `backend/index-mvp.js` matches exactly (https vs http, trailing slash).
