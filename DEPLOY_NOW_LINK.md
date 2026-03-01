# 🔗 WORKING LINK IN 10 MINUTES

> No more docs. Just follow these 3 steps to get your app live.

---

## STEP 1: MongoDB Atlas (4 minutes)

**Go to:** https://www.mongodb.com/cloud/atlas

1. Click **"Try Free"**
2. Create account (use Gmail, easiest)
3. Create **Free Cluster** (click big green button)
4. Click **"Connect"** → **"Drivers"**
5. Choose **Node.js 4.0+**
6. Copy the connection string → **Save to notepad**

**You now have your database URL looking like:**
```
mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/employee-reports?retryWrites=true&w=majority
```

---

## STEP 2: Glitch Backend (3 minutes)

**Go to:** https://glitch.com

1. Sign in with GitHub
2. Click **"New Project"** → **"Import from GitHub"**
3. Paste: `Mohamed-Ateff/pfiksa`
4. Click **.env** secret file (left sidebar)
5. Paste this exactly:
```
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/employee-reports?retryWrites=true&w=majority
JWT_SECRET=super_secret_production_key_12345
PORT=3000
NODE_ENV=production
```
*(Replace PASSWORD with your actual MongoDB password from Step 1)*

6. Create/edit `glitch.json` in root of project:
```json
{
  "install": "cd server && npm install",
  "start": "cd server && npm start"
}
```

7. Wait 30 seconds... **Glitch automatically starts your backend**

8. Copy your Glitch URL from browser tab, looks like:
```
https://xxxxx-xxxxx.glitch.me
```

**SAVE THIS URL** ← You need it for Step 3

---

## STEP 3: Netlify Frontend (3 minutes)

**Go to:** https://netlify.com

1. Sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select your GitHub account
4. Search and click: `pfiksa`
5. Leave build settings as is, scroll to bottom
6. Click **"Deploy"**
7. While deploying, go to **"Site Settings"** → **"Build & Deploy"** → **"Environment"**
8. Add environment variable:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://YOUR-GLITCH-URL/api`
   *(Replace with your actual Glitch URL from Step 2)*

9. Trigger rebuild:
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Wait 2 minutes...

10. Copy your Netlify URL from browser:
```
https://your-site.netlify.app
```

---

## ✅ YOU'RE DONE

Your live app is at: **https://your-site.netlify.app**

**Test it:**
1. Open it
2. Click **"Manager"** role
3. Login with:
   - Email: `manager@example.com`
   - Password: `manager123`
4. Click **"Create User"** to make an employee account
5. Logout and test as employee

---

## 🔗 ACTUAL WORKING LINK WILL BE:

After Step 3, you'll have something like:
```
https://pfiksa-app.netlify.app
```

Share THIS link. People can use it immediately.

---

## ⚠️ If Something Breaks

**Glitch shows error?**
- Check `.env` file is correct
- Wait 30 more seconds
- Refresh page

**Netlify shows blank page?**
- Check `REACT_APP_API_URL` is set correctly
- Trigger rebuild again
- Wait 2 minutes

**Login doesn't work?**
- Make sure Glitch backend is running
- Check Glitch URL is correct in Netlify env var
- Look at browser console (F12) for actual error

---

## Done. Go.

That's it. 10 minutes. Live link. Share with your team.
