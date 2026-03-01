const Report = require("../models/Report");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const {
      completedTasks,
      inProgressTasks,
      commitments,
      challenges,
      tasks,
      struggles,
      notes,
    } = req.body;

    const report = new Report({
      employeeId: req.userId,
      completedTasks: completedTasks || tasks || "",
      inProgressTasks: inProgressTasks || "",
      commitments: commitments || notes || "",
      challenges: challenges || struggles || "",
      files: req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/${file.filename}`,
          }))
        : [],
    });

    await report.save();

    res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports (manager only)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("employeeId", "name email position")
      .populate("checkedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee's reports
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ employeeId: req.userId })
      .populate("checkedBy", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report status (manager only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { isChecked, approvalNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        isChecked,
        checkedBy: isChecked ? req.userId : null,
        checkedAt: isChecked ? new Date() : null,
        approvalNotes: isChecked ? approvalNotes || "" : "",
      },
      { new: true },
    )
      .populate("employeeId", "name email position")
      .populate("checkedBy", "name email");

    res.status(200).json({
      message: "Report status updated",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports for a specific date (for daily reports)
exports.getReportsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const reports = await Report.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("employeeId", "name email position")
      .populate("checkedBy", "name email");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);

    if (
      report.employeeId.toString() !== req.userId.toString() &&
      req.userRole !== "manager"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this report" });
    }

    await Report.findByIdAndDelete(reportId);

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
