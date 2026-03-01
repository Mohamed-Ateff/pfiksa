# Employee-Boss Reporting System

A full-stack web application featuring employee dashboards for submitting daily reports and boss dashboards for reviewing and managing those reports.

## 🎯 Features

### Employee Dashboard

- Submit daily reports with struggles, achievements, and tasks
- Upload files and images (PDF, Word, Excel, Images)
- View previous reports
- Track report status (pending/checked)
- Delete reports if needed

### Boss Dashboard

- View all employee reports from a selected date
- Mark reports as checked/reviewed
- See employee information (name, department, position)
- Download and view attached files
- Print daily reports with all employee submissions
- Filter reports by date

## 🛠 Technology Stack

### Frontend

- **React.js** - UI Framework
- **Material-UI (MUI)** - UI Components
- **React Router** - Navigation
- **Axios** - HTTP Client
- **React-to-Print** - Print Functionality

### Backend

- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Multer** - File Upload
- **JWT** - Authentication
- **bcryptjs** - Password Hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone and Navigate to Project

```bash
cd path/to/Employee-Boss-Reporting-System
```

### 2. Install Dependencies

```bash
# Install all dependencies (server & client)
npm run install-all

# Or manually:
# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

### 3. Configure Environment Variables

**Server (.env file):**
Create `.env` file in the `server` directory:

```
MONGODB_URI=mongodb://localhost:27017/employee-reports
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

Or use MongoDB Atlas:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-reports
```

**Client (.env file - optional):**
Create `.env` file in the `client` directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

If using local MongoDB:

```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

### 5. Start the Application

#### Option 1: Run Both Servers Concurrently

```bash
npm run dev
```

#### Option 2: Run Separately

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## 📝 Usage

### Creating Accounts

1. Navigate to `http://localhost:3000`
2. Click on **Register**
3. Fill in your details:
   - Name, Email, Password
   - Department, Position (optional)
   - Select Role: **Employee** or **Boss**
4. Click Register

### Employee Workflow

1. Log in with employee account
2. Go to Employee Dashboard
3. Fill in the daily report form:
   - Describe struggles
   - Describe achievements
   - List tasks completed
   - Add notes
4. Upload files (optional)
5. Click "Submit Report"
6. View all your submitted reports in the table below

### Boss Workflow

1. Log in with boss account
2. Go to Boss Dashboard
3. Select a date to view reports from that day
4. Review employee reports
5. Check the checkbox next to each report to mark as reviewed
6. Click the Print icon to print all reports for that date
7. Download attached files if needed

## 📁 Project Structure

```
employee-boss-reporting-system/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Report.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   └── employeeController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   └── employees.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/
│   ├── package.json
│   ├── server.js
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── EmployeeDashboard.js
│   │   │   └── BossDashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
│
└── package.json
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Reports

- `POST /api/reports` - Create new report
- `GET /api/reports/all` - Get all reports (Boss only)
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/date/:date` - Get reports by date (Boss only)
- `PUT /api/reports/:reportId/status` - Update report status (Boss only)
- `DELETE /api/reports/:reportId` - Delete report

### Employees

- `GET /api/employees` - Get all employees (Boss only)
- `GET /api/employees/:employeeId` - Get employee details
- `PUT /api/employees/:employeeId` - Update employee info

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB credentials if using Atlas

### Port Already in Use

- Change PORT in `.env` file (default: 5000)
- Or kill the process using the port

### File Upload Issues

- Check `server/uploads/` folder exists
- Verify file size doesn't exceed 10MB
- Allowed file types: Images, PDF, Word, Excel

## 🚢 Deployment

### Heroku Deployment (Backend)

1. Create Heroku app
2. Add MongoDB Atlas connection string
3. Deploy server code
4. Update client `REACT_APP_API_URL` to Heroku URL

### Vercel Deployment (Frontend)

1. Connect GitHub repo
2. Set build command: `npm run build`
3. Output directory: `build`
4. Deploy

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

MIT License - feel free to use this project!
