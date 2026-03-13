import React, { useState, useEffect } from 'react';
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
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/sidebar.jsx';
import { useNavigate } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="relative overflow-hidden bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-10 -mt-10 ${color}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${color.replace('bg-', 'text-')}`}>
        <Icon size={20} />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Live Update
        </div>
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);

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

export default function CareerDashboard() {
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Welcome back! How can I help you accelerate your career today?' }
  ]);
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://127.0.0.1:8000/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) navigate("/login");
      });
  }, [navigate]);

  const askAI = async (customPrompt) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;
    
    const token = localStorage.getItem("token");
    const userMsg = { role: 'user', content: activePrompt };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");
    setLoadingAI(true);
    
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/ai/chat",
        { message: activePrompt },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      console.error("AI error:", err);
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
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 flex font-sans selection:bg-blue-500/30 overflow-hidden">
      <style>{`
        .custom-dark-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-dark-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <Sidebar />

      <main
        style={{ marginLeft: "var(--sidebar-width)" }}
        className="flex-1 flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full relative z-10 custom-dark-scrollbar">
          
          <section className="mb-10 flex justify-between items-end">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Welcome back, {user ? user.name : "Explorer"}
                </h1>
              </motion.div>
              <p className="text-slate-400 text-sm">Real-time career insights and trajectory tracking.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="group flex items-center gap-3 pl-3 pr-4 py-2 bg-white/[0.03] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-300 backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                <LogOut size={16} className="text-slate-400 group-hover:text-red-400 transition-colors" />
              </div>
              <span className="text-sm font-semibold text-slate-300 group-hover:text-red-400 transition-colors">
                Sign Out
              </span>
            </motion.button>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={TrendingUp} label="Market Readiness" value={user?.market_readiness || "--"} color="bg-blue-500" />
            <StatCard icon={CheckCircle2} label="Verified Skills" value={user?.skills?.length || "0"} color="bg-yellow-500" />
            <StatCard icon={Zap} label="Learning Streak" value="14 Days" color="bg-emerald-500" />
            <StatCard icon={Clock} label="Avg. Response Time" value="2.4d" color="bg-amber-500" />
          </section>

          <div className="grid lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-4 flex flex-col gap-8 h-[500px]">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-sm font-semibold text-white mb-6 flex items-center justify-between">
                  Next Milestone
                  <Cpu size={14} className="text-blue-400" />
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AWS Cloud Practitioner</span>
                      <span className="text-sm font-bold text-blue-400">65%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1.5 }} className="h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-400">
                    Complete <span className="text-blue-400 font-medium">EC2 Fundamentals</span> to reach 80% readiness.
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
                <h3 className="text-sm font-semibold text-white mb-4 shrink-0">Recent Activity</h3>
                <div className="space-y-1 overflow-y-auto custom-dark-scrollbar flex-1">
                  <ActivityItem title="Applied to Vercel" time="2 hours ago" type="default" />
                  <ActivityItem title="Python Quiz Passed" time="5 hours ago" type="success" />
                  <ActivityItem title="Profile viewed by Meta" time="Yesterday" type="default" />
                  <ActivityItem title="Researched Rust" time="2 days ago" type="default" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col h-[500px]">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden group h-full">
                <div className="absolute inset-0 bg-emerald-600/[0.02] group-hover:bg-emerald-600/[0.05] transition-colors" />
                <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">Skill Breakdown</h3>
                  <div className="relative w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center bg-[#0a121e]">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-dark-scrollbar space-y-3 relative z-10 pr-2">
                  {(!user?.skills || user.skills.length === 0) ? (
                    <div className="text-center text-slate-400 text-sm py-8">Upload a resume to generate your skill breakdown</div>
                  ) : (
                    user.skills.map((skill, index) => (
                      <div key={index} className="flex-none h-16 flex justify-between items-center p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl backdrop-blur-sm">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">{skill}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-cyan-400">detected</span>
                      </div>
                    ))
                  )}
                </div>

                <button className="mt-6 shrink-0 w-full py-4 bg-white text-[#050b14] hover:bg-emerald-400 transition-colors rounded-2xl font-bold text-sm relative z-10">
                  View Full Roadmap
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col h-[500px]">
              <div className="flex-1 bg-[#0f0f12] border border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
                <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center shrink-0">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400 flex items-center gap-2">
                    <Sparkles size={12} /> AI Career Copilot
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-dark-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-none'}`}>
                        {msg.role === 'ai' ? formatAiReply(msg.content) : msg.content}
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
                      <button key={label} onClick={() => askAI(label)} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 border border-white/10 rounded-full transition-all flex items-center gap-1">
                        <Zap size={10} /> {label}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); askAI(); }} className="relative">
                    <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask your career agent..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" />
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