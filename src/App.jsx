import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LandingPage from "./pages/landingpage";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Interview from "./pages/Interview";
import FindJobs from "./pages/Find_jobs";
import ResumeBuilder from "./pages/ResumeBuilder";
import SkillRoadmap from "./pages/Roadmap";
import ProfilePage from "./pages/profile";
import LeaderboardPage from "./pages/leaderboard";
import AboutPage from "./components/About";
import LegalPage from "./components/Policy";
import PlatformPage from "./components/Platform";
import ElevateAIChat from "./pages/messages";
import ElevateFeed from "./pages/feed";
import SkillRoadmap2 from "./pages/Roadmap2";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};


function App() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route path="/about" element={<AboutPage />} />

      <Route path="/legal" element={<LegalPage />} />

      <Route path="/platform" element={<PlatformPage />} />

      <Route path="/profile/:id" element={<ProfilePage />} />

      <Route path="/Roadmap2" element={<SkillRoadmap2 />} />


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
        path="/Interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />

       <Route
        path="/Find_jobs"
        element={
          <ProtectedRoute>
            <FindJobs />
          </ProtectedRoute>
        }
      /> 

      <Route
        path="/ResumeBuilder"
        element={
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Roadmap"
        element={
          <ProtectedRoute>
            <SkillRoadmap />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
 
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      /> 

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <ElevateAIChat />
          </ProtectedRoute>
        }
      /> 
      <Route
  path="/feed"
  element={
    <ProtectedRoute>
      <ElevateFeed />
    </ProtectedRoute>
  }
/>
      <Route
  path="/chat/:receiver_id"
  element={
    <ProtectedRoute>
      <ElevateAIChat />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;