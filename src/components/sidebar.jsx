import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Map,
  Mic2,
  User,
  Sparkles,
  Search,
  FileEdit,
  Trophy,
  PanelLeft,
  MessageSquare
} from "lucide-react";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestCount, setRequestCount] = useState(0);
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [messageCount, setMessageCount] = useState(0);

  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved ? JSON.parse(saved) : true;
  });

useEffect(() => {
  const fetchUnreadMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const unread = res.data.filter(chat => chat.unread_count > 0);

      const totalUnread = unread.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0
      );
    setMessageCount(totalUnread);

    } catch (err) {
      console.error(err);
    }
  };

  fetchUnreadMessages();
  const interval = setInterval(fetchUnreadMessages, 5000);

  return () => clearInterval(interval);
}, [token]);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(expanded));
  }, [expanded]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      expanded ? "220px" : "68px"
    );
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API}/friends/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequestCount(res.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
    { name: "Resume Analyzer", icon: FileText, path: "/ResumeAnalyzer" },
    { name: "Find Jobs", icon: Search, path: "/Find_jobs" },
    { name: "Resume Builder", icon: FileEdit, path: "/ResumeBuilder" },
    { name: "Skill Roadmap", icon: Map, path: "/Roadmap" },
    { name: "Interview", icon: Mic2, path: "/Interview" },
    { name: "Profile", icon: User, path: "/profile" },
    { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Feed", icon: Sparkles, path: "/feed" }
  ];

  const MessagePopup = ({ count, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute left-16 top-16 w-[220px] 
      bg-blue-600/10 backdrop-blur-xl 
      border border-blue-500/30 
      rounded-xl shadow-xl p-3 z-50"
    >
      <p className="text-sm text-blue-300 font-semibold">
        💬 New Messages
      </p>

      <p className="text-xs text-blue-200 mt-1">
        You have {count} unread message{count > 1 ? "s" : ""}
      </p>

      <button
        onClick={onClose}
        className="mt-2 text-xs text-blue-400 hover:underline"
      >
        Close
      </button>
    </motion.div>
  );
};

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

             {item.name === "Messages" && messageCount > 0 && (
  <span
    className={`absolute text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-bold ${
      expanded ? "top-1 right-2" : "-top-1 -right-1"
    }`}
  >
    {messageCount}
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