# ⚡ QUICK START GUIDE

## 🎯 What This App Does

A professional **Employee-Boss Reporting System** where:
- **Employees** submit daily reports (completed tasks, challenges, files)
- **Managers** review reports, approve them, and print summaries

## 🚀 START HERE (30 seconds)

### Option A: Run Locally
```bash
npm run install-all    # Install all packages (1 time only)
npm run dev            # Start both backend & frontend
```
Then open: **http://localhost:3000**

### Option B: Check Deployment Status
```bash
npm run setup-deploy   # Verify everything is ready to deploy
```

---

## 🔑 Test Credentials

**Default Manager Account** (for testing):
- Email: `manager@example.com`
- Password: `manager123`

To create more accounts, login as manager and use "Create User" button.

---

## 📁 Project Structure

```
pfiksa/
├── server/                    # Express.js backend
│   ├── controllers/          # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth & file upload
│   └── server.js             # Main server file
│
├── client/                    # React.js frontend
│   ├── src/
│   │   ├── pages/            # Dashboard components
│   │   ├── components/       # Reusable UI
│   │   ├── context/          # Auth & language state
│   │   └── services/         # API calls
│   └── public/               # Static assets
│
└── Deployment Guides:
    ├── DEPLOYMENT_CHECKLIST.md           # Full verification
    ├── GLITCH_NETLIFY_CLICK_AND_GO.md   # Step-by-step
    └── DEPLOY_FREE_NO_CARD.md           # Why it's free
```

---

## 🌐 Deployment (Choose ONE)

### ⭐ **Recommended: Glitch + Netlify** (100% Free)
```bash
# Follow this guide:
# GLITCH_NETLIFY_CLICK_AND_GO.md
# Takes ~13 minutes, no credit card needed
```

### 🚄 Alternatives:
- **Railway** - Fast but not free
- **Render** - Free tier available
- **Vercel + Render** - Separate frontend/backend

---

## 📚 All Commands

```bash
# Development
npm run dev              # Start both server+client with hot reload
npm run server           # Start backend only (port 5000)
npm run client           # Start frontend only (port 3000)

# Setup
npm run install-all      # Install dependencies (run once)
npm run setup-deploy     # Verify deployment readiness
npm run build            # Build React for production

# After Deployment
npm start               # Production mode (server only)
```

---

## 🔐 Key Features

✅ **Authentication**
- JWT tokens stored in localStorage
- Role-based access (Employee vs Manager)
- Password hashing with bcryptjs
- Auto logout on token expiration

✅ **Report Management**
- Create daily reports with multiple file uploads
- Download uploaded files
- Manager can mark reports as checked/approved
- Delete own reports (employees only)

✅ **User Management**
- Managers can create, update, delete employees
- Password reset functionality
- View all employee information

✅ **File Uploads**
- Supports images, PDFs, Word, Excel files
- Max 10MB per file, 10 files per report
- Files stored in server/uploads/

✅ **Dashboard Features**
- Dark theme with modern UI (Material-UI)
- English & Arabic language support with RTL
- Print reports functionality
- Report filtering and search

---

## ⚙️ Technology Stack

**Backend:**
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- Multer - File uploads
- JWT - Authentication
- bcryptjs - Password hashing

**Frontend:**
- React 18 - UI library
- Material-UI - Components
- Axios - HTTP client
- React Router - Navigation
- React-to-Print - Print functionality

---

## 🆘 Troubleshooting

**Q: npm run dev says port already in use**
```bash
# Kill existing Node processes
taskkill /F /IM node.exe
# Then try again
npm run dev
```

**Q: CORS error in browser**
- Make sure backend is running on port 5000
- Frontend proxies to it automatically (client/package.json)

**Q: MongoDB connection failed locally**
- Install MongoDB locally, OR
- Use MongoDB Atlas (free cloud database)

**Q: File upload not working**
- Check server/uploads/ folder exists
- Verify file is < 10MB
- Ensure it's one of these types: image, PDF, DOC, XLS

---

## 📖 Full Documentation

- **DEPLOYMENT_CHECKLIST.md** - Complete pre-deployment verification
- **GLITCH_NETLIFY_CLICK_AND_GO.md** - Detailed deployment steps
- **DEPLOY_FREE_NO_CARD.md** - Why this deployment is free
- **README.md** - Project overview

---

## 🎓 Learning Resources

The codebase demonstrates:
- MERN stack architecture
- REST API design
- Authentication with JWT
- File upload handling
- React context for state management
- Material-UI customization
- MongoDB schema design
- Express middleware

---

## ✨ Next Steps

1. **Local Testing**: `npm run install-all && npm run dev`
2. **Verify Setup**: `npm run setup-deploy`
3. **Deploy**: Follow `GLITCH_NETLIFY_CLICK_AND_GO.md`
4. **Share**: Get your deployed URL and share with your team!

---

**Made with ❤️ | Full-Stack MERN Application**
