import React, { useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Box,
} from "@mui/material";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/BossDashboard";
import UserManagement from "./pages/UserManagement";
import Notifications from "./pages/Notifications";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import { useThemeMode } from "./context/ThemeContext";

function App() {
  const { isAuthenticated, user, loading } = useAuth();
  const { direction } = useLanguage();
  const { mode } = useThemeMode();

  const theme = useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          mode,
          primary: {
            main: "#118dd3",
          },
          secondary: {
            main: "#71c8f2",
          },
          background: {
            default: mode === "dark" ? "#121421" : "#f5f7fa",
            paper: mode === "dark" ? "#181b2f" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#ffffff" : "#1a1a2e",
            secondary: mode === "dark" ? "#c7cbe4" : "#5a5a7a",
          },
          divider: mode === "dark" ? "#2a2f4f" : "#e0e0e0",
        },
        typography: {
          fontFamily:
            "'Aptos', 'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
          h1: {
            fontFamily: "'Cambria', 'Georgia', serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontFamily: "'Cambria', 'Georgia', serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          },
          h3: {
            fontFamily: "'Cambria', 'Georgia', serif",
            fontWeight: 600,
          },
          h4: {
            fontFamily: "'Cambria', 'Georgia', serif",
            fontWeight: 600,
          },
          h5: {
            fontFamily: "'Cambria', 'Georgia', serif",
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 0,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              "*": {
                boxSizing: "border-box",
              },
              html: {
                WebkitTextSizeAdjust: "100%",
              },
              body: {
                backgroundColor: mode === "dark" ? "#121421" : "#f5f7fa",
                direction,
                textAlign: direction === "rtl" ? "right" : "left",
                overflowX: "hidden",
                minHeight: "100vh",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              },
              "#root": {
                direction,
                textAlign: direction === "rtl" ? "right" : "left",
                overflowX: "hidden",
                minHeight: "100vh",
              },
              // Improve touch targets on mobile
              "button, [role='button'], input, select, textarea": {
                touchAction: "manipulation",
              },
              // Better scrolling on mobile
              "@media (max-width: 600px)": {
                ".MuiContainer-root": {
                  paddingLeft: "12px !important",
                  paddingRight: "12px !important",
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                background: mode === "dark" ? "#121421" : "#ffffff",
                color: mode === "dark" ? "#ffffff" : "#1a1a2e",
                boxShadow: "none",
                borderBottom:
                  mode === "dark" ? "1px solid #1f2342" : "1px solid #e0e0e0",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border:
                  mode === "dark" ? "1px solid #2a2f4f" : "1px solid #e0e0e0",
                boxShadow:
                  mode === "dark" ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 0,
              },
              contained: {
                background: "linear-gradient(90deg, #118dd3 0%, #51b7e8 100%)",
                color: "#ffffff",
                boxShadow: "none",
              },
              outlined: {
                borderColor: "#118dd3",
                color: "#118dd3",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "dark" ? "#0d0f1c" : "#ffffff",
                borderRadius: 0,
              },
              notchedOutline: {
                borderColor: mode === "dark" ? "#2a2f4f" : "#d0d0d0",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 0,
              },
            },
          },
        },
      }),
    [direction, mode],
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: mode === "dark" ? "#121421" : "#f5f7fa",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/employee-dashboard"
            element={
              isAuthenticated && user?.role === "employee" ? (
                <EmployeeDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/manager-dashboard"
            element={
              isAuthenticated && user?.role === "manager" ? (
                <ManagerDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/user-management"
            element={
              isAuthenticated && user?.role === "manager" ? (
                <UserManagement />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              isAuthenticated && user?.role === "manager" ? (
                <Notifications />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                user?.role === "manager" ? (
                  <Navigate to="/manager-dashboard" />
                ) : (
                  <Navigate to="/employee-dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
