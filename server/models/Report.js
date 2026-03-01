const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  completedTasks: {
    type: String,
    required: [true, "Please add completed tasks"],
    description: "Tasks completed today",
  },
  inProgressTasks: {
    type: String,
  },
  commitments: {
    type: String,
  },
  challenges: {
    type: String,
  },
  tasks: {
    type: String,
  },
  struggles: {
    type: String,
  },
  notes: {
    type: String,
  },
  files: [
    {
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isChecked: {
    type: Boolean,
    default: false,
  },
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approvalNotes: {
    type: String,
  },
  checkedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
