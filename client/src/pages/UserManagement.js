import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
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
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    position: "",
  });

  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { toggleTheme, isDark } = useThemeMode();
  const isRtl = lang === "ar";

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase()).join("");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(t("manager.errorLoadingUsers"));
    } finally {
      setUsersLoading(false);
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
      const { data, error } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: {
          data: {
            name: createForm.name,
            role: createForm.role,
            position: createForm.position,
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            name: createForm.name,
            email: createForm.email,
            role: createForm.role,
            position: createForm.position,
            is_active: true,
          },
          { onConflict: "id" },
        );
      }
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
      setError(err.message || t("manager.errorCreatingUser"));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", deleteUserId);
      if (error) throw error;
      setSuccess(t("manager.userDeleted"));
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || t("manager.errorDeletingUser"));
    }
  };

  const openEditUser = (userItem) => {
    setEditForm({
      id: userItem.id,
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
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          position: editForm.position,
        })
        .eq("id", editForm.id);
      if (error) throw error;
      if (user && user.id === editForm.id) {
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
      setError(err.message || t("manager.errorUpdatingUser"));
    }
  };

  const openResetPassword = (userItem) => {
    setResetForm({ id: userItem.id, name: userItem.name || "", password: "" });
    setResetOpen(true);
  };

  const handleResetChange = (e) => {
    setResetForm((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const userToReset = users.find((u) => u.id === resetForm.id);
      if (!userToReset?.email) throw new Error("User email not found");
      const { error } = await supabase.auth.resetPasswordForEmail(
        userToReset.email,
      );
      if (error) throw error;
      setSuccess("Password reset email sent to " + userToReset.email);
      setResetOpen(false);
    } catch (err) {
      setError(err.message || t("manager.errorUpdatingPassword"));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      {/* background blobs */}
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
                  <Tooltip
                    title={t("manager.backToDashboard") || "Back to dashboard"}
                  >
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

        {/* Page body */}
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>
          )}

          {/* Page header card */}
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
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  {t("manager.userManagement")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {t("manager.userManagementHint")}
                </Typography>
              </Box>
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
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {t("manager.addUser")}
              </Button>
            </Stack>
          </Paper>

          {/* Users grid */}
          {usersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {users.map((userItem) => (
                <Grid item xs={12} sm={6} md={4} key={userItem.id}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 0,
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
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Box
                        sx={{
                          width: { xs: 42, sm: 48 },
                          height: { xs: 42, sm: 48 },
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
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: isDark ? "#e9edff" : "#1a1a2e",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {userItem.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.8rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {userItem.email}
                        </Typography>
                        {userItem.position && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", mt: 0.25 }}
                          >
                            {userItem.position}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
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
                            userItem.role === "manager" ? "#118dd3" : "#f2b45e",
                          fontWeight: 700,
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                        }}
                      />
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title={t("manager.editUser")}>
                          <IconButton
                            onClick={() => openEditUser(userItem)}
                            size="small"
                            sx={{
                              color: "#118dd3",
                              border: "1px solid #118dd3",
                              backgroundColor: isDark ? "#181b2f" : "#f5f7fa",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": {
                                backgroundColor: isDark ? "#10131e" : "#e8f4fc",
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("manager.resetPassword")}>
                          <IconButton
                            onClick={() => openResetPassword(userItem)}
                            size="small"
                            sx={{
                              color: "#14b8a6",
                              border: "1px solid #14b8a6",
                              backgroundColor: isDark ? "#181b2f" : "#f5f7fa",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": {
                                backgroundColor: isDark ? "#10131e" : "#e6f7f5",
                              },
                            }}
                          >
                            <KeyIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("manager.deleteUser")}>
                          <IconButton
                            onClick={() => setDeleteUserId(userItem.id)}
                            size="small"
                            sx={{
                              color: "#ff4d4f",
                              border: "1px solid #ff4d4f",
                              backgroundColor: isDark ? "#181b2f" : "#f5f7fa",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": {
                                backgroundColor: isDark ? "#2b1820" : "#fde8e8",
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Create User Dialog */}
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

      {/* Delete User Dialog */}
      <Dialog
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("manager.deleteUser")}</DialogTitle>
        <DialogContent dividers>{t("manager.deleteUserConfirm")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserId(null)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
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
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
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
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
            />
            <TextField
              fullWidth
              label={t("manager.position")}
              name="position"
              value={editForm.position}
              onChange={handleEditChange}
              margin="normal"
              inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
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

      {/* Reset Password Dialog */}
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("manager.resetPassword")}</DialogTitle>
        <DialogContent dividers>
          <form id="reset-password-form" onSubmit={handleResetPassword}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
          <Button type="submit" form="reset-password-form" variant="contained">
            {t("common.updatePassword")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
