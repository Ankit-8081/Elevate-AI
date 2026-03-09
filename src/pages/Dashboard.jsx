import React, { useState, useEffect } from 'react';
import axios from "axios";
import { 
  LayoutDashboard, FileText, Briefcase, Cpu, MessageSquare, Settings, 
  Search, Bell, User, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar  from '../components/sidebar.jsx';
import Header from '../components/header.jsx'



const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
    active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}>
    <Icon size={18} className={active ? 'text-blue-400' : 'group-hover:text-blue-400'} />
    <span className="text-sm font-medium">{label}</span>
  </div>
);


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
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Update</div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);


export default function CareerDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  axios.get("http://127.0.0.1:8000/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    setUser(res.data);
  })
  .catch(err => {
    console.log(err);
  });

}, []);
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 flex font-sans selection:bg-blue-500/30">
      <Sidebar/>
     
     <main
  className="flex-1 flex flex-col relative overflow-hidden"
  style={{ marginLeft: "var(--sidebar-width)" }}
>
       
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          <section className="mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <Sparkles className="text-blue-400" size={20} />
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user ? user.name : "User"}</h1>
            </motion.div>
            <p className="text-slate-400">Your AI Career Copilot has analyzed 12 new job postings since your last visit.</p>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={CheckCircle2} label="Profile Strength" value="84%" color="bg-blue-500" />
            <StatCard icon={Briefcase} label="Job Matches" value="12" color="bg-purple-500" />
            <StatCard icon={Cpu} label="Skills Verified" value="28" color="bg-emerald-500" />
            <StatCard icon={Sparkles} label="Interview Ready" value="92%" color="bg-amber-500" />
          </section>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-400" /> Resume Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-medium text-amber-200">Missing Critical Keywords</p>
                      <p className="text-xs text-amber-200/60 mt-1">Your resume lacks "GraphQL" and "Distributed Systems" which are highly requested for your matched roles.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['TailwindCSS', 'System Design', 'Next.js 14', 'TypeScript'].map(skill => (
                      <div key={skill} className="flex items-center gap-2 text-xs text-slate-400 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {skill} detected
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-1">Top Recommendations</h3>
                {[
                  { company: 'Stripe', role: 'Senior Frontend Engineer', match: '98%', logo: 'S' },
                  { company: 'Vercel', role: 'Product Engineer', match: '94%', logo: 'V' },
                  { company: 'Linear', role: 'UI/UX Developer', match: '89%', logo: 'L' }
                ].map((job, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 8 }}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white border border-white/10">
                        {job.logo}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{job.role}</h4>
                        <p className="text-xs text-slate-500">{job.company} • San Francisco (Remote)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md mb-1 inline-block">
                        {job.match} Match
                      </div>
                      <p className="text-[10px] text-slate-500">Posted 2h ago</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-gradient-to-b from-blue-600/20 to-transparent border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Copilot</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
                    <p className="text-xs font-medium text-slate-300 group-hover:text-white">"Optimize my resume for Stripe"</p>
                  </button>
                  <button className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
                    <p className="text-xs font-medium text-slate-300 group-hover:text-white">"What skills am I missing for Lead roles?"</p>
                  </button>
                  <div className="pt-2 relative">
                    <input 
                      type="text" 
                      placeholder="Ask anything..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <ArrowUpRight size={14} className="absolute right-3 top-[26px] text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Next Milestone</h3>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-slate-400">AWS Cloud Practitioner</span>
                    <span className="text-blue-400 font-bold">65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-blue-500" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 italic">"Finish 'EC2 Fundamentals' to hit 80%"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}