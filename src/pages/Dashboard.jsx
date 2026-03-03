import React from 'react';
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {

  const stats = [
    { label: 'ATS Score', value: '78%', color: 'from-cyan-400 to-blue-500' },
    { label: 'Jobs Matched', value: '24', color: 'from-violet-400 to-purple-500' },
    { label: 'Skills Done', value: '12', color: 'from-emerald-400 to-teal-500' },
    { label: 'Ready %', value: '85%', color: 'from-orange-400 to-red-500' },
  ];

  const jobs = [
    { company: 'Neuralink', role: 'AI Interface Designer', match: 98 },
    { company: 'Oracle', role: 'Systems Architect', match: 85 },
    { company: 'Google', role: 'Full Stack Dev', match: 72 },
  ];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans overflow-hidden relative">

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />

      <div className="flex h-screen relative z-10">

        <Sidebar />

        <main className="flex-1 overflow-y-auto custom-scrollbar">

          <Header />

          <div className="p-8 space-y-8 max-w-7xl mx-auto">

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-4xl font-bold text-white">
                Welcome back, Aayush
              </h2>
              <p className="text-slate-400 mt-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Your AI Career Copilot is ready.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 space-y-8">

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Resume Analysis</h3>

                  <div className="flex flex-wrap gap-2">
                    {['Kubernetes', 'Cloud', 'System Design'].map(tag => (
                      <span key={tag} className="text-red-400 text-xs">
                        <AlertCircle className="inline w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-emerald-400 mt-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Add “Scalability” to improve score
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Recommended Jobs</h3>

                  {jobs.map((job, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-white/10">
                      <div>
                        <p className="text-white font-semibold">{job.role}</p>
                        <p className="text-sm text-slate-500">{job.company}</p>
                      </div>
                      <div className="text-cyan-400">{job.match}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-cyan-400 font-bold mb-3">Career Copilot</h3>
                  <p className="text-sm text-slate-400">
                    Ask anything about your career path.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-bold flex items-center gap-2">
                    Next Milestone <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-sm mt-3">AWS Certification</p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;