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
  InputAdornment,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { isDark } = useThemeMode();
  const isRtl = lang === "ar";

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setError("");
    setLoading(true);

    try {
      const profile = await login(email.trim(), password);
      navigate(
        profile.role === "manager"
          ? "/manager-dashboard"
          : "/employee-dashboard",
      );
    } catch (err) {
      setError(err.message || t("login.loginFailed"));
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
        color: isDark ? "#e9edff" : "#1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(135deg, #10131e 0%, #181b2f 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Dynamic background blobs */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: -80, md: -120 },
          left: { xs: -80, md: -120 },
          width: { xs: 250, md: 400 },
          height: { xs: 250, md: 400 },
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
          bottom: { xs: -100, md: -160 },
          right: { xs: -100, md: -140 },
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: "50%",
          background: "radial-gradient(circle, #f2b45e 0%, transparent 70%)",
          opacity: 0.13,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <Container
        maxWidth="sm"
        sx={{ py: { xs: 2, sm: 4, md: 8 }, px: { xs: 2, sm: 3 } }}
      >
        <Paper
          sx={{
            p: { xs: 2.5, sm: 4, md: 6 },
            borderRadius: 0,
            maxWidth: 440,
            mx: "auto",
            background: isDark
              ? "linear-gradient(130deg, rgba(17, 141, 211, 0.18), rgba(18, 20, 33, 0.95) 60%)"
              : "linear-gradient(130deg, rgba(17, 141, 211, 0.08), rgba(255, 255, 255, 0.98) 60%)",
            border: isDark
              ? "1px solid rgba(17, 141, 211, 0.25)"
              : "1px solid rgba(17, 141, 211, 0.15)",
            boxShadow: isDark
              ? "0 18px 40px rgba(5, 8, 20, 0.55)"
              : "0 4px 24px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(6px)",
            color: isDark ? "#e9edff" : "#1a1a2e",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: { xs: 3, sm: 4, md: 6 },
              width: "100%",
            }}
          >
            <Box
              component="img"
              src={isDark ? "/logo.png" : "/logo-white.png"}
              alt="Logo"
              sx={{
                width: { xs: 140, sm: 170, md: 200 },
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
                  color: isDark ? "#e9edff" : "#1a1a2e",
                  backgroundColor: isDark ? "#0d0f1c" : "#ffffff",
                  borderRadius: 0,
                  direction: isRtl ? "rtl" : "ltr",
                  textAlign: isRtl ? "right" : "left",
                  "::placeholder": {
                    color: isDark ? "#cfd3ff" : "#9a9a9a",
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
                  color: isDark ? "#e9edff" : "#1a1a2e",
                  backgroundColor: isDark ? "#0d0f1c" : "#ffffff",
                  borderRadius: 0,
                  direction: isRtl ? "rtl" : "ltr",
                  textAlign: isRtl ? "right" : "left",
                  "::placeholder": {
                    color: isDark ? "#cfd3ff" : "#9a9a9a",
                    opacity: 1,
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => setShowPassword((show) => !show)}
                      onMouseDown={(e) => e.preventDefault()}
                      sx={{
                        minWidth: 0,
                        color: isDark ? "#cfd3ff" : "#5a5a7a",
                        p: 0.5,
                      }}
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
