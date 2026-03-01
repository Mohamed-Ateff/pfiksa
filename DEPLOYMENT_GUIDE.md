# Deploy Your App Online - Get a Live Link

## 🚀 Fastest Options (Free Tier Available)

### **OPTION 1: Railway.app (Recommended - All-in-one)**

Railway can deploy your **entire app** (frontend + backend + database) from GitHub in minutes.

#### Step 1: Go to Railway.app
1. Visit **https://railway.app**
2. Click **"Start Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway with your GitHub account
5. Select your **pfiksa** repository

#### Step 2: Configure Services
Railway will auto-detect your project structure. You may need to:
- Create a **PostgreSQL** or use **MongoDB Atlas** for the database
- Set environment variables (see below)

#### Step 3: Get Your Live URL
Railway will provide URLs like:
- **Frontend:** `https://pfiksa-production.up.railway.app`
- **Backend:** `https://pfiksa-api-production.up.railway.app`

---

### **OPTION 2: Render.com (Also Recommended)**

Render has excellent free tier and is very beginner-friendly.

#### Step 1: Create Account
1. Visit **https://render.com**
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub **pfiksa** repository

#### Step 2: Configure Backend (Express Server)
- **Build Command:** `npm run install-all`
- **Start Command:** `npm run server`
- **Environment Variables:** See section below

#### Step 3: Deploy Frontend (Separate Step)
- Create another service for client
- **Build Command:** `cd client && npm install && npm run build`
- **Start Command:** `npm run client` or use Vercel (see below)

#### Step 4: Get Your URLs
- **Backend:** `https://your-app-backend.onrender.com`
- **Frontend:** `https://your-app-frontend.onrender.com`

---

### **OPTION 3: Vercel (Frontend) + Render (Backend)**

Fastest for React frontend:

#### Frontend on Vercel:
1. Visit **https://vercel.com**
2. Import GitHub repository
3. Set **Root Directory** to `client`
4. Deploy (auto-builds on each push)

#### Backend on Render:
Follow Option 2 steps above

---

## 🔧 Required Environment Variables

You'll need to set these in your deployment platform:

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-reports
JWT_SECRET=your_secure_secret_key_here
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.com
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## 📊 MongoDB Atlas (Free Database)

Your backend needs a database. Use MongoDB Atlas (free tier):

1. Visit **https://www.mongodb.com/cloud/atlas**
2. Create free account
3. Create a free cluster
4. Add a database user
5. Get connection string: `mongodb+srv://username:password@...`
6. Use this in `MONGODB_URI`

---

## ⚡ Quick Start - Railway (Easiest)

```
1. Go to https://railway.app
2. Click "Start Project" → "Deploy from GitHub"
3. Select your pfiksa repo
4. Set MongoDB URI from MongoDB Atlas
5. Click Deploy
6. Wait 2-5 minutes
7. Get live link!
```

**Total time:** ~10 minutes ⏱️

---

## 🎯 Example Live Links After Deployment

Once deployed, you'll have links like:

```
Frontend (React App):
https://pfiksa-app.railway.app

Backend (API):
https://pfiksa-api.railway.app

API Endpoint:
https://pfiksa-api.railway.app/api

Login Page:
https://pfiksa-app.railway.app/login
```

Share the **Frontend** link with everyone! ✅

---

## 📝 Deployment Checklist

Before deploying, make sure:

- ✅ Project pushed to GitHub (`pfiksa` repo)
- ✅ `.env.example` files exist (Railway/Render uses these as templates)
- ✅ MongoDB Atlas account created with connection string
- ✅ `.gitignore` excludes `node_modules` and `.env`

---

## 🚨 Common Issues & Fixes

**"Build failed"**
- Ensure `package.json` is in root directory
- Check that all dependencies are listed

**"Cannot connect to database"**
- Verify MongoDB URI is correct
- Add Railway/Render IP to MongoDB Atlas whitelist (or allow all IPs)

**"Frontend can't reach API"**
- Make sure `REACT_APP_API_URL` points to your backend URL
- Rebuild frontend after changing env variables

---

## 💡 My Recommendation

**Use Railway** because:
- ✅ Deploy frontend + backend together
- ✅ Includes free PostgreSQL/MongoDB support
- ✅ Auto-deploys on GitHub push
- ✅ Simple UI
- ✅ Generous free tier

**Time to live link: ~10 minutes!**

---

## 🔗 Direct Links to Use

- **Railway.app:** https://railway.app
- **Render.com:** https://render.com
- **Vercel:** https://vercel.com
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

---

**Ready to go live?** Pick Railway and you'll have a working link in 10 minutes! 🚀
