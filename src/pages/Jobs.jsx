import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { 
  Search, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

const JobMatchesPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  const jobs = [
    {
      id: 1,
      company: "Google",
      role: "Senior Frontend Developer",
      match: 98,
      status: "Best Match",
      salary: "$180k - $240k",
      location: "Mountain View, CA",
      description: "Leading the evolution of Next-gen UI frameworks for cloud platforms.",
      missingSkills: ["WebAssembly"],
      topSkills: ["React", "TypeScript", "System Design"],
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 2,
      company: "Amazon",
      role: "Backend Engineer",
      match: 85,
      status: "High",
      salary: "$160k - $210k",
      location: "Remote",
      description: "Scaling distributed systems for global e-commerce infrastructure.",
      missingSkills: ["Rust", "DynamoDB"],
      topSkills: ["Node.js", "AWS", "Docker"],
      color: "from-violet-500 to-fuchsia-500"
    },
    {
      id: 3,
      company: "Linear",
      role: "Full Stack Engineer",
      match: 76,
      status: "Good",
      salary: "$140k - $190k",
      location: "London / Hybrid",
      description: "Building high-performance desktop-grade web experiences.",
      missingSkills: ["GraphQL", "Postgres"],
      topSkills: ["React", "Node.js", "Tailwind"],
      color: "from-amber-400 to-orange-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex">
      <Sidebar />
       

       <main
  style={{ marginLeft: "var(--sidebar-width)" }}
  className="flex-1 overflow-y-auto"
>
          <div className="p-4 lg:p-8">

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8">
              {/* Page Header */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">Job Matches</h1>
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-slate-400">AI-curated opportunities based on your profile and history.</p>
              </section>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                {['Role', 'Location'].map((filter) => (
                  <button key={filter} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 flex items-center gap-2 text-sm transition-all">
                    {filter} <ChevronDown className="w-4 h-4" />
                  </button>
                ))}
                <div className="h-8 w-[1px] bg-white/10 mx-2" />
                <button className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
                  Remote Only
                </button>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-4"
              >
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.005 }}
                    onClick={() => setSelectedJob(job)}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                    <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                            {job.company[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{job.role}</h3>
                            <p className="text-slate-400 flex items-center gap-2">
                              {job.company} • <span className="text-xs uppercase tracking-wider">{job.status}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center md:justify-end gap-2 mb-1">
                            <span className="text-2xl font-black text-cyan-400">{job.match}%</span>
                            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${job.match}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">AI Compatibility Score</p>
                        </div>
                      </div>

                      <p className="mt-4 text-slate-300 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {job.missingSkills.map(skill => (
                            <span key={skill} className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Missing {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                          <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.salary}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <aside className="xl:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Your Match Insights
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Average Match %</span>
                      <span className="text-cyan-400 font-bold">86.4%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[86%] bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Top Skills Found</p>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Tailwind', 'Node.js', 'System Design'].map(skill => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-sm font-medium text-violet-300 mb-1">Growth Opportunity</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Learning <span className="text-violet-400">WebAssembly</span> could increase your match rate with 12 new high-paying positions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 border-dashed relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative text-center">
                  <p className="text-sm text-slate-400 mb-2">Ready for a real challenge?</p>
                  <p className="font-bold text-white mb-4">Try AI Interview Prep</p>
                  <button className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-cyan-400 transition-colors">
                    Start Session
                  </button>
                </div>
              </div>
            </aside>
          </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={`h-24 bg-gradient-to-r ${selectedJob.color} opacity-20`} />
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 -mt-12">
                <div className="flex items-end justify-between mb-8">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedJob.color} flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-[#0d0d0d]`}>
                    {selectedJob.company[0]}
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-medium">
                      Save
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                      Apply Now <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedJob.role}</h2>
                    <p className="text-cyan-400 font-medium mb-6">{selectedJob.company}</p>
                    
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Job Description</h4>
                    <p className="text-slate-300 leading-relaxed mb-6">
                      {selectedJob.description} You will collaborate with cross-functional teams to build scalable, high-performance applications that impact millions of users.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Match Analysis</h4>
                      <div className="space-y-3">
                        {selectedJob.topSkills.map(skill => (
                          <div key={skill} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {skill}</span>
                            <span className="text-emerald-500">Strong</span>
                          </div>
                        ))}
                        {selectedJob.missingSkills.map(skill => (
                          <div key={skill} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> {skill}</span>
                            <span className="text-rose-500 text-xs">Gap</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Location</p>
                        <p className="font-medium">{selectedJob.location}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Salary Range</p>
                        <p className="font-medium text-emerald-400">{selectedJob.salary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobMatchesPage;