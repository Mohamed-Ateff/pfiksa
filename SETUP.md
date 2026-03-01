# Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- MongoDB running locally or MongoDB Atlas connection string

### Step 1: Configure Environment Variables

**Server Configuration (.env file in `server/` folder):**

```
MONGODB_URI=mongodb://localhost:27017/employee-reports
JWT_SECRET=your_secure_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-reports?retryWrites=true&w=majority
JWT_SECRET=your_secure_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

### Step 2: MongoDB Setup

#### If using local MongoDB:

**Windows:**

```powershell
# Start MongoDB service
net start MongoDB

# If not installed, install MongoDB Community Edition from:
# https://www.mongodb.com/try/download/community
```

**macOS:**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo systemctl start mongod
```

#### If using MongoDB Atlas (Recommended for Production):

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Add a database user
5. Get connection string and add to `.env`

### Step 3: Start the Application

#### Run Both Frontend and Backend Together:

```bash
npm run dev
```

#### Or Run Separately:

```bash
# Terminal 1: Start Backend
npm run server

# Terminal 2: Start Frontend
npm run client
```

### Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Features Overview

### Employee Accounts

1. Register with role: "Employee"
2. Submit daily reports with:
   - Struggles faced
   - Achievements
   - Tasks completed
   - Attachments (files/images)
3. View all submitted reports
4. See if boss has reviewed them

### Boss Accounts

1. Register with role: "Boss"
2. View all employee reports by date
3. Mark reports as checked/reviewed
4. Download and view attachments
5. Print daily report summaries

## 📁 Project Structure

```
.
├── server/              # Express backend
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth & upload
│   ├── uploads/        # File storage
│   └── server.js       # Main entry
│
├── client/             # React frontend
│   ├── src/
│   │   ├── pages/      # Employee & Boss dashboards
│   │   ├── services/   # API calls
│   │   ├── context/    # Auth context
│   │   └── App.js      # Main app
│   └── public/
│
├── package.json        # Root scripts
└── README.md          # Full documentation
```

## 🔧 Available Scripts

In the project root directory:

```bash
# Install all dependencies
npm run install-all

# Run frontend and backend together
npm run dev

# Run only backend
npm run server

# Run only frontend
npm run client

# Build for production
npm run build
```

## 🧪 Test User Accounts

You can create test accounts during registration or use these credentials:

**Employee:**

- Email: employee@test.com
- Password: password123
- Role: Employee

**Boss:**

- Email: boss@test.com
- Password: password123
- Role: Boss

## 🆘 Troubleshooting

**Issue: Cannot connect to MongoDB**

- Check if MongoDB is running
- Verify connection string in `.env`
- Try local: `mongodb://localhost:27017/employee-reports`
- Or use MongoDB Atlas

**Issue: Port 5000 already in use**

- Change PORT in server/.env file
- Or kill process: `lsof -ti:5000 | xargs kill -9`

**Issue: Port 3000 already in use**

- Kill process: `lsof -ti:3000 | xargs kill -9`
- Or set `PORT=3001` in client

**Issue: File upload not working**

- Check `server/uploads/` folder exists
- Max file size: 10MB
- Allowed: Images, PDF, Word, Excel

**Issue: Dependencies installation failed**

- Delete `node_modules` and `package-lock.json`
- Run: `npm cache clean --force`
- Run: `npm install` again

## 📞 API Testing

Use Postman, Insomnia, or curl to test endpoints:

### Register

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering",
  "position": "Developer"
}
```

### Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## ✨ Key Features Implemented

✅ User authentication with JWT
✅ Role-based access (Employee/Boss)
✅ File upload capability
✅ Daily report submission
✅ Report review status tracking
✅ Date-based filtering
✅ Print functionality
✅ Responsive UI with Material-UI
✅ Error handling
✅ Input validation

## 🎨 UI Components Used

- Material-UI (MUI) v5
- React Router v6
- Axios for API calls
- React-to-Print for printing
- Form validation

## 📦 Database Schema

### User Collection

- name, email, password
- role (employee/boss)
- department, position
- createdAt

### Report Collection

- employeeId (reference to User)
- date, struggles, achievements
- tasks, notes
- files (array of file objects)
- isChecked, checkedBy, checkedAt
- createdAt

## 🔐 Security Considerations

- Passwords hashed with bcryptjs
- JWT tokens for authentication (7-day expiry)
- Protected routes with auth middleware
- Role-based authorization
- Input validation
- File type validation
- File size limits (10MB)

## 🚀 Next Steps

1. Configure MongoDB Atlas for production
2. Set secure JWT secret
3. Deploy backend to Heroku/Railway
4. Deploy frontend to Vercel/Netlify
5. Add email notifications
6. Add user profile management
7. Add report analytics/charts
8. Add export to PDF/Excel

Enjoy using the Employee-Boss Reporting System! 🎉
