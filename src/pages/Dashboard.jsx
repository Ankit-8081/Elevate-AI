import React, { useState, useEffect } from 'react';
import Sidebar from "../components/sidebar";
import { 
  LayoutDashboard, FileText, Briefcase, Map, Mic2, 
  BarChart3, Settings, Search, Bell, User, 
  ChevronRight, Sparkles, CheckCircle2, AlertCircle, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  


  const stats = [
    { label: 'ATS Score', value: '78%', color: 'from-cyan-400 to-blue-500' },
    { label: 'Jobs Matched', value: '24', color: 'from-violet-400 to-purple-500' },
    { label: 'Skills Done', value: '12', color: 'from-emerald-400 to-teal-500' },
    { label: 'Ready %', value: '85%', color: 'from-orange-400 to-red-500' },
  ];

  const jobs = [
    { company: 'Neuralink', role: 'AI Interface Designer', match: 98, status: 'Best Match' },
    { company: 'Oracle', role: 'Systems Architect', match: 85, status: 'High' },
    { company: 'Google', role: 'Full Stack Dev', match: 72, status: 'Good' },
  ];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="flex h-screen overflow-hidden relative z-10">

    <Sidebar />
        <main className="flex-1 overflow-y-auto custom-scrollbar">

          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#050b14]/80 backdrop-blur-md z-20">
            <div className="relative w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search AI insights..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_cyan]" />
              </div>
              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right">
                  <p className="text-sm font-semibold">Aayush Thakur</p>
                  <p className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Pro Member</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#050b14] flex items-center justify-center overflow-hidden">
                    <User className="w-6 h-6 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-7xl mx-auto">

            <section>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                  Welcome back, Aayush
                </h2>
                <p className="text-slate-400 mt-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Your AI Career Copilot has analyzed 12 new job listings for you today.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                    <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                    <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '70%' }}
                        className={`h-full bg-gradient-to-r ${stat.color}`} 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 space-y-8">
   
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Resume Analysis</h3>
                      <p className="text-sm text-slate-400">Updated 2 hours ago</p>
                    </div>
                    <button className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all text-sm font-bold">
                      Improve Score
                    </button>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <motion.circle 
                          cx="80" cy="80" r="70" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={440} 
                          initial={{ strokeDashoffset: 440 }} 
                          animate={{ strokeDashoffset: 440 - (440 * 0.78) }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">78</span>
                        <span className="text-[10px] text-slate-400 uppercase">ATS Score</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <p className="text-sm font-semibold text-slate-300">Missing Keywords Identified:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Kubernetes', 'Cloud Architecture', 'System Design', 'GoLang'].map(tag => (
                          <span key={tag} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {tag}
                          </span>
                        ))}
                      </div>
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="text-xs text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> AI Suggestion: Add "Scalability" to your Experience section.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Recommended for You</h3>
                    <button className="text-cyan-400 text-sm hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {jobs.map((job, i) => (
                      <div 
                        key={job.company} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-xl border border-white/10">
                            {job.company[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{job.role}</h4>
                            <p className="text-sm text-slate-500">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-cyan-400 font-bold">{job.match}%</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Match</p>
                          </div>
                          <button className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">

                <div className="p-6 rounded-3xl bg-gradient-to-b from-violet-600/20 to-cyan-600/10 border border-white/10 backdrop-blur-xl h-[400px] flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Career Copilot</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm text-slate-200">
                      Hello Aayush! I noticed you have a gap in Cloud Security. Want to see a roadmap for that?
                    </div>
                    <div className="bg-cyan-500/20 p-3 rounded-2xl rounded-tr-none text-sm text-slate-200 ml-8">
                      Yes, please show me the top 3 skills I need.
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask anything..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500 rounded-lg text-black">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold">Next Milestone</h3>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="relative pl-6 border-l-2 border-white/10 space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]" />
                      <p className="text-xs text-cyan-400 font-bold uppercase">In Progress</p>
                      <p className="text-sm font-semibold">AWS Certified Solutions Architect</p>
                    </div>
                    <div className="relative opacity-50">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-700" />
                      <p className="text-xs text-slate-500 font-bold uppercase">Locked</p>
                      <p className="text-sm font-semibold">Advanced Terraform Modules</p>
                    </div>
                  </div>
                  <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm font-bold">
                    View Full Roadmap
                  </button>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;