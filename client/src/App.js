import React, { useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/BossDashboard";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

function App() {
  const { isAuthenticated, user } = useAuth();
  const { direction } = useLanguage();
  const theme = useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          mode: "dark",
          primary: {
            main: "#118dd3",
          },
          secondary: {
            main: "#71c8f2",
          },
          background: {
            default: "#121421",
            paper: "#181b2f",
          },
          text: {
            primary: "#ffffff",
            secondary: "#c7cbe4",
          },
          divider: "#2a2f4f",
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
              body: {
                backgroundColor: "#121421",
                direction,
                textAlign: direction === "rtl" ? "right" : "left",
                overflowX: "hidden",
              },
              "#root": {
                direction,
                textAlign: direction === "rtl" ? "right" : "left",
                overflowX: "hidden",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                background: "#121421",
                color: "#ffffff",
                boxShadow: "none",
                borderBottom: "1px solid #1f2342",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border: "1px solid #2a2f4f",
                boxShadow: "none",
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
                backgroundColor: "#0d0f1c",
                borderRadius: 0,
              },
              notchedOutline: {
                borderColor: "#2a2f4f",
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
    [direction],
  );

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
