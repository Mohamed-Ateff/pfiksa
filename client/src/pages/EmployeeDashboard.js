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
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import { reportService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

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
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const isRtl = lang === "ar";

  const totalReports = reports.length;
  const checkedReports = reports.filter((report) => report.isChecked).length;
  const pendingReports = totalReports - checkedReports;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportService.getMyReports();
      setReports(response.data);
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
      const data = new FormData();
      data.append("completedTasks", formData.completedTasks);
      data.append("inProgressTasks", formData.inProgressTasks);
      data.append("commitments", formData.commitments);
      data.append("challenges", formData.challenges);
      files.forEach((file) => data.append("files", file));

      await reportService.createReport(data);
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
      setError(err.response?.data?.message || t("employee.reportSubmitError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await reportService.deleteReport(deleteConfirm);
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

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(17, 141, 211, 0.2), transparent 45%), linear-gradient(180deg, #0b0f1f 0%, #121421 55%, #0f1324 100%)",
        color: "#e9edff",
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
                background:
                  "linear-gradient(130deg, rgba(17, 141, 211, 0.18), rgba(18, 20, 33, 0.95) 60%)",
                border: "1px solid rgba(17, 141, 211, 0.25)",
                boxShadow: "0 18px 40px rgba(5, 8, 20, 0.55)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ flexGrow: 1 }}
                >
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Logo"
                    sx={{ height: 52, width: "auto", objectFit: "contain" }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 700, letterSpacing: "0.01em" }}
                    >
                      {t("common.appName")}
                    </Typography>
                    <Typography variant="body2" color="#c7cbe4">
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
                  sx={{ display: { xs: "none", md: "flex" } }}
                >
                  <Button
                    size="small"
                    onClick={() => setLang(lang === "en" ? "ar" : "en")}
                    sx={{
                      minWidth: 44,
                      height: 44,
                      px: 1.25,
                      borderRadius: "999px",
                      lineHeight: 1,
                      color: "#ffffff",
                      border: "1px solid #118dd3",
                      backgroundColor: "#118dd3",
                      "&:hover": { backgroundColor: "#0f7fbf" },
                    }}
                  >
                    {t("common.languageSwitch")}
                  </Button>
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      width: 44,
                      height: 44,
                      color: "#ffffff",
                      border: "1px solid #2a2f4f",
                      backgroundColor: "#121421",
                      "&:hover": { backgroundColor: "#1f2440" },
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Stack>
              </Stack>
              {/* On mobile, show icons below header */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 2, display: { xs: "flex", md: "none" } }}
              >
                <Button
                  size="small"
                  onClick={() => setLang(lang === "en" ? "ar" : "en")}
                  sx={{
                    minWidth: 44,
                    height: 44,
                    px: 1.25,
                    borderRadius: "999px",
                    lineHeight: 1,
                    color: "#ffffff",
                    border: "1px solid #118dd3",
                    backgroundColor: "#118dd3",
                    "&:hover": { backgroundColor: "#0f7fbf" },
                  }}
                >
                  {t("common.languageSwitch")}
                </Button>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    width: 44,
                    height: 44,
                    color: "#ffffff",
                    border: "1px solid #2a2f4f",
                    backgroundColor: "#121421",
                    "&:hover": { backgroundColor: "#1f2440" },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Stack>
            </Paper>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
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
              background:
                "linear-gradient(135deg, rgba(17, 141, 211, 0.14) 0%, rgba(18, 20, 33, 0.85) 55%, rgba(15, 19, 36, 0.95) 100%)",
              border: "1px solid rgba(17, 141, 211, 0.3)",
              boxShadow: "0 20px 40px rgba(7, 10, 24, 0.6)",
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
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {t("employee.snapshotTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("employee.snapshotSubtitle")}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid rgba(17, 141, 211, 0.2)",
                    background:
                      "linear-gradient(150deg, rgba(18, 20, 33, 0.95), rgba(17, 141, 211, 0.12))",
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("employee.totalSubmitted")}
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#118dd3" }}>
                    {totalReports}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid rgba(17, 141, 211, 0.2)",
                    background:
                      "linear-gradient(150deg, rgba(18, 20, 33, 0.95), rgba(17, 141, 211, 0.12))",
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("employee.checked")}
                  </Typography>
                  <Typography variant="h4">{checkedReports}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid rgba(17, 141, 211, 0.2)",
                    background:
                      "linear-gradient(150deg, rgba(18, 20, 33, 0.95), rgba(17, 141, 211, 0.12))",
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("employee.pending")}
                  </Typography>
                  <Typography variant="h4">{pendingReports}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 0,
                  background:
                    "linear-gradient(140deg, rgba(18, 20, 33, 0.85) 0%, rgba(17, 141, 211, 0.12) 100%)",
                  border: "1px solid rgba(42, 47, 79, 0.9)",
                  boxShadow: "0 18px 34px rgba(5, 8, 20, 0.55)",
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
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {t("employee.submitTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                          backgroundColor: "rgba(15, 19, 36, 0.85)",
                          border: "1px solid rgba(42, 47, 79, 0.9)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: "#cfd3ff",
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
                          backgroundColor: "rgba(15, 19, 36, 0.85)",
                          border: "1px solid rgba(42, 47, 79, 0.9)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: "#cfd3ff",
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
                          backgroundColor: "rgba(15, 19, 36, 0.85)",
                          border: "1px solid rgba(42, 47, 79, 0.9)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: "#cfd3ff",
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
                          backgroundColor: "rgba(15, 19, 36, 0.85)",
                          border: "1px solid rgba(42, 47, 79, 0.9)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: "#cfd3ff",
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
                      backgroundColor: "rgba(15, 19, 36, 0.85)",
                      border: "1px dashed rgba(17, 141, 211, 0.45)",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{
                          borderColor: "rgba(17, 141, 211, 0.6)",
                          color: "#e9edff",
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
                backgroundColor: "rgba(18, 20, 33, 0.75)",
                border: "1px solid rgba(42, 47, 79, 0.9)",
                boxShadow: "0 14px 26px rgba(5, 8, 20, 0.45)",
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
                    backgroundColor: "rgba(17, 141, 211, 0.18)",
                    color: "#9ed6f5",
                    border: "1px solid rgba(17, 141, 211, 0.4)",
                  }}
                />
              </Stack>
            </Paper>
            <Grid container spacing={2}>
              {reports.map((report) => (
                <Grid item xs={12} md={4} key={report._id}>
                  <Paper
                    onClick={() => handleOpenReport(report)}
                    sx={{
                      p: 2.5,
                      borderRadius: 0,
                      cursor: "pointer",
                      height: "100%",
                      position: "relative",
                      background:
                        "linear-gradient(160deg, rgba(18, 20, 33, 0.95) 0%, rgba(17, 141, 211, 0.1) 100%)",
                      border: "1px solid rgba(42, 47, 79, 0.9)",
                      boxShadow: "0 14px 28px rgba(4, 6, 18, 0.5)",
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
                        opacity: 0.6,
                      },
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: "rgba(17, 141, 211, 0.6)",
                        boxShadow: "0 20px 38px rgba(6, 10, 24, 0.65)",
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {new Date(report.createdAt).toLocaleDateString()}
                        </Typography>
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
                        <Box sx={{ flexGrow: 1 }} />
                        <Chip
                          label={`${t("employee.files")}: ${
                            report.files?.length || 0
                          }`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(17, 141, 211, 0.15)",
                            color: "#9ed6f5",
                            border: "1px solid rgba(17, 141, 211, 0.35)",
                          }}
                        />
                      </Stack>
                      {report.checkedBy?.name && (
                        <Typography variant="caption" color="text.secondary">
                          {t("employee.checkedBy")}: {report.checkedBy.name}
                        </Typography>
                      )}
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
                          : t("employee.noTasks")}
                      </Typography>
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
                      ? new Date(activeReport.createdAt).toLocaleDateString()
                      : ""}
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
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  />
                  {activeReport?.checkedBy?.name && (
                    <Chip
                      label={`${t("employee.checkedBy")}: ${
                        activeReport.checkedBy.name
                      }`}
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
                      backgroundColor: "#181b2f",
                      border: "1px solid #2a2f4f",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("employee.completedTasks")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.completedTasks ||
                        activeReport?.tasks ||
                        t("employee.noTasks")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: "#121421",
                      border: "1px solid #2a2f4f",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("employee.inProgress")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.inProgressTasks || t("employee.none")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: "#121421",
                      border: "1px solid #2a2f4f",
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
                      backgroundColor: "#121421",
                      border: "1px solid #2a2f4f",
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
                      backgroundColor: "#121421",
                      border: "1px solid #2a2f4f",
                    }}
                  >
                    <Typography variant="subtitle2">
                      {t("employee.approvalNotes")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.approvalNotes || t("employee.none")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      backgroundColor: "#121421",
                      border: "1px solid #2a2f4f",
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
                  if (activeReport?._id) {
                    setDeleteConfirm(activeReport._id);
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
