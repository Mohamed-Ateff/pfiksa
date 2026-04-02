import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { toggleTheme, isDark } = useThemeMode();
  const isRtl = lang === "ar";

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("notifications-page")
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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(t("manager.errorLoadingReports"));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setSuccess(t("manager.markAllRead"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
        {/* Header */}
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
                  <Tooltip title={t("manager.backToDashboard")}>
                    <IconButton
                      onClick={() => navigate("/manager-dashboard")}
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
                      <ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
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
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <NotificationsIcon
                    sx={{
                      color: "#118dd3",
                      fontSize: { xs: "1.4rem", sm: "1.75rem" },
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.2rem", sm: "1.5rem" },
                    }}
                  >
                    {t("manager.notifications")}
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={unreadCount}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255, 87, 34, 0.15)",
                        color: "#ff5722",
                        border: "1px solid rgba(255, 87, 34, 0.4)",
                        fontWeight: 700,
                        minWidth: 28,
                      }}
                    />
                  )}
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {notifications.length} {isRtl ? "إشعار" : "notifications"}{" "}
                  &middot; {unreadCount} {isRtl ? "غير مقروء" : "unread"}
                </Typography>
              </Box>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllRead}
                  startIcon={<DoneAllIcon />}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: isDark
                      ? "rgba(17, 141, 211, 0.4)"
                      : "rgba(17, 141, 211, 0.5)",
                    color: "#118dd3",
                    "&:hover": {
                      borderColor: "#118dd3",
                      backgroundColor: "rgba(17, 141, 211, 0.08)",
                    },
                  }}
                >
                  {t("manager.markAllRead")}
                </Button>
              )}
            </Stack>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                borderRadius: 0,
                textAlign: "center",
                backgroundColor: isDark
                  ? "rgba(18, 20, 33, 0.75)"
                  : "rgba(255, 255, 255, 0.95)",
                border: isDark ? "1px solid #2a2f4f" : "1px solid #e0e0e0",
              }}
            >
              <NotificationsIcon
                sx={{
                  fontSize: 64,
                  color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  mb: 2,
                }}
              />
              <Typography color="text.secondary">
                {t("manager.noNotifications")}
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {notifications.map((notif) => (
                <Paper
                  key={notif.id}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 0,
                    opacity: notif.is_read ? 0.65 : 1,
                    backgroundColor: isDark
                      ? notif.is_read
                        ? "rgba(18, 20, 33, 0.7)"
                        : "rgba(18, 20, 33, 0.95)"
                      : notif.is_read
                        ? "rgba(255,255,255,0.7)"
                        : "#ffffff",
                    border: notif.is_read
                      ? isDark
                        ? "1px solid #2a2f4f"
                        : "1px solid #e0e0e0"
                      : notif.type === "edited_report"
                        ? "1px solid rgba(255, 152, 0, 0.5)"
                        : "1px solid rgba(17, 141, 211, 0.5)",
                    borderLeft: notif.is_read
                      ? undefined
                      : `4px solid ${
                          notif.type === "edited_report" ? "#ff9800" : "#118dd3"
                        }`,
                    boxShadow: notif.is_read
                      ? "none"
                      : isDark
                        ? "0 8px 24px rgba(4, 6, 18, 0.4)"
                        : "0 4px 16px rgba(0, 0, 0, 0.06)",
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor:
                          notif.type === "edited_report"
                            ? "rgba(255, 152, 0, 0.15)"
                            : "rgba(17, 141, 211, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <NotificationsIcon
                        sx={{
                          fontSize: 20,
                          color:
                            notif.type === "edited_report"
                              ? "#ff9800"
                              : "#118dd3",
                        }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ mb: 0.25 }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {notif.type === "edited_report"
                            ? t("manager.editedReport")
                            : t("manager.newReport")}
                        </Typography>
                        {!notif.is_read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                notif.type === "edited_report"
                                  ? "#ff9800"
                                  : "#118dd3",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t("manager.notifFrom")}{" "}
                        <strong>{notif.employee_name}</strong>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.25, display: "block" }}
                      >
                        {new Date(notif.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        notif.type === "edited_report"
                          ? t("manager.edited")
                          : "New"
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          notif.type === "edited_report"
                            ? "rgba(255, 152, 0, 0.15)"
                            : "rgba(17, 141, 211, 0.15)",
                        color:
                          notif.type === "edited_report"
                            ? "#ff9800"
                            : "#118dd3",
                        border:
                          notif.type === "edited_report"
                            ? "1px solid rgba(255, 152, 0, 0.3)"
                            : "1px solid rgba(17, 141, 211, 0.3)",
                        fontWeight: 600,
                        alignSelf: { xs: "flex-start", sm: "center" },
                      }}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default Notifications;
