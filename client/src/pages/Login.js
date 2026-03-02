import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Stack,
  Chip,
  InputAdornment,
} from "@mui/material";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const isRtl = lang === "ar";

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      login(user, token);
      navigate(
        user.role === "manager" ? "/manager-dashboard" : "/employee-dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.message || t("login.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        color: "#e9edff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #10131e 0%, #181b2f 100%)",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Dynamic background blobs */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, #118dd3 0%, transparent 70%)",
          opacity: 0.18,
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -160,
          right: -140,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, #f2b45e 0%, transparent 70%)",
          opacity: 0.13,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 0,
            maxWidth: 440,
            mx: "auto",
            background:
              "linear-gradient(130deg, rgba(17, 141, 211, 0.18), rgba(18, 20, 33, 0.95) 60%)",
            border: "1px solid rgba(17, 141, 211, 0.25)",
            boxShadow: "0 18px 40px rgba(5, 8, 20, 0.55)",
            backdropFilter: "blur(6px)",
            color: "#e9edff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 6,
              width: "100%",
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: 200,
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Button
                  variant={role === "employee" ? "contained" : "outlined"}
                  onClick={() => setRole("employee")}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: role === "employee" ? "#118dd3" : "none",
                    color: role === "employee" ? "#fff" : "#cfd3ff",
                    borderColor: "#118dd3",
                    boxShadow:
                      role === "employee" ? "0 4px 16px #118dd333" : "none",
                    "&:hover": {
                      background:
                        role === "employee"
                          ? "#0e6fa0"
                          : "rgba(17, 141, 211, 0.08)",
                    },
                  }}
                >
                  {t("common.employee")}
                </Button>
                <Button
                  variant={role === "manager" ? "contained" : "outlined"}
                  onClick={() => setRole("manager")}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: role === "manager" ? "#f2b45e" : "none",
                    color: role === "manager" ? "#181b2f" : "#cfd3ff",
                    borderColor: "#f2b45e",
                    boxShadow:
                      role === "manager" ? "0 4px 16px #f2b45e33" : "none",
                    "&:hover": {
                      background:
                        role === "manager"
                          ? "#d99a2b"
                          : "rgba(242, 180, 94, 0.08)",
                    },
                  }}
                >
                  {t("common.manager")}
                </Button>
              </Box>
            </Box>
            <TextField
              fullWidth
              placeholder={t("login.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              InputProps={{
                sx: {
                  color: "#e9edff",
                  backgroundColor: "#0d0f1c",
                  borderRadius: 0,
                  direction: isRtl ? "rtl" : "ltr",
                  textAlign: isRtl ? "right" : "left",
                  "::placeholder": {
                    color: "#cfd3ff",
                    opacity: 1,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              placeholder={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              InputProps={{
                sx: {
                  color: "#e9edff",
                  backgroundColor: "#0d0f1c",
                  borderRadius: 0,
                  direction: isRtl ? "rtl" : "ltr",
                  textAlign: isRtl ? "right" : "left",
                  "::placeholder": {
                    color: "#cfd3ff",
                    opacity: 1,
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => setShowPassword((show) => !show)}
                      onMouseDown={(e) => e.preventDefault()}
                      sx={{ minWidth: 0, color: "#cfd3ff", p: 0.5 }}
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                mt: 3,
                mb: 1.5,
                py: 1.2,
                borderRadius: 0,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1,
                background: "linear-gradient(120deg, #118dd3 0%, #14b8a6 100%)",
                boxShadow: "0 12px 24px rgba(17, 141, 211, 0.35)",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("login.login")}
            </Button>
            <Button
              size="large"
              fullWidth
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              sx={{
                mt: 1,
                mb: 1,
                borderRadius: 999,
                color: "#fff",
                background: "linear-gradient(90deg, #f2b45e 0%, #f2994a 100%)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1,
                py: 1.2,
                boxShadow: "0 4px 16px #f2b45e33",
                border: "none",
                transition: "background 0.2s",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #f2994a 0%, #f2b45e 100%)",
                },
              }}
            >
              العربية
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
