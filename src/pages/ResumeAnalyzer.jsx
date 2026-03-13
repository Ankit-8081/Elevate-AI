import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Briefcase, Cpu, MessageSquare, Settings, 
  Search, Bell, User, Upload, CheckCircle2, AlertTriangle, ArrowRight, 
  Download, Copy, RefreshCw, X, Zap, ChevronRight, Target, Sparkles
} from 'lucide-react';
import Header from '../components/header'
import Sidebar from '../components/sidebar'

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

const ScoreGauge = ({ score }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 75 ? '#22d3ee' : score > 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
        <motion.circle 
          cx="96" cy="96" r={radius} stroke={color} strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <span className="text-3xl font-semibold text-white">{score}</span>
          <span className="text-sm text-slate-400 font-medium">%</span>
        </motion.div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Match</p>
      </div>
    </div>
  );
};

export default function ResumeDashboard() {
  const [file, setFile] = useState(null);
  const [targetJob, setTargetJob] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState(null);

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

    } catch (err) {
      console.error("Resume analysis error:", err);
    }

    setAnalyzing(false);
  };

  return (
    <div className="h-screen max-h-screen bg-[#050b14] flex overflow-hidden font-sans">
      <Sidebar />
      
      <div style={{ marginLeft: "var(--sidebar-width)" }} className="flex flex-col flex-1 min-h-screen relative">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />

        <main className={`flex-1 p-8 max-w-7xl mx-auto w-full relative z-10 ${data ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          
          {!data && !analyzing ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 max-w-2xl mx-auto">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">AI Resume Analyzer</h1>
                <p className="text-slate-400">Optimize your application for specific roles using AI.</p>
              </div>

              <div className="space-y-4">
                <label className="relative group block w-full border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/50 transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-cyan-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{file ? file.name : "Select Resume"}</h3>
                    <p className="text-xs text-slate-500 mt-1">PDF or DOCX (Max 10MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.docx" />
                </label>

                <div className="relative group">
                  <input 
                    type="text"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    placeholder="Enter target job title (e.g. Senior Frontend Engineer)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600 shadow-inner"
                  />
                </div>
                
                <button 
                  disabled={!file}
                  onClick={onUpload}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    file 
                    ? 'bg-cyan-500 text-[#050b14] hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 active:scale-[0.98]' 
                    : 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Sparkles size={18} />
                  Analyze Now
                </button>
              </div>
            </motion.div>
          ) : analyzing ? (
            <div className="h-[70vh] flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full" />
                <Cpu className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={28} />
              </div>
              <h2 className="text-xl font-bold text-white animate-pulse">Analyzing Compatibility...</h2>
            </div>
          ) : (
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-full pb-10">
              <div className="lg:col-span-1 flex flex-col gap-8">
                <GlassCard className="flex flex-col items-center py-10">
                  <ScoreGauge score={data.ats_score} />
                  <div className="mt-8 text-center">
                    <p className="text-sm font-medium text-slate-400 mb-1">Target Match</p>
                    <div className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                      Strong Match
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                    <Cpu size={16} className="text-cyan-400" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <h3 className="font-bold text-white">Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                      {data.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <ChevronRight size={12} className="mt-0.5 text-emerald-500 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <GlassCard className="border-l-4 border-l-rose-500">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle size={18} className="text-rose-500" />
                      <h3 className="font-bold text-white">Gaps</h3>
                    </div>
                    <ul className="space-y-3">
                      {data.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <ChevronRight size={12} className="mt-0.5 text-rose-500 shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>

                <GlassCard className="relative overflow-hidden group">
                  <h3 className="text-md font-bold text-white mb-6">AI Optimization</h3>
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Before</p>
                      <p className="text-xs text-slate-400 italic">"Worked on the React front-end and fixed various performance bugs."</p>
                    </div>
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <p className="text-[9px] font-black text-cyan-400 uppercase mb-2">AI Suggested</p>
                      <p className="text-xs text-white font-medium">"Architected a scalable React front-end, implementing code-splitting and memoization to reduce TTI by 40%."</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="flex-1 py-3 bg-cyan-500 text-[#050b14] font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} /> Apply
                      </button>
                      <button className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl text-xs border border-white/10 flex items-center justify-center gap-2">
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                  </div>
                </GlassCard>

                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 text-slate-400">
                    <FileText size={18} className="text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[150px]">{file?.name}</p>
                      <p className="text-[9px] uppercase tracking-tighter">Analysis Complete</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setData(null); setFile(null); }} className="p-2.5 text-slate-400 hover:text-rose-400 transition-all">
                      <RefreshCw size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">
                      <Download size={14} /> Download Improved PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}