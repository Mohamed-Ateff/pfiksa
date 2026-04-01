# 🔒 Database Backup & Recovery Guide

## Current Setup (ACTIVE)

✅ **Local MongoDB**: `mongodb://localhost:27017/employee-reports`  
✅ **Automatic Backups**: Every 12 hours + on every server restart  
✅ **Backup Locations**:

- JSON backups: `server/backups/` (last 30 kept)
- MongoDB dumps: `data-backups/` (last 30 kept)

---

## How to Use Backups

### Create a Manual Backup NOW:

```bash
cd server
npm run backup:create
```

### Restore from Backup File:

```bash
cd server
npm run backup:restore ../data-backups/backup-2026-04-01T01-50-43.json
```

### View Available Backups:

```bash
dir server\backups\
dir data-backups\
```

---

## Windows Task Scheduler (Optional - For Automatic Daily Backups)

### Setup Daily Backup Task (DO THIS ONCE):

1. **Open Task Scheduler**
   - Press `Win + R` → type `taskschd.msc` → Press Enter

2. **Create New Task**
   - Right-click "Task Scheduler Library" → "Create Task"
   - Name: `Employee-Reports-Daily-Backup`
   - Check: ✅ "Run with highest privileges"

3. **Triggers Tab**
   - Click "New"
   - Begin task: `On a schedule`
   - Daily, at: `02:00 AM` (or your preferred time)
   - Recur every: `1` day
   - Click OK

4. **Actions Tab**
   - Action: `Start a program`
   - Program: `C:\Users\moham\OneDrive\Desktop\New\server\daily-backup.bat`
   - Click OK

5. **Conditions Tab**
   - Uncheck "Stop if computer on battery"
   - Click OK

6. **Create Task**
   - Click OK
   - Test: Right-click task → Run

---

## MongoDB Atlas (Cloud Backup - OPTIONAL but RECOMMENDED)

### Setup MongoDB Atlas (5 minutes):

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for FREE
3. Create a FREE cluster (512MB storage, no credit card needed)
4. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/...`)
5. Update `server/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-reports?retryWrites=true&w=majority
JWT_SECRET=pfiksa_jwt_secret_2026
PORT=5000
NODE_ENV=development
```

**Benefits:**

- ✅ Automatic daily backups by MongoDB
- ✅ Data accessible from anywhere
- ✅ 30-day backup retention
- ✅ No manual backup needed

---

## Data Recovery Procedure

### If Local MongoDB Corrupted:

1. **Stop the app**

   ```bash
   Ctrl + C
   ```

2. **Restore from backup**

   ```bash
   cd server
   npm run backup:restore ../data-backups/backup-2026-04-01T01-50-43.json
   ```

3. **Restart app**
   ```bash
   npm run dev
   ```

### If Need Older Data:

1. Check backup files:

   ```bash
   dir data-backups\
   ```

2. Restore any backup:
   ```bash
   npm run backup:restore ../data-backups/backup-DATE-TIME.json
   ```

---

## Emergency: Data Recovery from MongoDB Atlas

If you set up MongoDB Atlas:

1. Go to: https://www.mongodb.com/cloud/atlas
2. Select your cluster
3. Click "Backup" tab
4. Choose a restore point
5. Click "Restore"

---

## Automated Backup Schedule

```
Every 12 hours:   Automatic backup (server keeps running)
On app restart:   Immediate backup created
Daily at 02:00:   Windows Task Scheduler backup (optional)
```

---

## Backup File Naming

Format: `backup-YYYY-MM-DDTHH-MM-SS.json`

Example: `backup-2026-04-01T01-50-43.json`

Backup contains:

- All user accounts
- All reports
- Timestamps
- Complete data snapshot

---

## Storage Info

- Local backups: `server/backups/` (keeps last 30)
- JSON exports: `data-backups/` (keeps last 30)
- Each backup: ~50-100 KB

---

**IMPORTANT:**
✅ You now have automatic backups every 12 hours  
✅ Backups run on every server restart  
✅ Last 30 backups are always available  
✅ Data is PERSISTENT (survives server restarts)  
✅ Set up Task Scheduler for extra daily backups (OPTIONAL)

**You will NOT lose data again.**
