import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
    position: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, t } = useLanguage();
  const isRtl = lang === "ar";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        position: formData.position,
      });

      const { token, user } = response.data;
      login(user, token);
      navigate(
        user.role === "manager" ? "/manager-dashboard" : "/employee-dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.message || t("register.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ direction: isRtl ? "rtl" : "ltr" }}>
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: isRtl ? "right" : "center", mb: 3 }}
          >
            {t("register.title")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t("manager.name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
              InputLabelProps={{
                sx: {
                  textAlign: isRtl ? "right" : "left",
                  right: isRtl ? 0 : "auto",
                  left: isRtl ? "auto" : 0,
                },
              }}
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
            />
            <TextField
              fullWidth
              label={t("manager.email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
              InputLabelProps={{
                sx: {
                  textAlign: isRtl ? "right" : "left",
                  right: isRtl ? 0 : "auto",
                  left: isRtl ? "auto" : 0,
                },
              }}
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
            />
            <TextField
              fullWidth
              label={t("manager.position")}
              name="position"
              value={formData.position}
              onChange={handleChange}
              margin="normal"
              inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
              InputLabelProps={{
                sx: {
                  textAlign: isRtl ? "right" : "left",
                  right: isRtl ? 0 : "auto",
                  left: isRtl ? "auto" : 0,
                },
              }}
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
            />
            <TextField
              fullWidth
              label={t("manager.password")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
              InputLabelProps={{
                sx: {
                  textAlign: isRtl ? "right" : "left",
                  right: isRtl ? 0 : "auto",
                  left: isRtl ? "auto" : 0,
                },
              }}
              sx={{ "& input": { textAlign: isRtl ? "right" : "left" } }}
            />
            <TextField
              fullWidth
              label={t("register.confirmPassword")}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ dir: isRtl ? "rtl" : "ltr" }}
              InputLabelProps={{
                sx: {
                  textAlign: isRtl ? "right" : "left",
                  right: isRtl ? 0 : "auto",
                  left: isRtl ? "auto" : 0,
                },
              }}
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
              value={formData.role}
              onChange={handleChange}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("register.submit")}
            </Button>
          </form>

          <Typography sx={{ textAlign: isRtl ? "right" : "center", mt: 2 }}>
            {t("register.haveAccount")}{" "}
            <Link to="/login">{t("register.loginLink")}</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
