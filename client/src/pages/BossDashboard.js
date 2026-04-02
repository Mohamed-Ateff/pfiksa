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
  Divider,
  Grid,
  Stack,
  Chip,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PrintIcon from "@mui/icons-material/Print";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";

function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportSearch, setReportSearch] = useState("");
  const [activeReport, setActiveReport] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [printReport, setPrintReport] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
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
  }, [selectedDate]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("boss-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchReports = async (date) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*, employee:profiles!employee_id(id, name, email, position)")
        .eq("date", date)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(t("manager.errorLoadingReports"));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (reportId, isChecked, notes = "") => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .update({ is_checked: !isChecked, approval_note: notes })
        .eq("id", reportId)
        .select("*, employee:profiles!employee_id(id, name, email, position)")
        .single();
      if (error) throw error;
      const updated = { ...data, is_edited: false };
      setReports(reports.map((r) => (r.id === reportId ? updated : r)));
      if (activeReport?.id === reportId) {
        setActiveReport(updated);
      }
      // Clear is_edited flag (silent fail if column not yet migrated)
      supabase
        .from("reports")
        .update({ is_edited: false })
        .eq("id", reportId)
        .catch(() => {});
    } catch (err) {
      setError(t("manager.errorUpdatingReport"));
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

    const employeeName = report.employee?.name || "";
    const completedTasks = report.completed_tasks || "";
    const inProgressTasks = report.in_progress_tasks || "";
    const commitments = report.commitments || "";
    const challenges = report.challenges || "";

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
    setApprovalNotes(report?.approval_note || "");
  };

  const handleCloseReport = () => {
    setActiveReport(null);
    setApprovalNotes("");
  };

  const handlePrintReport = (report) => {
    setPrintReport(report);
    setTimeout(() => handlePrint(), 0);
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleOpenNotifications = async () => {
    // Mark all as read, then navigate to notifications page
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length > 0) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("is_read", false);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
    navigate("/notifications");
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
                  <Tooltip title={t("manager.notifications")}>
                    <IconButton
                      onClick={handleOpenNotifications}
                      sx={{
                        width: { xs: 38, sm: 44 },
                        height: { xs: 38, sm: 44 },
                        color: isDark ? "#ffffff" : "#333333",
                        border:
                          unreadCount > 0
                            ? "1px solid #f2b45e"
                            : isDark
                              ? "1px solid #2a2f4f"
                              : "1px solid #cccccc",
                        backgroundColor:
                          unreadCount > 0
                            ? isDark
                              ? "rgba(242, 180, 94, 0.15)"
                              : "rgba(255, 152, 0, 0.08)"
                            : isDark
                              ? "#121421"
                              : "#f5f5f5",
                        "&:hover": {
                          backgroundColor: isDark ? "#1f2440" : "#e0e0e0",
                        },
                      }}
                    >
                      <Badge badgeContent={unreadCount} color="error" max={99}>
                        <NotificationsIcon
                          sx={{ fontSize: { xs: 18, sm: 24 } }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("manager.userManagementTooltip")}>
                    <IconButton
                      onClick={() => navigate("/user-management")}
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
                    {reports.filter((report) => report.is_checked).length}
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
                    {reports.filter((report) => !report.is_checked).length}
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
                  <Grid item xs={12} sm={6} md={4} key={report.id}>
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
                              {report.employee?.name || t("common.na")}
                            </Typography>
                          </Box>
                          <Chip
                            label={
                              report.is_checked
                                ? t("employee.checked")
                                : t("employee.pending")
                            }
                            size="small"
                            sx={{
                              backgroundColor: report.is_checked
                                ? "rgba(17, 141, 211, 0.2)"
                                : "rgba(255, 180, 94, 0.2)",
                              color: report.is_checked ? "#118dd3" : "#f2b45e",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {report.is_edited && (
                            <Chip
                              label={t("manager.edited")}
                              size="small"
                              sx={{
                                backgroundColor: isDark
                                  ? "rgba(255, 152, 0, 0.2)"
                                  : "rgba(255, 152, 0, 0.1)",
                                color: "#ff9800",
                                border: "1px solid rgba(255, 152, 0, 0.4)",
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ minHeight: 60 }}
                        >
                          {report.completed_tasks
                            ? `${report.completed_tasks.slice(0, 120)}...`
                            : t("manager.noTasks")}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {report.is_checked && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("employee.checked")}
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
                            checked={report.is_checked}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() =>
                              handleCheckboxChange(report.id, report.is_checked)
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
                {printReport?.employee?.name || t("manager.employeeLabel")}
              </Typography>
              {printReport?.is_checked && (
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {t("employee.checked")}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: "#333333", mb: 2 }}>
                {printReport?.created_at
                  ? new Date(printReport.created_at).toLocaleDateString()
                  : selectedDate}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.completedTasks")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.completed_tasks || t("manager.noTasks")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.inProgress")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.in_progress_tasks || t("manager.none")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.commitments")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.commitments || t("manager.none")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.challenges")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.challenges || t("manager.none")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#111111" }}>
                  {t("manager.approvalNotes")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333333" }}>
                  {printReport?.approval_note || t("manager.none")}
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
                    }}
                  />
                  {activeReport?.is_checked && (
                    <Typography variant="body2" color="text.secondary">
                      {t("employee.checked")}
                    </Typography>
                  )}
                  {activeReport?.is_edited && (
                    <Chip
                      label={t("manager.edited")}
                      size="small"
                      sx={{
                        backgroundColor: isDark
                          ? "rgba(255, 152, 0, 0.2)"
                          : "rgba(255, 152, 0, 0.1)",
                        color: "#ff9800",
                        border: "1px solid rgba(255, 152, 0, 0.4)",
                        fontWeight: 700,
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
                      {t("manager.employeeLabel")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeReport?.employee?.name || t("common.na")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("manager.email")}:{" "}
                      {activeReport?.employee?.email || t("common.na")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("manager.position")}:{" "}
                      {activeReport?.employee?.position ||
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
                      {activeReport?.completed_tasks || t("manager.noTasks")}
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
                      {activeReport?.in_progress_tasks || t("manager.none")}
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
                      {activeReport?.commitments || t("manager.none")}
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
                      {activeReport?.challenges || t("manager.none")}
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
                  activeReport?.id &&
                  handleCheckboxChange(
                    activeReport.id,
                    activeReport.is_checked,
                    approvalNotes,
                  )
                }
                variant="contained"
                disabled={!activeReport}
              >
                {activeReport?.is_checked
                  ? t("manager.markUnchecked")
                  : t("manager.markChecked")}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}

export default ManagerDashboard;
