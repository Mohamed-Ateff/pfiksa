const express = require("express");
const {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
  getReportsByDate,
  deleteReport,
} = require("../controllers/reportController");
const { auth, isManager } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", auth, upload.array("files", 10), createReport);
router.get("/all", auth, isManager, getAllReports);
router.get("/my-reports", auth, getMyReports);
router.get("/date/:date", auth, isManager, getReportsByDate);
router.put("/:reportId/status", auth, isManager, updateReportStatus);
router.delete("/:reportId", auth, deleteReport);

module.exports = router;
