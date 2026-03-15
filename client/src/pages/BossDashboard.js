import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
  Checkbox,
  Button,
  TextField,
  CircularProgress,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Grid,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PrintIcon from "@mui/icons-material/Print";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { reportService, authService, userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";

function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "employee",
    position: "",
  });
  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState({
    id: "",
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportSearch, setReportSearch] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    position: "",
  });
  const [activeReport, setActiveReport] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [printReport, setPrintReport] = useState(null);
  const printRef = useRef();
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { mode, toggleTheme, isDark } = useThemeMode();
  const isRtl = lang === "ar";
  const getInitials = (name) => {
    if (!name) {
      return "?";
    }
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase()).join("");
  };

  useEffect(() => {
    fetchReports(selectedDate);
    fetchUsers();
  }, [selectedDate]);

  const fetchReports = async (date) => {
    setLoading(true);
    try {
      const response = await reportService.getReportsByDate(date);
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(t("manager.errorLoadingReports"));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(t("manager.errorLoadingUsers"));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCheckboxChange = async (reportId, isChecked, notes = "") => {
    try {
      const response = await reportService.updateReportStatus(
        reportId,
        !isChecked,
        notes,
      );
      setReports(
        reports.map((r) => (r._id === reportId ? response.data.report : r)),
      );
      if (activeReport?._id === reportId) {
        setActiveReport(response.data.report);
      }
    } catch (err) {
      setError(t("manager.errorUpdatingReport"));
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreateLoading(true);

    try {
      await authService.createUser(createForm);
      setSuccess(t("manager.userCreated"));
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "employee",
        position: "",
      });
      setCreateOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t("manager.errorCreatingUser"));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) {
      return;
    }

    try {
      await userService.deleteUser(deleteUserId);
      setSuccess(t("manager.userDeleted"));
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t("manager.errorDeletingUser"));
    }
  };

  const openEditUser = (userItem) => {
    setEditForm({
      id: userItem._id,
      name: userItem.name || "",
      email: userItem.email || "",
      role: userItem.role || "employee",
      position: userItem.position || "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await userService.updateUser(editForm.id, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        position: editForm.position,
      });
      // If the edited user is the currently logged-in user, update the header too
      if (user && (user.id === editForm.id || user._id === editForm.id)) {
        updateUser({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          position: editForm.position,
        });
      }
      setSuccess(t("manager.userUpdated"));
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t("manager.errorUpdatingUser"));
    }
  };

  const openResetPassword = (userItem) => {
    setResetForm({ id: userItem._id, name: userItem.name || "", password: "" });
    setResetOpen(true);
  };

  const handleResetChange = (e) => {
    const { value } = e.target;
    setResetForm((prev) => ({ ...prev, password: value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await userService.updateUserPassword(resetForm.id, resetForm.password);
      setSuccess(t("manager.passwordUpdated"));
      setResetOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message || t("manager.errorUpdatingPassword"),
      );
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${t("manager.dailyReports")} - ${selectedDate}`,
  });
  const normalizedSearch = reportSearch.trim().toLowerCase();
  const filteredReports = reports.filter((report) => {
    if (!normalizedSearch) {
      return true;
    }

    const employeeName = report.employeeId?.name || "";
    const completedTasks = report.completedTasks || report.tasks || "";
    const inProgressTasks = report.inProgressTasks || "";
    const commitments = report.commitments || report.notes || "";
    const challenges = report.challenges || report.struggles || "";

    const haystack = [
      employeeName,
      completedTasks,
      inProgressTasks,
      commitments,
      challenges,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenReport = (report) => {
    setActiveReport(report);
    setApprovalNotes(report?.approvalNotes || "");
  };

  const handleCloseReport = () => {
    setActiveReport(null);
    setApprovalNotes("");
  };

  const handlePrintReport = (report) => {
    setPrintReport(report);
    setTimeout(() => handlePrint(), 0);
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: isDark
          ? "radial-gradient(circle at top, rgba(17, 141, 211, 0.2), transparent 45%), linear-gradient(180deg, #0b0f1f 0%, #121421 55%, #0f1324 100%)"
          : "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 55%, #e2e8f0 100%)",
        color: isDark ? "#e9edff" : "#1a1a2e",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -220,
          right: -180,
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(17, 141, 211, 0.35), rgba(17, 141, 211, 0) 70%)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -260,
          left: -160,
          width: 520,
          height: 520,
          background:
            "radial-gradient(circle, rgba(242, 180, 94, 0.18), rgba(242, 180, 94, 0) 70%)",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ pt: { xs: 2, md: 3 }, pb: 0 }}>
          <Container maxWidth="lg">
            <Paper
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 0,
                background: isDark
                  ? "linear-gradient(130deg, rgba(17, 141, 211, 0.18), rgba(18, 20, 33, 0.95) 60%)"
                  : "linear-gradient(130deg, rgba(17, 141, 211, 0.08), rgba(255, 255, 255, 0.98) 60%)",
                border: isDark
                  ? "1px solid rgba(17, 141, 211, 0.25)"
                  : "1px solid rgba(17, 141, 211, 0.15)",
                boxShadow: isDark
                  ? "0 18px 40px rgba(5, 8, 20, 0.55)"
                  : "0 4px 20px rgba(0, 0, 0, 0.08)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexGrow: 1,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Box
                    component="img"
                    src={isDark ? "/logo.png" : "/logo-white.png"}
                    alt="Logo"
                    sx={{
                      height: { xs: 40, sm: 52 },
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {user?.name || t("common.manager")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        color: isDark ? "#7f86b0" : "#5a5a7a",
                      }}
                    >
                      {user?.position || t("common.manager")}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => setLang(lang === "en" ? "ar" : "en")}
                    sx={{
                      minWidth: { xs: 38, sm: 44 },
                      height: { xs: 38, sm: 44 },
                      px: 1.25,
                      borderRadius: "999px",
                      lineHeight: 1,
                      color: "#ffffff",
                      border: "1px solid #118dd3",
                      backgroundColor: "#118dd3",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "&:hover": { backgroundColor: "#0f7fbf" },
                    }}
                  >
                    {t("common.languageSwitch")}
                  </Button>
                  <IconButton
                    onClick={toggleTheme}
                    sx={{
                      width: { xs: 38, sm: 44 },
                      height: { xs: 38, sm: 44 },
                      color: isDark ? "#f2b45e" : "#118dd3",
                      border: isDark
                        ? "1px solid #f2b45e"
                        : "1px solid #118dd3",
                      backgroundColor: isDark
                        ? "rgba(242, 180, 94, 0.1)"
                        : "rgba(17, 141, 211, 0.1)",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(242, 180, 94, 0.2)"
                          : "rgba(17, 141, 211, 0.2)",
                      },
                    }}
                  >
                    {isDark ? (
                      <LightModeIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                    ) : (
                      <DarkModeIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                    )}
                  </IconButton>
                  <Tooltip title={t("manager.userManagementTooltip")}>
                    <IconButton
                      onClick={() => setUsersOpen(true)}
                      sx={{
                        width: { xs: 38, sm: 44 },
                        height: { xs: 38, sm: 44 },
                        color: isDark ? "#ffffff" : "#333333",
                        border: isDark
                          ? "1px solid #2a2f4f"
                          : "1px solid #cccccc",
                        backgroundColor: isDark ? "#121421" : "#f5f5f5",
                        "&:hover": {
                          backgroundColor: isDark ? "#1f2440" : "#e0e0e0",
                        },
                        mr: 0,
                      }}
                    >
                      <PeopleAltIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      width: { xs: 38, sm: 44 },
                      height: { xs: 38, sm: 44 },
                      color: isDark ? "#ffffff" : "#333333",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #cccccc",
                      backgroundColor: isDark ? "#121421" : "#f5f5f5",
                      "&:hover": {
                        backgroundColor: isDark ? "#1f2440" : "#e0e0e0",
                      },
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>

        <Container
          maxWidth="lg"
          sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 0,
              mb: 3,
              position: "relative",
              overflow: "hidden",
              background: isDark
                ? "linear-gradient(135deg, rgba(17, 141, 211, 0.14) 0%, rgba(18, 20, 33, 0.85) 55%, rgba(15, 19, 36, 0.95) 100%)"
                : "linear-gradient(135deg, rgba(17, 141, 211, 0.06) 0%, rgba(255, 255, 255, 0.95) 55%, rgba(248, 250, 252, 1) 100%)",
              border: isDark
                ? "1px solid rgba(17, 141, 211, 0.3)"
                : "1px solid rgba(17, 141, 211, 0.15)",
              boxShadow: isDark
                ? "0 20px 40px rgba(7, 10, 24, 0.6)"
                : "0 4px 20px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  {t("manager.dailyReports")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {t("manager.dailyReportsSubtitle")}
                </Typography>
              </Box>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                inputProps={{
                  max: new Date().toISOString().split("T")[0],
                  dir: isRtl ? "rtl" : "ltr",
                }}
                sx={{
                  maxWidth: { xs: "100%", sm: 220 },
                  width: { xs: "100%", sm: "auto" },
                  "& input": {
                    textAlign: isRtl ? "right" : "left",
                  },
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: isDark ? "invert(1)" : "none",
                    opacity: 0.9,
                  },
                }}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={6} md={4}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: isDark
                      ? "1px solid rgba(17, 141, 211, 0.2)"
                      : "1px solid rgba(17, 141, 211, 0.15)",
                    background: isDark
                      ? "linear-gradient(150deg, rgba(18, 20, 33, 0.95), rgba(17, 141, 211, 0.12))"
                      : "linear-gradient(150deg, rgba(255, 255, 255, 0.98), rgba(17, 141, 211, 0.05))",
                    boxShadow: isDark
                      ? "inset 0 0 0 1px rgba(255, 255, 255, 0.02)"
                      : "0 2px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                  >
                    {t("manager.totalReports")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#118dd3",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {reports.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: isDark
                      ? "1px solid rgba(17, 141, 211, 0.2)"
                      : "1px solid rgba(17, 141, 211, 0.15)",
                    background: isDark
                      ? "linear-gradient(150deg, rgba(18, 20, 33, 0.95), rgba(17, 141, 211, 0.12))"
                      : "linear-gradient(150deg, rgba(255, 255, 255, 0.98), rgba(17, 141, 211, 0.05))",
                    boxShadow: isDark
                      ? "inset 0 0 0 1px rgba(255, 255, 255, 0.02)"
                      : "0 2px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                  >
                    {t("employee.checked")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {reports.filter((report) => report.isChecked).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: isDark
                      ? "1px solid rgba(17, 141, 211, 0.2)"
                      : "1px solid rgba(17, 141, 211, 0.15)",
                    background: isDark
                      ? "linear-gradient(150deg, rgba(18, 20, 33, 0.95), rgba(17, 141, 211, 0.12))"
                      : "linear-gradient(150deg, rgba(255, 255, 255, 0.98), rgba(17, 141, 211, 0.05))",
                    boxShadow: isDark
                      ? "inset 0 0 0 1px rgba(255, 255, 255, 0.02)"
                      : "0 2px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                  >
                    {t("employee.pending")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {reports.filter((report) => !report.isChecked).length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div>
              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  mb: 2,
                  borderRadius: 0,
                  backgroundColor: isDark
                    ? "rgba(18, 20, 33, 0.75)"
                    : "rgba(255, 255, 255, 0.95)",
                  border: isDark
                    ? "1px solid rgba(42, 47, 79, 0.9)"
                    : "1px solid #e0e0e0",
                  boxShadow: isDark
                    ? "0 16px 30px rgba(5, 8, 20, 0.45)"
                    : "0 4px 16px rgba(0, 0, 0, 0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                >
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: "0.95rem", sm: "1.25rem" } }}
                  >
                    {t("manager.reportsFor", {
                      date: selectedDate,
                      shown: filteredReports.length,
                      total: reports.length,
                    })}
                  </Typography>
                  <TextField
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder={t("manager.searchReports")}
                    size="small"
                    inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                    sx={{
                      minWidth: { xs: "100%", sm: 240 },
                      backgroundColor: isDark ? "#0f1325" : "#ffffff",
                      borderRadius: 1,
                      "& fieldset": {
                        borderColor: isDark
                          ? "rgba(17, 141, 211, 0.25)"
                          : "#d0d0d0",
                      },
                      "& input": {
                        textAlign: isRtl ? "right" : "left",
                      },
                    }}
                  />
                </Stack>
              </Paper>
              <Grid container spacing={2}>
                {filteredReports.map((report) => (
                  <Grid item xs={12} sm={6} md={4} key={report._id}>
                    <Paper
                      onClick={() => handleOpenReport(report)}
                      sx={{
                        p: 2.5,
                        borderRadius: 0,
                        cursor: "pointer",
                        height: "100%",
                        background: isDark
                          ? "linear-gradient(160deg, rgba(18, 20, 33, 0.95) 0%, rgba(17, 141, 211, 0.1) 100%)"
                          : "linear-gradient(160deg, rgba(255, 255, 255, 0.98) 0%, rgba(17, 141, 211, 0.05) 100%)",
                        border: isDark
                          ? "1px solid rgba(42, 47, 79, 0.9)"
                          : "1px solid #e0e0e0",
                        boxShadow: isDark
                          ? "0 14px 28px rgba(4, 6, 18, 0.5)"
                          : "0 4px 16px rgba(0, 0, 0, 0.06)",
                        transition:
                          "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          borderColor: "rgba(17, 141, 211, 0.6)",
                          boxShadow: "0 20px 38px rgba(6, 10, 24, 0.65)",
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {report.employeeId?.name || t("common.na")}
                            </Typography>
                          </Box>
                          <Chip
                            label={
                              report.isChecked
                                ? t("employee.checked")
                                : t("employee.pending")
                            }
                            size="small"
                            sx={{
                              backgroundColor: report.isChecked
                                ? "rgba(17, 141, 211, 0.2)"
                                : "rgba(255, 180, 94, 0.2)",
                              color: report.isChecked ? "#118dd3" : "#f2b45e",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ minHeight: 60 }}
                        >
                          {report.completedTasks || report.tasks
                            ? `${(report.completedTasks || report.tasks).slice(
                                0,
                                120,
                              )}...`
                            : t("manager.noTasks")}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {report.isChecked && report.checkedBy?.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {report.checkedBy.email}
                            </Typography>
                          )}
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePrintReport(report);
                            }}
                            sx={{
                              color: isDark ? "#ffffff" : "#333333",
                              border: isDark
                                ? "1px solid #2a2f4f"
                                : "1px solid #d0d0d0",
                              backgroundColor: isDark ? "#121421" : "#f5f5f5",
                              "&:hover": {
                                backgroundColor: isDark ? "#1f2440" : "#e0e0e0",
                              },
                            }}
                            title={t("manager.printReport")}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                          <Checkbox
                            checked={report.isChecked}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() =>
                              handleCheckboxChange(report._id, report.isChecked)
                            }
                            disabled={loading}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}

          <Box
            sx={{
              position: "fixed",
              left: -10000,
              top: 0,
              width: 0,
              height: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <Box
              ref={printRef}
              sx={{
                p: 3,
                width: 800,
                backgroundColor: "#ffffff",
                color: "#111111",
              }}
            >
              <Typography variant="h5" sx={{ color: "#111111", mb: 1 }}>
                {t("manager.dailyReport")}
              </Typography>
              <Typography variant="body2" sx={{ color: "#333333" }}>
                {printReport?.employeeId?.name || t("manager.employeeLabel")}
              </Typography>
              {printReport?.checkedBy?.name && (
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {t("manager.checkedBy")}: {printReport.checkedBy.name}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: "#333333", mb: 2 }}>
                {printReport?.createdAt
                  ? new Date(printReport.createdAt).toLocaleDateString()
                  : selectedDate}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.completedTasks")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.completedTasks ||
                    printReport?.tasks ||
                    t("manager.noTasks")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.inProgress")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.inProgressTasks || t("manager.none")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.commitments")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.commitments ||
                    printReport?.notes ||
                    t("manager.none")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.challenges")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.challenges ||
                    printReport?.struggles ||
                    t("manager.none")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.approvalNotes")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.approvalNotes || t("manager.none")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.files")}
                </Typography>
                {printReport?.files?.length ? (
                  <Stack spacing={0.5}>
                    {printReport.files.map((file) => (
                      <Typography key={file.filename} variant="body2">
                        {file.originalName}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: "#333333" }}>
                    {t("manager.noFilesAttached")}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Dialog
            open={Boolean(activeReport)}
            onClose={handleCloseReport}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle sx={{ pb: 0 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {activeReport?.employeeId?.name ||
                      t("manager.reportDetails")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDate}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={
                      activeReport?.isChecked
                        ? t("employee.checked")
                        : t("employee.pending")
                    }
                    size="small"
                    sx={{
                      backgroundColor: activeReport?.isChecked
                        ? "rgba(17, 141, 211, 0.2)"
                        : "rgba(255, 180, 94, 0.2)",
                      color: activeReport?.isChecked ? "#118dd3" : "#f2b45e",
                    }}
                  />
                  {activeReport?.checkedBy?.name && (
                    <Typography variant="body2" color="text.secondary">
                      {t("manager.checkedBy")}: {activeReport.checkedBy.name}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#181b2f" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("manager.employeeLabel")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.employeeId?.name || t("common.na")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("manager.email")}:{" "}
                      {activeReport?.employeeId?.email || t("common.na")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("manager.position")}:{" "}
                      {activeReport?.employeeId?.position ||
                        t("manager.noPosition")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#121421" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("manager.completedTasks")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.completedTasks ||
                        activeReport?.tasks ||
                        t("manager.noTasks")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#121421" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("manager.inProgress")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.inProgressTasks || t("manager.none")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#121421" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("manager.commitments")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.commitments ||
                        activeReport?.notes ||
                        t("manager.none")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#121421" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("manager.challenges")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.challenges ||
                        activeReport?.struggles ||
                        t("manager.none")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#121421" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("employee.files")}
                    </Typography>
                    {activeReport?.files?.length ? (
                      <Stack spacing={0.75} sx={{ mt: 1 }}>
                        {activeReport.files.map((file) => (
                          <Typography key={file.filename} variant="body2">
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.originalName}
                            </a>
                          </Typography>
                        ))}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {t("manager.noFilesAttached")}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark ? "#121421" : "#f8f9fa",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("manager.approvalNotes")}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      value={approvalNotes}
                      onChange={(event) => setApprovalNotes(event.target.value)}
                      placeholder={t("manager.approvalNotesPlaceholder")}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReport}>{t("common.close")}</Button>
              <Button
                onClick={() =>
                  activeReport?._id &&
                  handleCheckboxChange(
                    activeReport._id,
                    activeReport.isChecked,
                    approvalNotes,
                  )
                }
                variant="contained"
                disabled={!activeReport}
              >
                {activeReport?.isChecked
                  ? t("manager.markUnchecked")
                  : t("manager.markChecked")}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={usersOpen}
            onClose={() => setUsersOpen(false)}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                m: { xs: 1, sm: 2 },
                maxHeight: { xs: "calc(100% - 16px)", sm: "calc(100% - 64px)" },
              },
            }}
          >
            <DialogTitle
              sx={{
                background: isDark
                  ? "linear-gradient(130deg, rgba(17, 141, 211, 0.18), rgba(18, 20, 33, 0.95) 60%)"
                  : "linear-gradient(130deg, rgba(17, 141, 211, 0.08), rgba(255, 255, 255, 0.98) 60%)",
                color: isDark ? "#e9edff" : "#1a1a2e",
                fontWeight: 700,
                fontSize: { xs: 18, sm: 24 },
                letterSpacing: 1,
                mb: 0,
                p: { xs: 1.5, sm: 2.5 },
                borderBottom: isDark
                  ? "1px solid rgba(17, 141, 211, 0.25)"
                  : "1px solid rgba(17, 141, 211, 0.15)",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <span>{t("manager.userManagement")}</span>
              <Button
                variant="contained"
                startIcon={<PersonAddAltIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.2 },
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: { xs: 14, sm: 16 },
                  background:
                    "linear-gradient(90deg, #0fc1d3 0%, #118dd3 100%)",
                  ml: { xs: 0, sm: 2 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {t("manager.addUser")}
              </Button>
            </DialogTitle>
            <DialogContent
              dividers
              sx={{ background: isDark ? "#181b2f" : "#f5f7fa" }}
            >
              {usersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Grid
                  container
                  spacing={3}
                  columns={12}
                  sx={{
                    maxWidth: { xs: "100vw", md: 1200 },
                    width: "100%",
                    margin: "0 auto",
                    overflowX: "hidden",
                  }}
                >
                  {users.map((userItem) => (
                    <Grid item xs={12} sm={6} md={6} key={userItem._id}>
                      <Paper
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          backgroundColor: isDark ? "#181b2f" : "#ffffff",
                          border: isDark
                            ? "1px solid #2a2f4f"
                            : "1px solid #e0e0e0",
                          height: "100%",
                          boxShadow: isDark
                            ? "0 2px 12px #10131e33"
                            : "0 2px 12px rgba(0,0,0,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={{ xs: 1.5, sm: 2 }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                          >
                            <Box
                              sx={{
                                width: { xs: 38, sm: 44 },
                                height: { xs: 38, sm: 44 },
                                borderRadius: "50%",
                                backgroundColor: "#118dd3",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: { xs: 16, sm: 20 },
                                letterSpacing: "0.02em",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(userItem.name)}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 700,
                                  color: isDark ? "#e9edff" : "#1a1a2e",
                                  mb: 0.5,
                                  fontSize: { xs: "0.9rem", sm: "1rem" },
                                }}
                              >
                                {userItem.name}
                              </Typography>
                              <Chip
                                label={
                                  userItem.role === "manager"
                                    ? t("manager.manager")
                                    : t("manager.employee")
                                }
                                size="small"
                                sx={{
                                  backgroundColor:
                                    userItem.role === "manager"
                                      ? "rgba(17, 141, 211, 0.2)"
                                      : "rgba(255, 180, 94, 0.2)",
                                  color:
                                    userItem.role === "manager"
                                      ? "#118dd3"
                                      : "#f2b45e",
                                  fontWeight: 700,
                                  mt: 0.5,
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                }}
                              />
                            </Box>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={{ xs: 0.5, sm: 1 }}
                            alignItems="center"
                            sx={{ mt: { xs: 1, sm: 0 } }}
                          >
                            <Tooltip title={t("manager.editUser")}>
                              <IconButton
                                onClick={() => openEditUser(userItem)}
                                size="small"
                                sx={{
                                  color: "#118dd3",
                                  border: "1px solid #118dd3",
                                  backgroundColor: isDark
                                    ? "#181b2f"
                                    : "#f5f7fa",
                                  width: { xs: 32, sm: 40 },
                                  height: { xs: 32, sm: 40 },
                                  "&:hover": {
                                    backgroundColor: isDark
                                      ? "#10131e"
                                      : "#e8f4fc",
                                  },
                                }}
                              >
                                <EditIcon
                                  sx={{ fontSize: { xs: 16, sm: 20 } }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("manager.resetPassword")}>
                              <IconButton
                                onClick={() => openResetPassword(userItem)}
                                size="small"
                                sx={{
                                  color: "#14b8a6",
                                  border: "1px solid #14b8a6",
                                  backgroundColor: isDark
                                    ? "#181b2f"
                                    : "#f5f7fa",
                                  width: { xs: 32, sm: 40 },
                                  height: { xs: 32, sm: 40 },
                                  "&:hover": {
                                    backgroundColor: isDark
                                      ? "#10131e"
                                      : "#e6f7f5",
                                  },
                                }}
                              >
                                <KeyIcon
                                  sx={{ fontSize: { xs: 16, sm: 20 } }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("manager.deleteUser")}>
                              <IconButton
                                onClick={() => setDeleteUserId(userItem._id)}
                                size="small"
                                sx={{
                                  color: "#ff4d4f",
                                  border: "1px solid #ff4d4f",
                                  backgroundColor: isDark
                                    ? "#181b2f"
                                    : "#f5f7fa",
                                  width: { xs: 32, sm: 40 },
                                  height: { xs: 32, sm: 40 },
                                  "&:hover": {
                                    backgroundColor: isDark
                                      ? "#2b1820"
                                      : "#fde8e8",
                                  },
                                }}
                              >
                                <DeleteIcon
                                  sx={{ fontSize: { xs: 16, sm: 20 } }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUsersOpen(false)}>
                {t("common.close")}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{t("manager.createUser")}</DialogTitle>
            <DialogContent dividers>
              <form id="create-user-form" onSubmit={handleCreateUser}>
                <TextField
                  fullWidth
                  label={t("manager.name")}
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label={t("manager.email")}
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label={t("manager.password")}
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label={t("manager.position")}
                  name="position"
                  value={createForm.position}
                  onChange={handleCreateChange}
                  margin="normal"
                />

                <FormLabel sx={{ mt: 2, display: "block" }}>
                  {t("manager.role")}
                </FormLabel>
                <RadioGroup
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateChange}
                  row
                >
                  <FormControlLabel
                    value="employee"
                    control={<Radio />}
                    label={t("manager.employee")}
                  />
                  <FormControlLabel
                    value="manager"
                    control={<Radio />}
                    label={t("manager.manager")}
                  />
                </RadioGroup>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                form="create-user-form"
                variant="contained"
                disabled={createLoading}
              >
                {createLoading ? (
                  <CircularProgress size={22} />
                ) : (
                  t("manager.createUser")
                )}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={!!deleteUserId}
            onClose={() => setDeleteUserId(null)}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>{t("manager.deleteUser")}</DialogTitle>
            <DialogContent dividers>
              {t("manager.deleteUserConfirm")}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteUserId(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleDeleteUser}
                color="error"
                variant="contained"
              >
                {t("common.delete")}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{t("manager.editUser")}</DialogTitle>
            <DialogContent dividers>
              <form id="edit-user-form" onSubmit={handleEditUser}>
                <TextField
                  fullWidth
                  label={t("manager.name")}
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  margin="normal"
                  required
                  inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                  sx={{
                    "& input": {
                      textAlign: isRtl ? "right" : "left",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label={t("manager.email")}
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  margin="normal"
                  required
                  inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                  sx={{
                    "& input": {
                      textAlign: isRtl ? "right" : "left",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label={t("manager.position")}
                  name="position"
                  value={editForm.position}
                  onChange={handleEditChange}
                  margin="normal"
                  inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                  sx={{
                    "& input": {
                      textAlign: isRtl ? "right" : "left",
                    },
                  }}
                />

                <FormLabel
                  sx={{
                    mt: 2,
                    display: "block",
                    textAlign: isRtl ? "right" : "left",
                    width: "100%",
                  }}
                >
                  {t("manager.role")}
                </FormLabel>
                <RadioGroup
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  row
                  sx={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    justifyContent: isRtl ? "flex-end" : "flex-start",
                  }}
                >
                  <FormControlLabel
                    value="employee"
                    control={<Radio />}
                    label={t("manager.employee")}
                    sx={{ mr: isRtl ? 0 : 2, ml: isRtl ? 2 : 0 }}
                  />
                  <FormControlLabel
                    value="manager"
                    control={<Radio />}
                    label={t("manager.manager")}
                    sx={{ mr: isRtl ? 0 : 2, ml: isRtl ? 2 : 0 }}
                  />
                </RadioGroup>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" form="edit-user-form" variant="contained">
                {t("common.saveChanges")}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={resetOpen}
            onClose={() => setResetOpen(false)}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>{t("manager.resetPassword")}</DialogTitle>
            <DialogContent dividers>
              <form id="reset-password-form" onSubmit={handleResetPassword}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {t("manager.setNewPasswordFor", {
                    name: resetForm.name || t("manager.thisUser"),
                  })}
                </Typography>
                <TextField
                  fullWidth
                  label={t("manager.newPassword")}
                  type="password"
                  value={resetForm.password}
                  onChange={handleResetChange}
                  margin="normal"
                  required
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResetOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                form="reset-password-form"
                variant="contained"
              >
                {t("common.updatePassword")}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}

export default ManagerDashboard;
