import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Map,
  Mic2,
  User,
  Sparkles,
  Search,
  FileEdit,
  PanelLeft
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(expanded));
  }, [expanded]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      expanded ? "220px" : "68px"
    );
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
    { name: "Resume Analyzer", icon: FileText, path: "/ResumeAnalyzer" },
    { name: "Job Matches", icon: Briefcase, path: "/Jobs" },
    { name: "Find Jobs", icon: Search, path: "/Find_jobs" },
    { name: "Resume Builder", icon: FileEdit, path: "/ResumeBuilder" },
    { name: "Skill Roadmap", icon: Map, path: "/Roadmap" },
    { name: "Interview", icon: Mic2, path: "/Interview" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
<motion.aside
  animate={{ width: expanded ? 220 : 68 }}
  transition={{ duration: 0.25 }}
  onUpdate={(latest) => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${latest.width}px`
    );
  }}
  className="fixed left-0 top-0 h-screen border-r border-white/5 bg-black/30 backdrop-blur-xl flex flex-col px-3 py-4 z-50"
>

      <div
        onClick={() => navigate("/Dashboard")}
        className="flex items-center gap-3 mb-8 cursor-pointer px-2"
      >
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        {expanded && (
          <h1 className="text-lg font-bold text-white tracking-tight">
            ElevateAI
          </h1>
        )}
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-white/10 text-cyan-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />

              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r"
                />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-8 w-7 h-7 flex items-center justify-center rounded-full bg-[#0a0a0c] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition"
      >
        <PanelLeft size={14} />
      </button>

    </motion.aside>
  );
};

export default Sidebar;