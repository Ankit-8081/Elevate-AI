import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import {
  FileText,
  Briefcase,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  LogOut,
  TrendingUp,
  Clock,
  Zap,
  Send,
  Target,
  ChevronRight,
  User,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/sidebar.jsx';
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="relative overflow-hidden bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-10 -mt-10 ${color}`} />
    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20 rounded-tl-md" />
    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20 rounded-tr-md" />
    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20 rounded-bl-md" />
    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20 rounded-br-md" />

    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${color.replace('bg-', 'text-')}`}>
        <Icon size={20} />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</div>
      </div>
    </div>

    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   ACTIVITY ITEM
───────────────────────────────────────────── */
const ActivityItem = ({ title, time, type }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
    <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
    <div className="flex-1">
      <p className="text-xs font-medium text-slate-200">{title}</p>
      <p className="text-[10px] text-slate-500">{time}</p>
    </div>
    <ArrowUpRight size={12} className="text-slate-600" />
  </div>
);

/* ─────────────────────────────────────────────
   PROFILE DROPDOWN
───────────────────────────────────────────── */
const ProfileDropdown = ({ user, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const menuItems = [
    { icon: User, label: "View Profile", action: () => { setOpen(false); navigate("/profile"); } },
    { icon: LayoutDashboard, label: "Dashboard", action: () => { setOpen(false); navigate("/dashboard"); } },
    { icon: Settings, label: "Settings", action: () => { setOpen(false); navigate("/settings"); } },
  ];

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger Button ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-3 pl-2 pr-4 py-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all duration-300 backdrop-blur-md"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/80 to-blue-600/80 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(34,211,238,0.2)] shrink-0">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-lg" />
            : initials
          }
        </div>

        {/* Name */}
        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
          {user?.username || "Profile"}
        </span>

        {/* Chevron */}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        </motion.div>
      </motion.button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[calc(100%+10px)] right-0 w-56 bg-[#0d1829] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/80 to-blue-600/80 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-lg" />
                  : initials
                }
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.username || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || ""}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5 space-y-0.5">
              {menuItems.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all duration-150 text-left"
                >
                  <Icon size={14} className="text-slate-500" />
                  {label}
                </button>
              ))}

              {/* Divider */}
              <div className="h-px bg-white/[0.06] my-1" />

              {/* Sign Out */}
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 text-left"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
export default function CareerDashboard() {
  const [user, setUser] = useState({});
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Welcome back! How can I help you accelerate your career today?' }
  ]);

  const aiResponses = messages.filter(m => m.role === "ai" && m.responseTime);
  const avgResponse =
    aiResponses.length > 0
      ? (aiResponses.reduce((sum, m) => sum + parseFloat(m.responseTime), 0) / aiResponses.length).toFixed(2)
      : "--";

  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  const milestone = user?.next_milestone;
  const roadmap = user?.roadmap || [];
  const allSkills = roadmap.flatMap(stage => stage.skills || []);
  const totalCompleted = allSkills.filter(skill => skill.status === "Completed").length;
  const progress = allSkills.length > 0 ? Math.round((totalCompleted / allSkills.length) * 100) : 0;
  const nextStage = roadmap.find(stage => stage.skills?.some(skill => skill.status !== "Completed"));
  const upcomingSkills = nextStage ? nextStage.skills.filter(skill => skill.status !== "Completed") : [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(err => { if (err.response?.status === 401) navigate("/login"); });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/ai/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.messages.length > 0) setMessages(res.data.messages); })
      .catch(() => {});
  }, []);

  const askAI = async (customPrompt) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    const token = localStorage.getItem("token");
    setMessages(prev => [...prev, { role: 'user', content: activePrompt }]);
    setPrompt("");
    setLoadingAI(true);

    try {
      const res = await axios.post(
        `${API}/ai/chat`,
        { message: activePrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { role: "ai", content: res.data.reply, responseTime: res.data.response_time }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error processing that request." }]);
    }

    setLoadingAI(false);
  };

  const formatAiReply = (text) => {
    if (!text) return null;
    let listCounter = 0;
    return text.split('\n').map((line, i) => {
      let processedLine = line.trim();
      if (processedLine.startsWith('+')) {
        const letter = String.fromCharCode(97 + (listCounter % 26));
        processedLine = `${letter}) ${processedLine.substring(1).trim()}`;
        listCounter++;
      }
      const parts = processedLine.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={i !== 0 ? "mt-2" : ""}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**'))
              return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 flex font-sans selection:bg-blue-500/30 overflow-hidden">
      <style>{`
        .custom-dark-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-dark-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      <Sidebar />

      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full relative z-10 custom-dark-scrollbar">

          {/* ── Header ── */}
          <section className="mb-10 flex justify-between items-end">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={18} className="text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Welcome back,</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                    {user?.username || "Explorer"}
                  </span>
                </h1>
              </motion.div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <span className="h-1 w-1 bg-cyan-400 rounded-full animate-pulse"></span>
                Real-time career insights and trajectory tracking
              </p>
            </div>

            {/* ── Profile Dropdown (replaces Sign Out button) ── */}
            <ProfileDropdown user={user} onSignOut={handleLogout} />
          </section>

          {/* ── Stat Cards ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={TrendingUp} label="Market Readiness" value={user?.market_readiness || "--"} color="bg-blue-500" />
            <StatCard icon={CheckCircle2} label="Verified Skills" value={user?.skills?.length || "0"} color="bg-yellow-500" />
            <StatCard icon={Zap} label="Login Streak" value={`${user?.login_streak || 0} Days`} color="bg-emerald-500" />
            <StatCard
              icon={Clock}
              label="Avg. Response Time"
              value={avgResponse !== "--" ? `${avgResponse}s` : "--"}
              color="bg-amber-500"
            />
          </section>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-12 gap-8 mb-8">

            {/* Next Milestone */}
            <div className="lg:col-span-4 h-[500px]">
              <div className="h-full bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Target size={18} className="text-blue-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Milestone</h3>
                  </div>
                  <Cpu size={16} className="text-slate-500" />
                </div>

                <div className="relative z-10">
                  <div className="mb-4">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Current Stage</div>
                    <div className="text-lg font-bold text-white leading-tight">
                      {milestone?.stage || "No Active Roadmap"}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-medium text-slate-400">Phase Progress</span>
                      <span className="text-[11px] font-bold text-blue-400">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-200 space-y-2">
                      {upcomingSkills.length > 0 ? (
                        upcomingSkills.slice(0, 4).map((skill, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/roadmap", { state: { highlightSkill: skill.name } })}
                            className="flex-none h-14 flex justify-between items-center p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl backdrop-blur-sm cursor-pointer hover:bg-cyan-400/20 transition-all"
                          >
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">{skill.name}</span>
                            <ChevronRight size={14} className="text-cyan-400" />
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400">All milestones completed</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="lg:col-span-4 flex flex-col h-[500px]">
              <div className="bg-white/5 border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.35)] rounded-3xl p-6 flex flex-col relative overflow-hidden group h-full">
                <div className="absolute inset-0 bg-emerald-600/[0.02] group-hover:bg-emerald-600/[0.05] transition-colors" />
                <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">Skill Breakdown</h3>
                  <div className="relative w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center bg-[#0a121e]">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-dark-scrollbar space-y-3 relative z-10 pr-2">
                  {(!user?.skills || user.skills.length === 0) ? (
                    <div className="text-center text-slate-400 text-sm py-8">Upload a resume to generate skills</div>
                  ) : (
                    user.skills.map((skill, index) => (
                      <div key={index} className="flex-none h-16 flex justify-between items-center p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl backdrop-blur-sm">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">{skill}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-cyan-400">detected</span>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => navigate("/roadmap")}
                  className="mt-6 shrink-0 w-full py-4 bg-white text-[#050b14] hover:bg-emerald-400 transition-colors rounded-2xl font-bold text-sm relative z-10"
                >
                  View Full Roadmap
                </button>
              </div>
            </div>

            {/* AI Career Copilot */}
            <div className="lg:col-span-4 flex flex-col h-[500px]">
              <div className="flex-1 bg-[#0f0f12] border border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
                <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center shrink-0">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400 flex items-center gap-2">
                    <Sparkles size={12} /> AI Career Copilot
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-dark-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-none'}`}>
                        {msg.role === 'ai' ? formatAiReply(msg.content) : msg.content}
                        {msg.role === 'ai' && msg.responseTime && (
                          <div className="text-[9px] text-slate-500 mt-1">responded in {msg.responseTime}s</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loadingAI && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none">
                        <Zap size={12} className="text-blue-400 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/5 bg-black/20 space-y-3 shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {['Market Insights', 'Interview Prep', 'Skill Gaps'].map((label) => (
                      <button
                        key={label}
                        onClick={() => askAI(label)}
                        className="text-[10px] px-2 py-1 bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 border border-white/10 rounded-full transition-all flex items-center gap-1"
                      >
                        <Zap size={10} /> {label}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); askAI(); }} className="relative">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask your career agent..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
