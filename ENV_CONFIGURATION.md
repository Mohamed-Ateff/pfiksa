# Environment Configuration Guide

## 🔐 Environment Variables Reference

### Server Environment Variables

#### Local Development (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/employee-reports
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

#### Production on Glitch (`server/.env` in Glitch)
```env
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/employee-reports?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_12345_use_strong_key
PORT=3000
NODE_ENV=production
```

#### Production on Render/Railway
```env
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/employee-reports?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_12345_use_strong_key
PORT=8000
NODE_ENV=production
```

---

### Frontend Environment Variables

#### Client Proxy (Local Development)
In `client/package.json`:
```json
"proxy": "http://localhost:5000"
```
This tells React to route API calls to http://localhost:5000/api during development.

#### Production Environment Variable (For Netlify/Vercel)
In **Netlify/Vercel Dashboard → Environment Variables**:
```
Key: REACT_APP_API_URL
Value: https://your-backend-url.glitch.me/api
```

Or in `client/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.glitch.me/api
```

---

## 📋 How Environment Variables Work

### Backend
1. **Express server** reads from `server/.env` using `dotenv` package
2. Values are accessed via `process.env.VARIABLE_NAME`
3. Example: `const PORT = process.env.PORT || 5000`

### Frontend
1. **React** prefixes all env vars with `REACT_APP_`
2. Variables must start with `REACT_APP_` to be available
3. Accessed in code: `process.env.REACT_APP_API_URL`
4. Baked into build during `npm run build`
5. Must be set BEFORE building for production

---

## 🚀 Step-by-Step Environment Setup

### For Local Development

1. **Backend (.env file)**
   ```bash
   cd server
   cp .env.example .env  # If copy command doesn't work, edit manually
   ```
   Edit `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/employee-reports
   JWT_SECRET=dev_secret_key_123
   PORT=5000
   NODE_ENV=development
   ```

2. **Frontend** (No .env needed, uses proxy in package.json)

3. **Run locally**
   ```bash
   npm run install-all
   npm run dev
   ```

---

### For Glitch Deployment

1. **Create Project on Glitch**
   - Import from GitHub: `Mohamed-Ateff/pfiksa`
   - Glitch creates project with environment variables UI

2. **Set Backend Environment Variables in Glitch**
   - Click `.env` secret file
   - Add these variables:
   ```
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/employee-reports?retryWrites=true&w=majority
   JWT_SECRET=super_secret_production_key_xyz123
   PORT=3000
   NODE_ENV=production
   ```

3. **Glitch Configuration (glitch.json)**
   Create/edit `glitch.json` in root:
   ```json
   {
     "install": "cd server && npm install",
     "start": "cd server && npm start"
   }
   ```

4. **Glitch provides your backend URL**: `https://project-name.glitch.me`

---

### For Netlify Deployment

1. **Set Frontend Environment Variable**
   - Deploy via Netlify from GitHub
   - Dashboard → Site Settings → Build & Deploy → Environment
   - Add Environment Variable:
     ```
     Name: REACT_APP_API_URL
     Value: https://your-glitch-backend.glitch.me/api
     ```

2. **Build & Deploy Settings**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/build
   ```

3. **Netlify provides your frontend URL**: `https://your-site.netlify.app`

---

### For Render Deployment

1. **Backend Service Environment**
   - Create Web Service from GitHub
   - Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://admin:PASSWORD@...
   JWT_SECRET=production_secret_key
   PORT=8000
   NODE_ENV=production
   ```

2. **Build & Start Commands**
   ```
   Install: cd server && npm install
   Start: cd server && npm start
   ```

3. **Frontend (Static Site)**
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`
   - Add environment variable: `REACT_APP_API_URL=[your render backend url]/api`

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `server/.env` created with all required variables (local dev)
- [ ] `MONGODB_URI` is correct (localhost or MongoDB Atlas)
- [ ] `JWT_SECRET` is strong (use random string, not default)
- [ ] `PORT` matches deployment platform requirements
- [ ] `NODE_ENV=development` for local, `production` for deployed
- [ ] Frontend environment variable `REACT_APP_API_URL` set on production
- [ ] Backend URL in `REACT_APP_API_URL` matches deployed backend
- [ ] No .env files committed to GitHub (check .gitignore)

---

## 🔑 Security Best Practices

1. **Never commit .env files** - they contain secrets
   - ✅ Keep in `.gitignore` (already configured)
   - ❌ Never paste secrets in code

2. **Use strong JWT_SECRET**
   ```bash
   # Generate strong random key:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Different secrets for each environment**
   - Local: `dev_key_123`
   - Staging: Different key
   - Production: Different key
   - Never reuse across environments

4. **MongoDB Atlas Security**
   - Create dedicated admin user (not your main account)
   - Use strong passwords
   - Whitelist IP addresses in production
   - Enable encryption at rest

---

## 🐛 Common Environment Issues

### Issue: "Cannot find module 'dotenv'"
**Solution:** Install dependencies
```bash
npm run install-all
```

### Issue: "MongoDB connection error"
**Solution:** Check `MONGODB_URI`
- Is it correct format?
- Is MongoDB running (locally) or Atlas cluster active?
- Are credentials correct?

### Issue: "API calls 404 in production"
**Solution:** Check `REACT_APP_API_URL`
- Is it set in Netlify/Vercel environment variables?
- Does it match your backend URL?
- Is backend running?

### Issue: CORS errors in browser
**Solution:** Backend CORS is configured globally
- If you added custom CORS, ensure frontend URL is whitelisted

### Issue: "JWT_SECRET not defined"
**Solution:** Check server/.env file
- File must exist with `JWT_SECRET=your_value`
- dotenv will fail silently if missing

---

## 📝 Environment Variable Checklist

### Server (.env)
- [x] MONGODB_URI - Connection to database
- [x] JWT_SECRET - Token signing key
- [x] PORT - Server port number
- [x] NODE_ENV - Environment name

### Frontend (Netlify/Vercel)
- [x] REACT_APP_API_URL - Backend API endpoint

### Application Behavior
- [x] Local: Uses proxy in package.json for API calls
- [x] Production: Uses REACT_APP_API_URL environment variable
- [x] Backend: Reads from .env using dotenv package

---

**All environment variables are correctly configured for both local development and production deployment.**
