import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";

function EmployeeDashboard() {
  const [formData, setFormData] = useState({
    completedTasks: "",
    inProgressTasks: "",
    commitments: "",
    challenges: "",
  });
  const [files, setFiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({
    completedTasks: "",
    inProgressTasks: "",
    commitments: "",
    challenges: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { mode, toggleTheme, isDark } = useThemeMode();
  const isRtl = lang === "ar";

  const totalReports = reports.length;
  const checkedReports = reports.filter((report) => report.is_checked).length;
  const pendingReports = totalReports - checkedReports;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Upload files to Supabase Storage
      const uploadedFiles = [];
      for (const file of files) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(fileName, file);
        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("reports").getPublicUrl(fileName);
          uploadedFiles.push({
            filename: fileName,
            originalName: file.name,
            path: publicUrl,
          });
        }
      }

      const { data: insertedReport, error } = await supabase
        .from("reports")
        .insert({
          employee_id: user.id,
          date: new Date().toISOString().split("T")[0],
          completed_tasks: formData.completedTasks,
          in_progress_tasks: formData.inProgressTasks,
          commitments: formData.commitments,
          challenges: formData.challenges,
          files: uploadedFiles,
        })
        .select()
        .single();
      if (error) throw error;
      try {
        await supabase.from("notifications").insert({
          report_id: insertedReport.id,
          employee_id: user.id,
          employee_name: user.name || user.email || "",
          type: "new_report",
        });
      } catch (_) {}

      setSuccess(t("employee.reportSubmitted"));
      setFormData({
        completedTasks: "",
        inProgressTasks: "",
        commitments: "",
        challenges: "",
      });
      setFiles([]);
      fetchReports();
    } catch (err) {
      setError(err.message || t("employee.reportSubmitError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", deleteConfirm);
      if (error) throw error;
      setSuccess(t("employee.reportDeleted"));
      setDeleteConfirm(null);
      fetchReports();
    } catch (err) {
      setError(t("employee.reportDeleteError"));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenReport = (report) => {
    setActiveReport(report);
  };

  const handleCloseReport = () => {
    setActiveReport(null);
  };

  const handleEditOpen = (report, e) => {
    if (e) e.stopPropagation();
    setEditingReport(report);
    setEditForm({
      completedTasks: report.completed_tasks || "",
      inProgressTasks: report.in_progress_tasks || "",
      commitments: report.commitments || "",
      challenges: report.challenges || "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editingReport) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          completed_tasks: editForm.completedTasks,
          in_progress_tasks: editForm.inProgressTasks,
          commitments: editForm.commitments,
          challenges: editForm.challenges,
          is_edited: true,
        })
        .eq("id", editingReport.id);
      if (error) throw error;
      try {
        await supabase.from("notifications").insert({
          report_id: editingReport.id,
          employee_id: user.id,
          employee_name: user.name || user.email || "",
          type: "edited_report",
        });
      } catch (_) {}
      setSuccess(t("employee.reportUpdated"));
      setEditOpen(false);
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      setError(err.message || t("employee.reportUpdateError"));
    } finally {
      setEditLoading(false);
    }
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
          top: { xs: -150, md: -220 },
          right: { xs: -120, md: -180 },
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          background:
            "radial-gradient(circle, rgba(17, 141, 211, 0.35), rgba(17, 141, 211, 0) 70%)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: -180, md: -260 },
          left: { xs: -100, md: -160 },
          width: { xs: 350, md: 520 },
          height: { xs: 350, md: 520 },
          background:
            "radial-gradient(circle, rgba(242, 180, 94, 0.18), rgba(242, 180, 94, 0) 70%)",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ pt: { xs: 2, md: 3 }, pb: 0 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
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
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={{ xs: 1.5, sm: 2 }}
                  alignItems="center"
                  sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" } }}
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
                      {t("common.appName")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        color: isDark ? "#c7cbe4" : "#5a5a7a",
                      }}
                    >
                      {t("employee.welcomeBack", {
                        name: user?.name || "",
                      })}
                    </Typography>
                  </Box>
                </Stack>
                {/* On desktop, show icons in header. On mobile, hide here. */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ display: { xs: "none", sm: "flex" } }}
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
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      color: "#ffffff",
                      border: "1px solid #118dd3",
                      backgroundColor: "#118dd3",
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
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      width: { xs: 38, sm: 44 },
                      height: { xs: 38, sm: 44 },
                      color: isDark ? "#ffffff" : "#1a1a2e",
                      border: isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #d0d0d0",
                      backgroundColor: isDark ? "#121421" : "#ffffff",
                      "&:hover": {
                        backgroundColor: isDark ? "#1f2440" : "#f0f0f0",
                      },
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>
                </Stack>
              </Stack>
              {/* On mobile, show icons below header */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 2, display: { xs: "flex", sm: "none" } }}
              >
                <Button
                  size="small"
                  onClick={() => setLang(lang === "en" ? "ar" : "en")}
                  sx={{
                    minWidth: 38,
                    height: 38,
                    px: 1.25,
                    borderRadius: "999px",
                    lineHeight: 1,
                    fontSize: "0.75rem",
                    color: "#ffffff",
                    border: "1px solid #118dd3",
                    backgroundColor: "#118dd3",
                    "&:hover": { backgroundColor: "#0f7fbf" },
                  }}
                >
                  {t("common.languageSwitch")}
                </Button>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    width: 38,
                    height: 38,
                    color: isDark ? "#f2b45e" : "#118dd3",
                    border: isDark ? "1px solid #f2b45e" : "1px solid #118dd3",
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
                    <LightModeIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <DarkModeIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    width: 38,
                    height: 38,
                    color: isDark ? "#ffffff" : "#333333",
                    border: isDark ? "1px solid #2a2f4f" : "1px solid #cccccc",
                    backgroundColor: isDark ? "#121421" : "#f5f5f5",
                    "&:hover": {
                      backgroundColor: isDark ? "#1f2440" : "#e0e0e0",
                    },
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
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
              alignItems={{ xs: "flex-start", md: "center" }}
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
                  {t("employee.snapshotTitle")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {t("employee.snapshotSubtitle")}
                </Typography>
              </Box>
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
                    {t("employee.totalSubmitted")}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#118dd3",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {totalReports}
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
                    {checkedReports}
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
                    {pendingReports}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 0,
                  background: isDark
                    ? "linear-gradient(140deg, rgba(18, 20, 33, 0.85) 0%, rgba(17, 141, 211, 0.12) 100%)"
                    : "linear-gradient(140deg, rgba(255, 255, 255, 0.95) 0%, rgba(17, 141, 211, 0.05) 100%)",
                  border: isDark
                    ? "1px solid rgba(42, 47, 79, 0.9)"
                    : "1px solid rgba(17, 141, 211, 0.15)",
                  boxShadow: isDark
                    ? "0 18px 34px rgba(5, 8, 20, 0.55)"
                    : "0 4px 20px rgba(0, 0, 0, 0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", md: "center" }}
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
                      {t("employee.submitTitle")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      {t("employee.submitSubtitle")}
                    </Typography>
                  </Box>
                </Stack>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 0,
                          backgroundColor: isDark
                            ? "rgba(15, 19, 36, 0.85)"
                            : "rgba(255, 255, 255, 0.95)",
                          border: isDark
                            ? "1px solid rgba(42, 47, 79, 0.9)"
                            : "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: isDark ? "#cfd3ff" : "#1a1a2e",
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          {t("employee.completedTasksLabel")}
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          name="completedTasks"
                          value={formData.completedTasks}
                          onChange={handleChange}
                          required
                          placeholder={t("employee.completedTasksPlaceholder")}
                          inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                          sx={{
                            direction: isRtl ? "rtl" : "ltr",
                            "& textarea": {
                              textAlign: isRtl ? "right" : "left",
                            },
                          }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 0,
                          backgroundColor: isDark
                            ? "rgba(15, 19, 36, 0.85)"
                            : "rgba(255, 255, 255, 0.95)",
                          border: isDark
                            ? "1px solid rgba(42, 47, 79, 0.9)"
                            : "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: isDark ? "#cfd3ff" : "#1a1a2e",
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          {t("employee.inProgressLabel")}
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          name="inProgressTasks"
                          value={formData.inProgressTasks}
                          onChange={handleChange}
                          placeholder={t("employee.inProgressPlaceholder")}
                          inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                          sx={{
                            direction: isRtl ? "rtl" : "ltr",
                            "& textarea": {
                              textAlign: isRtl ? "right" : "left",
                            },
                          }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 0,
                          backgroundColor: isDark
                            ? "rgba(15, 19, 36, 0.85)"
                            : "rgba(255, 255, 255, 0.95)",
                          border: isDark
                            ? "1px solid rgba(42, 47, 79, 0.9)"
                            : "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: isDark ? "#cfd3ff" : "#1a1a2e",
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          {t("employee.commitmentsLabel")}
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          name="commitments"
                          value={formData.commitments}
                          onChange={handleChange}
                          placeholder={t("employee.commitmentsPlaceholder")}
                          inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                          sx={{
                            direction: isRtl ? "rtl" : "ltr",
                            "& textarea": {
                              textAlign: isRtl ? "right" : "left",
                            },
                          }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 0,
                          backgroundColor: isDark
                            ? "rgba(15, 19, 36, 0.85)"
                            : "rgba(255, 255, 255, 0.95)",
                          border: isDark
                            ? "1px solid rgba(42, 47, 79, 0.9)"
                            : "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: isDark ? "#cfd3ff" : "#1a1a2e",
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          {t("employee.challengesLabel")}
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          name="challenges"
                          value={formData.challenges}
                          onChange={handleChange}
                          placeholder={t("employee.challengesPlaceholder")}
                          inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                          sx={{
                            direction: isRtl ? "rtl" : "ltr",
                            "& textarea": {
                              textAlign: isRtl ? "right" : "left",
                            },
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: isDark
                        ? "rgba(15, 19, 36, 0.85)"
                        : "rgba(255, 255, 255, 0.95)",
                      border: isDark
                        ? "1px dashed rgba(17, 141, 211, 0.45)"
                        : "1px dashed rgba(17, 141, 211, 0.35)",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{
                          borderColor: "rgba(17, 141, 211, 0.6)",
                          color: isDark ? "#e9edff" : "#118dd3",
                          "&:hover": {
                            borderColor: "rgba(17, 141, 211, 0.9)",
                            backgroundColor: "rgba(17, 141, 211, 0.08)",
                          },
                        }}
                      >
                        {t("employee.attachFiles")}
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={handleFileChange}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />
                      </Button>
                      <Chip
                        label={
                          files.length > 0
                            ? t("employee.filesSelected", {
                                count: files.length,
                              })
                            : t("employee.noFilesSelected")
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            files.length > 0
                              ? "rgba(17, 141, 211, 0.15)"
                              : "rgba(255, 180, 94, 0.18)",
                          color: files.length > 0 ? "#9ed6f5" : "#f2b45e",
                          border:
                            files.length > 0
                              ? "1px solid rgba(17, 141, 211, 0.35)"
                              : "1px solid rgba(255, 180, 94, 0.45)",
                          fontWeight: files.length > 0 ? 500 : 700,
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {t("employee.multiFileHint")}
                    </Typography>
                  </Paper>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ mt: 3 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        px: 4,
                        background:
                          "linear-gradient(120deg, #118dd3 0%, #14b8a6 100%)",
                        boxShadow: "0 12px 24px rgba(17, 141, 211, 0.35)",
                        "&:hover": {
                          background:
                            "linear-gradient(120deg, #0f7fbf 0%, #0ea596 100%)",
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        t("employee.submitReport")
                      )}
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
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
                  : "1px solid rgba(17, 141, 211, 0.15)",
                boxShadow: isDark
                  ? "0 14px 26px rgba(5, 8, 20, 0.45)"
                  : "0 4px 20px rgba(0, 0, 0, 0.06)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {t("employee.yourReports")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("employee.yourReportsSubtitle")}
                  </Typography>
                </Box>
                <Chip
                  label={`${t("employee.totalSubmitted")}: ${totalReports}`}
                  size="small"
                  sx={{
                    backgroundColor: isDark
                      ? "rgba(17, 141, 211, 0.18)"
                      : "rgba(17, 141, 211, 0.12)",
                    color: isDark ? "#9ed6f5" : "#118dd3",
                    border: isDark
                      ? "1px solid rgba(17, 141, 211, 0.4)"
                      : "1px solid rgba(17, 141, 211, 0.3)",
                  }}
                />
              </Stack>
            </Paper>
            <Grid container spacing={2}>
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <Paper
                    onClick={() => handleOpenReport(report)}
                    sx={{
                      p: 2.5,
                      borderRadius: 0,
                      cursor: "pointer",
                      height: "100%",
                      position: "relative",
                      background: isDark
                        ? "linear-gradient(160deg, rgba(18, 20, 33, 0.95) 0%, rgba(17, 141, 211, 0.1) 100%)"
                        : "linear-gradient(160deg, rgba(255, 255, 255, 0.98) 0%, rgba(17, 141, 211, 0.05) 100%)",
                      border: isDark
                        ? "1px solid rgba(42, 47, 79, 0.9)"
                        : "1px solid rgba(17, 141, 211, 0.15)",
                      boxShadow: isDark
                        ? "0 14px 28px rgba(4, 6, 18, 0.5)"
                        : "0 4px 16px rgba(0, 0, 0, 0.06)",
                      transition:
                        "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background:
                          "linear-gradient(90deg, rgba(17, 141, 211, 0.7), rgba(20, 184, 166, 0.7))",
                        opacity: isDark ? 0.6 : 0.8,
                      },
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: "rgba(17, 141, 211, 0.6)",
                        boxShadow: isDark
                          ? "0 20px 38px rgba(6, 10, 24, 0.65)"
                          : "0 8px 24px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {new Date(report.created_at).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={
                            report.is_checked
                              ? t("employee.checked")
                              : t("employee.pending")
                          }
                          size="small"
                          sx={{
                            backgroundColor: report.is_checked
                              ? isDark
                                ? "rgba(17, 141, 211, 0.2)"
                                : "rgba(17, 141, 211, 0.12)"
                              : isDark
                                ? "rgba(255, 180, 94, 0.2)"
                                : "rgba(255, 152, 0, 0.12)",
                            color: report.is_checked
                              ? "#118dd3"
                              : isDark
                                ? "#f2b45e"
                                : "#e65100",
                            border: isDark
                              ? "1px solid rgba(255, 255, 255, 0.08)"
                              : "1px solid rgba(0, 0, 0, 0.08)",
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Chip
                          label={`${t("employee.files")}: ${
                            report.files?.length || 0
                          }`}
                          size="small"
                          sx={{
                            backgroundColor: isDark
                              ? "rgba(17, 141, 211, 0.15)"
                              : "rgba(17, 141, 211, 0.1)",
                            color: isDark ? "#9ed6f5" : "#118dd3",
                            border: isDark
                              ? "1px solid rgba(17, 141, 211, 0.35)"
                              : "1px solid rgba(17, 141, 211, 0.25)",
                          }}
                        />
                      </Stack>
                      {report.is_checked && (
                        <Typography variant="caption" color="text.secondary">
                          {t("employee.checked")}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minHeight: 60 }}
                      >
                        {report.completed_tasks
                          ? `${report.completed_tasks.slice(0, 120)}...`
                          : t("employee.noTasks")}
                      </Typography>
                      <Stack direction="row" justifyContent="flex-end">
                        <Tooltip title={t("employee.editReport")}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleEditOpen(report, e)}
                            sx={{
                              color: "#118dd3",
                              border: "1px solid rgba(17, 141, 211, 0.4)",
                              backgroundColor: isDark
                                ? "rgba(17, 141, 211, 0.08)"
                                : "rgba(17, 141, 211, 0.05)",
                              width: 32,
                              height: 32,
                              "&:hover": {
                                backgroundColor: isDark
                                  ? "rgba(17, 141, 211, 0.15)"
                                  : "rgba(17, 141, 211, 0.1)",
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
            <DialogTitle>{t("employee.confirmDeleteTitle")}</DialogTitle>
            <DialogContent>{t("employee.confirmDeleteBody")}</DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirm(null)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                {t("common.delete")}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle sx={{ pb: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {t("employee.editReport")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingReport
                  ? new Date(editingReport.created_at).toLocaleDateString()
                  : ""}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("employee.completedTasksLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="completedTasks"
                    value={editForm.completedTasks}
                    onChange={handleEditChange}
                    required
                    inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                    sx={{
                      "& textarea": { textAlign: isRtl ? "right" : "left" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("employee.inProgressLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="inProgressTasks"
                    value={editForm.inProgressTasks}
                    onChange={handleEditChange}
                    inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                    sx={{
                      "& textarea": { textAlign: isRtl ? "right" : "left" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("employee.commitmentsLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="commitments"
                    value={editForm.commitments}
                    onChange={handleEditChange}
                    inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                    sx={{
                      "& textarea": { textAlign: isRtl ? "right" : "left" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("employee.challengesLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="challenges"
                    value={editForm.challenges}
                    onChange={handleEditChange}
                    inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
                    sx={{
                      "& textarea": { textAlign: isRtl ? "right" : "left" },
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleEditSave}
                variant="contained"
                disabled={editLoading}
              >
                {editLoading ? (
                  <CircularProgress size={22} />
                ) : (
                  t("common.saveChanges")
                )}
              </Button>
            </DialogActions>
          </Dialog>

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
                    {t("employee.reportDetails")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeReport
                      ? new Date(activeReport.created_at).toLocaleDateString()
                      : ""}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={
                      activeReport?.is_checked
                        ? t("employee.checked")
                        : t("employee.pending")
                    }
                    size="small"
                    sx={{
                      backgroundColor: activeReport?.is_checked
                        ? "rgba(17, 141, 211, 0.2)"
                        : "rgba(255, 180, 94, 0.2)",
                      color: activeReport?.is_checked ? "#118dd3" : "#f2b45e",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  />
                  {activeReport?.is_checked && (
                    <Chip
                      label={t("employee.checked")}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(17, 141, 211, 0.12)",
                        color: "#9ed6f5",
                        border: "1px solid rgba(17, 141, 211, 0.35)",
                      }}
                    />
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
                      {t("employee.completedTasks")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.completed_tasks || t("employee.noTasks")}
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
                      {t("employee.inProgress")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.in_progress_tasks || t("employee.none")}
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
                      {t("employee.commitments")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.commitments ||
                        activeReport?.notes ||
                        t("employee.none")}
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
                      {t("employee.challenges")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.challenges ||
                        activeReport?.struggles ||
                        t("employee.none")}
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
                      {t("employee.approvalNotes")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.approval_note || t("employee.none")}
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
                        {t("employee.noFilesAttached")}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReport}>{t("common.close")}</Button>
              <Button
                onClick={() => {
                  if (activeReport) {
                    handleCloseReport();
                    handleEditOpen(activeReport);
                  }
                }}
                variant="outlined"
                startIcon={<EditIcon />}
              >
                {t("employee.editReport")}
              </Button>
              <Button
                onClick={() => {
                  if (activeReport?.id) {
                    setDeleteConfirm(activeReport.id);
                    handleCloseReport();
                  }
                }}
                color="error"
                variant="contained"
              >
                {t("common.delete")}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}

export default EmployeeDashboard;
