import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Map,
  Mic2,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
    { name: "Resume Analyzer", icon: FileText, path: "/ResumeAnalyzer" },
    { name: "Job Matches", icon: Briefcase, path: "/Jobs" },
    { name: "Skill Roadmap", icon: Map, path: "/roadmap" },
    { name: "Interview", icon: Mic2, path: "/Interview" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col p-6">

      <div onClick={() => navigate("/Dashboard")} className="flex items-center gap-3 mb-10 cursor-pointer">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">ElevateAI</h1>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                isActive ? "bg-white/10 text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}

              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute left-0 w-1 h-6 bg-cyan-400"
                />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;