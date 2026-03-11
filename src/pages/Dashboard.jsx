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
  User as UserIcon,
  TrendingUp,
  Clock,
  Zap
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
  const [aiReply, setAiReply] = useState("");
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
    setLoadingAI(true);
    setAiReply("");
    
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
      setAiReply(res.data.reply);
    } catch (err) {
      console.error("AI error:", err);
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
    <div className="min-h-screen bg-[#050b14] text-slate-200 flex font-sans selection:bg-blue-500/30">
      <style>{`
        .custom-dark-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-dark-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
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
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Sparkles className="text-blue-400" size={20} />
                </div>
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
            <StatCard icon={TrendingUp} label="Market Readiness" value="High" color="bg-blue-500" />
            <StatCard icon={Briefcase} label="Active Applications" value="08" color="bg-purple-500" />
            <StatCard icon={Zap} label="Learning Streak" value="14 Days" color="bg-emerald-500" />
            <StatCard icon={Clock} label="Avg. Response Time" value="2.4d" color="bg-amber-500" />
          </section>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-8">
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
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Complete <span className="text-blue-400 font-medium">EC2 Fundamentals</span> to reach 80% readiness.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-1">
                  <ActivityItem title="Applied to Vercel" time="2 hours ago" type="default" />
                  <ActivityItem title="Python Quiz Passed" time="5 hours ago" type="success" />
                  <ActivityItem title="Profile viewed by Meta" time="Yesterday" type="default" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-600/[0.02] group-hover:bg-emerald-600/[0.05] transition-colors" />
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-bold text-white mb-1">Skill Breakdown</h3>
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative w-full h-full rounded-full border border-emerald-500/30 flex items-center justify-center bg-[#0a121e]">
                       <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  {[
                    { name: 'React/Next.js', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', level: 'Expert' },
                    { name: 'TypeScript', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', level: 'Advanced' },
                    { name: 'Node.js', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', level: 'Intermediate' },
                    { name: 'System Design', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', level: 'Advanced' },
                  ].map((skill) => (
                    <div key={skill.name} className={`flex justify-between items-center p-4 ${skill.bg} border ${skill.border} rounded-2xl backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">{skill.name}</span>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${skill.color}`}>{skill.level}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-8 w-full py-4 bg-white text-[#050b14] hover:bg-emerald-400 transition-colors rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/10">
                  View Full Roadmap
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-gradient-to-br from-blue-600/20 via-blue-600/5 to-transparent border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Copilot</h3>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setPrompt("Optimize my resume for Stripe");
                      askAI("Optimize my resume for Stripe");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-xs text-slate-300"
                  >
                    Optimize my resume for Stripe
                  </button>
                  <button 
                    onClick={() => {
                      setPrompt("What skills am I missing for Lead roles?");
                      askAI("What skills am I missing for Lead roles?");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-xs text-slate-300"
                  >
                    What skills am I missing for Lead roles?
                  </button>
                  <div className="pt-2 relative">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") askAI();
                      }}
                      placeholder="Ask your career agent..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                    {loadingAI && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Zap size={12} className="text-blue-400" />
                        </motion.span>
                        AI is thinking...
                      </p>
                    )}
                    {aiReply && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 max-h-48 overflow-y-auto custom-dark-scrollbar">
                        {formatAiReply(aiReply)}
                      </div>
                    )}
                    <ArrowUpRight
                      size={14}
                      onClick={() => askAI()}
                      className="absolute right-3 top-[28px] text-slate-500 hover:text-blue-400 cursor-pointer transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                   <div className="text-2xl font-bold text-white mb-1">28</div>
                   <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Verified Skills</div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="text-amber-400 shrink-0" />
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    <span className="font-bold text-amber-400">Market Insight:</span> Go and Rust are trending for your current job matches. Consider adding them to your roadmap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}