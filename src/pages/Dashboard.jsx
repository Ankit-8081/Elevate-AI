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
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/sidebar.jsx';
import Header from '../components/header.jsx';
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
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Live Update
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);


export default function CareerDashboard() {
  const [user, setUser] = useState(null);
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

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 flex font-sans selection:bg-blue-500/30">
      <Sidebar />

      <main
        style={{ marginLeft: "var(--sidebar-width)" }}
        className="flex-1 flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full relative z-10">
          
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
                  Welcome back, {user ? user.name : "User"}
                </h1>
              </motion.div>
              
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

          {/* Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={CheckCircle2} label="Profile Strength" value="84%" color="bg-blue-500" />
            <StatCard icon={Briefcase} label="Job Matches" value="12" color="bg-purple-500" />
            <StatCard icon={Cpu} label="Skills Verified" value="28" color="bg-emerald-500" />
            <StatCard icon={Sparkles} label="Interview Ready" value="92%" color="bg-amber-500" />
          </section>

          <div className="grid lg:grid-cols-3 gap-8">
          
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-400" />
                  Resume Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-medium text-amber-200">
                        Missing Critical Keywords
                      </p>
                      <p className="text-xs text-amber-200/60 mt-1 leading-relaxed">
                        Your resume lacks "GraphQL" and "Distributed Systems" which are highly requested for your matched roles.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['TailwindCSS', 'System Design', 'Next.js 14', 'TypeScript'].map(skill => (
                      <div key={skill} className="flex items-center gap-2 text-xs text-slate-400 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        {skill} detected
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-1 flex justify-between items-center">
                  Top Recommendations
                  <span className="text-xs font-normal text-slate-500 hover:text-blue-400 cursor-pointer transition-colors">View All</span>
                </h3>

                {[
                  { company: 'Stripe', role: 'Senior Frontend Engineer', match: '98%', logo: 'S', color: 'text-purple-400' },
                  { company: 'Vercel', role: 'Product Engineer', match: '94%', logo: 'V', color: 'text-white' },
                  { company: 'Linear', role: 'UI/UX Developer', match: '89%', logo: 'L', color: 'text-blue-400' }
                ].map((job, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold border border-white/10 ${job.color}`}>
                        {job.logo}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{job.role}</h4>
                        <p className="text-xs text-slate-500">
                          {job.company} • Remote • Full-time
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full mb-1 inline-block border border-emerald-500/20">
                        {job.match} Match
                      </div>
                      <p className="text-[10px] text-slate-500">Posted 2h ago</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              
              <div className="bg-gradient-to-br from-blue-600/20 via-blue-600/5 to-transparent border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI Copilot
                  </h3>
                </div>

                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-xs text-slate-300">
                    Optimize my resume for Stripe
                  </button>
                  <button className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-xs text-slate-300">
                    What skills am I missing for Lead roles?
                  </button>
                  <div className="pt-2 relative">
                    <input
                      type="text"
                      placeholder="Ask your career agent..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                    <ArrowUpRight size={14} className="absolute right-3 top-[26px] text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex justify-between items-center">
                  Next Milestone
                  <Cpu size={14} className="text-slate-500" />
                </h3>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-slate-400">AWS Cloud Practitioner</span>
                    <span className="text-blue-400 font-bold">65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 italic leading-relaxed">
                    "Finish <span className="text-slate-300">EC2 Fundamentals</span> to reach your 80% readiness goal."
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