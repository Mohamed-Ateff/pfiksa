// Pure in-memory database - zero dependencies
class MemoryDB {
  constructor() {
    this.data = {
      users: [],
      reports: [],
    };
    this.idCounter = 1;
    this.loadData();
  }

  loadData() {
    // Try to load from file if exists
    try {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(__dirname, "..", "data-backups", "db.json");
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        this.data = JSON.parse(content);
        // Restore idCounter to avoid ID collisions after restart
        const allIds = [
          ...this.data.users.map((u) => u._id),
          ...this.data.reports.map((r) => r._id),
        ].filter((id) => typeof id === "number");
        if (allIds.length > 0) {
          this.idCounter = Math.max(...allIds) + 1;
        }
        console.log("✅ Loaded data from backup");
      }
    } catch (err) {
      console.log("Starting with fresh data");
    }
  }

  saveData() {
    try {
      const fs = require("fs");
      const path = require("path");
      const dir = path.join(__dirname, "..", "data-backups");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, "db.json");
      fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.warn("Could not save data:", err.message);
    }
  }

  // User methods
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email === email);
  }

  createUser(userData) {
    const user = {
      _id: this.idCounter++,
      ...userData,
      createdAt: new Date(),
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  findUserById(id) {
    return this.data.users.find((u) => u._id === id);
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (user) {
      Object.assign(user, updates);
      this.saveData();
      return user;
    }
    return null;
  }

  findAllUsers() {
    return this.data.users;
  }

  deleteUser(email) {
    const index = this.data.users.findIndex((u) => u.email === email);
    if (index !== -1) {
      this.data.users.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Report methods
  createReport(reportData) {
    const report = {
      _id: this.idCounter++,
      ...reportData,
      createdAt: new Date(),
    };
    this.data.reports.push(report);
    this.saveData();
    return report;
  }

  findReportsByEmployee(employeeId) {
    return this.data.reports.filter((r) => r.employeeId === employeeId);
  }

  findAllReports() {
    return this.data.reports;
  }

  updateReport(id, updates) {
    const report = this.data.reports.find((r) => r._id === id);
    if (report) {
      Object.assign(report, updates);
      this.saveData();
      return report;
    }
    return null;
  }

  deleteReport(id) {
    const index = this.data.reports.findIndex((r) => r._id === id);
    if (index !== -1) {
      this.data.reports.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }
}

module.exports = new MemoryDB();
