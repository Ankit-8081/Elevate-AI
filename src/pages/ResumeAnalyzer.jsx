import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Briefcase, Cpu, MessageSquare, Settings,
  Search, Bell, User, Upload, CheckCircle2, AlertTriangle, ArrowRight,
  Download, Copy, RefreshCw, X, Zap, ChevronRight, Target, Sparkles,
  Trophy, TrendingUp, BarChart3, ShieldCheck, BriefcaseBusiness, ExternalLink,
  Map
} from 'lucide-react';
import Header from '../components/header';
import Sidebar from '../components/sidebar';

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}
  >
    {children}
  </motion.div>
);

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetJob, setTargetJob] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState(null);
  const [score, setScore] = useState(0);

  const onUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_job", targetJob);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:8000/upload-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      setData(res.data);
      setScore(res.data.ats_score);
    } catch (err) {
      console.error("Resume analysis error:", err);
    }
    setAnalyzing(false);
  };

  const getStatusStyles = (status) => {
    if (status.includes("Highly") || status.includes("Strong")) {
      return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500", icon: <Trophy className="text-emerald-400" size={20} /> };
    }

    if (status.includes("Moderate")) {
      return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "bg-amber-500", icon: <TrendingUp className="text-amber-400" size={20} /> };
    }

    return { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", bar: "bg-rose-500", icon: <BarChart3 className="text-rose-400" size={20} /> };
  };
  return (
    <div className="h-screen max-h-screen bg-[#050b14] flex overflow-hidden font-sans text-slate-200">
      <Sidebar />

      <div style={{ marginLeft: "var(--sidebar-width)" }} className="flex flex-col flex-1 min-h-screen relative">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />

        <main className={`flex-1 p-8 max-w-7xl mx-auto w-full relative z-10 ${data ? 'overflow-y-auto' : 'overflow-hidden'}`}>

          {!data && !analyzing ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 max-w-2xl mx-auto">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">AI Resume Analyzer</h1>
                <p className="text-slate-400 text-lg">Benchmark your profile against industry standards.</p>
              </div>

              <div className="space-y-4">
                <label className="relative group block w-full border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/50 transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-cyan-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{file ? file.name : "Drop Resume Here"}</h3>
                    <p className="text-sm text-slate-500 mt-2 font-medium">PDF, DOCX up to 10MB</p>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.docx" />
                </label>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <input
                    type="text"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    placeholder="Enter target job title"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600"
                  />
                </div>

                <button
                  disabled={!file}
                  onClick={onUpload}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${file
                    ? 'bg-cyan-500 text-[#050b14] hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 active:scale-[0.98]'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  <Sparkles size={18} />
                  Analyze Profile
                </button>
              </div>
            </motion.div>
          ) : analyzing ? (
            <div className="h-[70vh] flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full" />
                <Cpu className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={28} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">Processing Document...</h2>
              <p className="text-slate-500 mt-2">Extracting semantic insights with LLMs</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 min-h-full pb-10 items-start">
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <GlassCard className="relative overflow-hidden border-t-4 border-t-cyan-500/50">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-white font-bold text-xl">Market Readiness</h3>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">Industry Fit Score</p>
                    </div>
                    <div className={`p-3 rounded-xl ${getStatusStyles(data.market_readiness).bg} border ${getStatusStyles(data.market_readiness).border}`}>
                      {getStatusStyles(data.market_readiness).icon}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-slate-400 text-sm font-semibold">Match Confidence</span>
                        <span className={`text-2xl font-black ${getStatusStyles(data.market_readiness).color}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${getStatusStyles(data.market_readiness).bar}`}
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${getStatusStyles(data.market_readiness).bg} ${getStatusStyles(data.market_readiness).border}`}>
                      <ShieldCheck className={getStatusStyles(data.market_readiness).color} size={24} />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status</p>
                        <p className={`font-bold text-lg ${getStatusStyles(data.market_readiness).color}`}>
                          {data.market_readiness}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        Your profile was analyzed against the role: {targetJob}.
                        Addressing the identified gaps could significantly increase your market readiness.
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                    <Zap size={16} className="text-cyan-400" /> Critical Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:border-cyan-500/30 transition-colors">
                        {kw}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-l-4 border-l-emerald-500/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-white">Competitive Strengths</h3>
                    </div>
                    <ul className="space-y-4">
                      {data.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <GlassCard className="border-l-4 border-l-rose-500/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-rose-500/10 rounded-lg">
                        <AlertTriangle size={20} className="text-rose-500" />
                      </div>
                      <h3 className="font-bold text-white">Optimization Gaps</h3>
                    </div>
                    <ul className="space-y-4">
                      {data.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>

                <GlassCard className="relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <Sparkles size={20} className="text-cyan-400" /> AI Rewrite Suggestions
                    </h3>

                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          navigate("/roadmap", {
                            state: { role: targetJob }
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:from-violet-600/30 hover:to-purple-600/30 transition-all shadow-lg shadow-violet-900/20"
                      >
                        <Map size={14} />
                        Generate Roadmap
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          navigate("/Find_jobs", {
                            state: { jobTitle: targetJob }
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:from-cyan-600/30 hover:to-blue-600/30 transition-all shadow-lg shadow-cyan-900/20"
                      >
                        <BriefcaseBusiness size={14} />
                        View Job Matches
                        <ExternalLink size={12} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                        <span className="absolute -top-3 left-4 px-2 py-0.5 bg-[#0a111e] text-[10px] font-black text-slate-500 uppercase border border-white/5 rounded">Draft</span>
                        <p className="text-sm text-slate-500 italic leading-relaxed">{data.weak_line}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/20 relative">
                        <span className="absolute -top-3 left-4 px-2 py-0.5 bg-[#0a111e] text-[10px] font-black text-cyan-400 uppercase border border-cyan-500/20 rounded tracking-tighter">Optimized</span>
                        <p className="text-sm text-white font-medium leading-relaxed">{data.suggestions}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="flex-1 py-4 bg-cyan-500 text-[#050b14] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.98]">
                        <CheckCircle2 size={16} /> Apply Revision
                      </button>
                      <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl text-sm border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                        <Copy size={16} /> Copy
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}