import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobMatchesPage from "./pages/Jobs";
import Interview from "./pages/Interview";
import Findjobs from "./pages/findjobs";



const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/Dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ResumeAnalyzer"
        element={
          <ProtectedRoute>
            <ResumeAnalyzer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Jobs"
        element={
          <ProtectedRoute>
            <JobMatchesPage />
          </ProtectedRoute>
        }
      />

        <Route
        path="/Interview"
        element={
          <ProtectedRoute>
            <Interview/>
          </ProtectedRoute>
        }
      />

         <Route
        path="/findjobs"
        element={
          <ProtectedRoute>
            <Findjobs/>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;