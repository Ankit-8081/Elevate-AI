import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Briefcase, Cpu, MessageSquare, Settings, 
  Search, Bell, User, Upload, CheckCircle2, AlertTriangle, ArrowRight, 
  Download, Copy, RefreshCw, X, Zap, ChevronRight
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

const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group ${
    active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}>
    {active && (
      <motion.div 
        layoutId="activeGlow"
        className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-md"
      />
    )}
    <Icon size={20} className={active ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'} />
    <span className="text-sm font-medium">{label}</span>
    {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
  </div>
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-center">
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="flex items-baseline justify-center gap-1"
  >
    <span className="text-3xl font-semibold text-white">
      {score}
    </span>
    <span className="text-sm text-slate-400 font-medium">%</span>
  </motion.div>

  <p className="text-xs text-slate-500 tracking-wide mt-1">
    ATS Score
  </p>
</div>
      </div>
    </div>
  );
};

export default function ResumeDashboard() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState(null);

  const onUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setAnalyzing(true);

    const formData = new FormData();
    formData.append('resume', selected);

    try {
      const res = await axios.post('http://localhost:8000/upload-resume', formData);
      setData(res.data);
    } catch (err) {
      setTimeout(() => {
        setData({
          ats_score: 84,
          strengths: ["Quantified achievements with metrics", "Strong React/Node.js stack", "Professional layout density"],
          weaknesses: ["Missing Cloud Infrastructure details", "Vague leadership bullet points", "No GitHub portfolio link"],
          missing_keywords: ["Docker", "Kubernetes", "CI/CD", "Redis", "Unit Testing", "Terraform", "GraphQL"],
          suggestions: ["Quantify your role at Google: change 'managed team' to 'led a team of 12 to deploy 4 microservices'"]
        });
      }, 2500);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-[#050b14] flex overflow-hidden">
      <Sidebar />
      
     <div
  style={{ marginLeft: "var(--sidebar-width)" }}
  className="flex flex-col flex-1 min-h-screen relative"
>
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />



      <main
  className={`flex-1 p-8 max-w-7xl mx-auto w-full relative z-10 custom-scrollbar ${data ? 'overflow-y-auto' : 'overflow-hidden'}`}
>
          
          {!data && !analyzing ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">AI Resume Analyzer</h1>
                <p className="text-slate-400">Upload your profile to get instant ATS feedback and AI-powered optimizations.</p>
              </div>

              <label className="relative group block w-full h-80 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/50 transition-all cursor-pointer">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="text-cyan-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Drag and drop your resume</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Supported formats: PDF, DOCX (Max 10MB). Your data is encrypted and private.</p>
                </div>
                <input type="file" className="hidden" onChange={onUpload} accept=".pdf,.docx" />
              </label>
            </motion.div>
          ) : analyzing ? (
            <div className="h-[60vh] flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
                />
                <Cpu className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white animate-pulse">Scanning Intelligence...</h2>
              <p className="text-slate-500 mt-2">Extracting keywords and calculating compatibility scores.</p>
            </div>
          ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-full pb-6">
              
              <div className="lg:col-span-1 flex flex-col gap-8">
                <GlassCard className="flex flex-col items-center py-10">
                  <ScoreGauge score={data.ats_score} />
                  <div className="mt-8 text-center">
                    <p className="text-sm font-medium text-slate-400 mb-1">Overall Compatibility</p>
                    <div className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                      Strong Match
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Cpu size={18} className="text-cyan-400" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_keywords.map((kw, i) => (
                      <motion.span 
                        key={i}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 211, 238, 0.2)' }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 cursor-default transition-colors"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle2 size={20} /></div>
                      <h3 className="font-bold text-white">Key Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                      {data.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <ChevronRight size={14} className="mt-1 text-emerald-500 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <GlassCard className="border-l-4 border-l-rose-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><AlertTriangle size={20} /></div>
                      <h3 className="font-bold text-white">Critical Gaps</h3>
                    </div>
                    <ul className="space-y-3">
                      {data.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <ChevronRight size={14} className="mt-1 text-rose-500 shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>

                <GlassCard className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <MessageSquare size={120} className="text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-6">AI Suggestion Engine</h3>
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Current Version</p>
                      <p className="text-sm text-slate-400 line-through decoration-rose-500/50 italic">"Worked on the React front-end and fixed various performance bugs."</p>
                    </div>
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <p className="text-[10px] font-black text-cyan-400 uppercase mb-2">AI Optimized</p>
                      <p className="text-sm text-white font-medium">"Architected a scalable React front-end, implementing code-splitting and memoization to reduce TTI by 40%."</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#050b14] font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> Apply Suggestion
                      </button>
                      <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm border border-white/10 transition-all flex items-center justify-center gap-2">
                        <Copy size={16} /> Copy
                      </button>
                    </div>
                  </div>
                </GlassCard>

                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-4 text-slate-400">
                    <FileText size={20} className="text-cyan-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{file?.name}</p>
                      <p className="text-[10px] uppercase tracking-tighter">Ready for export</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setData(null); setFile(null); }}
                      className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-slate-200 transition-all">
                      <Download size={18} /> Download Improved PDF
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