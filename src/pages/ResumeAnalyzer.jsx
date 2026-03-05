import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Header from "../components/header";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  X,
  Zap,
  Search,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Sidebar from "../components/sidebar";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GlassCard = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {children}
  </motion.div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    default: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", styles[variant])}>
      {children}
    </span>
  );
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];

    if (!uploadedFile) return;

    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {

      setIsAnalyzing(true);

      const res = await axios.post(
        "http://localhost:8000/upload-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);

      setIsAnalyzing(false);
      setShowResults(true);

    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const reset = () => {
    setFile(null);
    setShowResults(false);
  };

  return (
    <div className="flex min-h-screen bg-[#050b14] text-slate-200 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto relative">
        <Header />
          <div className="p-4 md:p-8">
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] -z-10" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 blur-[120px] -z-10" />

        <main className="max-w-5xl mx-auto space-y-8">
          <header className="text-center space-y-4">

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Resume Analyzer
            </h1>
          </header>

          <section>
            <GlassCard className="border-cyan-500/20">
              {!isAnalyzing && !showResults ? (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/10 rounded-xl relative cursor-pointer group hover:border-cyan-500/40 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-4 bg-cyan-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={40} className="text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Upload Resume</h3>
                  <p className="text-slate-400 text-sm mt-1">PDF or DOCX (Max 5MB)</p>
                </div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
                  />
                  <p className="mt-6 text-cyan-400 font-medium animate-pulse">Scanning Document Structure...</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <FileText className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{file?.name}</h3>
                      <p className="text-slate-500 text-xs">Ready for new analysis</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => document.querySelector('input').click()}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
                    >
                      Change File
                    </button>
                    <button onClick={reset} className="p-2 text-slate-400 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </div>
              )}
            </GlassCard>
          </section>

          <section className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {!showResults ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 opacity-40"
                >
                  <Search size={48} className="text-slate-600 mb-4" />
                  <p className="text-slate-500 italic">Analysis results will be displayed here</p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <GlassCard className="md:col-span-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">ATS Score</h3>
                    <div className="relative flex items-center justify-center mb-4">
                      <svg className="w-32 h-32 -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/5" />
                        <motion.circle
                          cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="none"
                          strokeDasharray={365}
                          initial={{ strokeDashoffset: 365 }}
                          animate={{ strokeDashoffset: 365 - (365 * 78) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="text-cyan-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">78%</span>
                      </div>
                    </div>
                    <Badge variant="success">Strong Potential</Badge>
                  </GlassCard>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <GlassCard className="p-5 border-emerald-500/20">
                        <h3 className="text-emerald-400 flex items-center gap-2 font-semibold mb-3">
                          <CheckCircle2 size={18} /> Key Strengths
                        </h3>
                        <ul className="text-sm text-slate-300 space-y-2">
                          <li>• Strong React architecture exposure</li>
                          <li>• Excellent use of action verbs</li>
                        </ul>
                      </GlassCard>

                      <GlassCard className="p-5 border-rose-500/20">
                        <h3 className="text-rose-400 flex items-center gap-2 font-semibold mb-3">
                          <AlertCircle size={18} /> Crucial Gaps
                        </h3>
                        <ul className="text-sm text-slate-300 space-y-2">
                          <li>• Missing Cloud Infra keywords</li>
                          <li>• Contact details are cluttered</li>
                        </ul>
                      </GlassCard>
                    </div>

                    <GlassCard className="p-5">
                      <h3 className="text-amber-400 flex items-center gap-2 font-semibold mb-4">
                        <Zap size={18} /> Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {["AWS", "Docker", "Kubernetes", "CI/CD", "Redis", "Unit Testing"].map((k) => (
                          <Badge key={k}>{k}</Badge>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard className="bg-gradient-to-r from-cyan-500/10 to-transparent">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-semibold mb-2">AI Suggestions</h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            To hit 90%+, quantify your impact. Instead of "Improved performance," use 
                            <span className="text-cyan-400"> "Optimized load times by 40%."</span>
                          </p>
                        </div>
                        <button className="flex-shrink-0 p-2 bg-cyan-500 text-black rounded-lg hover:scale-105 transition-transform">
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
        </div>
      </div>
    </div>
  );
}