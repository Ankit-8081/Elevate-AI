import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, User, LayoutDashboard, FileText, 
  Briefcase, MessageSquare, Map, PieChart, Filter, 
  Zap, MapPin, DollarSign, Globe, X, ChevronDown, SlidersHorizontal
} from 'lucide-react';

import Sidebar from '../components/sidebar';
import Header from '../components/header';


const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
  }`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

const FilterBadge = ({ label, onClear }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium animate-in fade-in zoom-in duration-300">
    {label}
    <X size={14} className="cursor-pointer hover:text-white" onClick={onClear} />
  </div>
);

const JobCard = ({ job }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
    className="relative p-6 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md group overflow-hidden"
  >
    <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xl text-white">
          {job.company[0]}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{job.role}</h3>
          <p className="text-slate-400 text-sm flex items-center gap-1.5">{job.company} • <span className="text-xs">{job.posted}</span></p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-violet-400 uppercase tracking-tighter mb-1">AI Score</div>
        <span className="text-xl font-black text-white">{job.match}%</span>
      </div>
    </div>

    <div className="space-y-4 mb-6 relative z-10">
      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded border border-white/5"><MapPin size={14} className="text-cyan-400"/> {job.location}</span>
        <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded border border-white/5"><DollarSign size={14} className="text-violet-400"/> {job.salary}</span>
        <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded border border-white/5"><Globe size={14} className="text-emerald-400"/> {job.type}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {job.skills.map(skill => (
          <span key={skill} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5 uppercase font-medium">
            {skill}
          </span>
        ))}
      </div>
    </div>

    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold hover:from-cyan-500 hover:to-violet-500 transition-all shadow-lg shadow-cyan-900/20 relative z-10">
      View Details & Apply
    </button>
  </motion.div>
);


const FindJobs = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dummyJobs = [
    { role: "Senior Frontend Engineer", company: "Vercel", match: 96, skills: ["Next.js", "Tailwind", "Rust"], location: "Remote", type: "Full-time", salary: "$160k - $210k", posted: "2h ago" },
    { role: "Full Stack Developer", company: "Stripe", match: 84, skills: ["React", "Ruby", "Go"], location: "New York, NY", type: "Hybrid", salary: "$150k - $195k", posted: "5h ago" },
    { role: "UI Designer", company: "Airbnb", match: 72, skills: ["Figma", "Design Systems"], location: "Remote", type: "Contract", salary: "$90/hr", posted: "1d ago" },
    { role: "DevOps Architect", company: "Scale AI", match: 91, skills: ["Kubernetes", "AWS", "Terraform"], location: "San Francisco", type: "Full-time", salary: "$180k - $240k", posted: "3h ago" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 800);
  };

  return (
    <div className="flex h-screen bg-[#050b14] text-slate-200 overflow-hidden">
      
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
      <Header />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
 
          <section className="max-w-5xl mx-auto mb-12">
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight text-center lg:text-left">Discover your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">breakthrough.</span></h2>
            
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex flex-col lg:flex-row gap-2 bg-slate-900 border border-white/10 p-2 rounded-2xl">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <Search className="text-slate-500" size={22} />
                  <input 
                    className="w-full bg-transparent border-none py-4 text-white placeholder-slate-500 focus:outline-none text-lg"
                    placeholder="Search jobs, companies, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="h-full w-[1px] bg-white/10 hidden lg:block my-2"></div>

                <div className="flex items-center gap-2 px-2">
                  <button type="button" className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-xl text-slate-300 transition-colors whitespace-nowrap">
                    <MapPin size={18} className="text-cyan-400" /> Location <ChevronDown size={14}/>
                  </button>
                  <button type="button" className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-xl text-slate-300 transition-colors whitespace-nowrap">
                    <SlidersHorizontal size={18} className="text-violet-400" /> Advanced
                  </button>
                  <button type="submit" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all active:scale-95">
                    Search
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Quick Filters:</span>
               <FilterBadge label="Remote" onClear={() => {}} />
               <FilterBadge label="Entry Level" onClear={() => {}} />
               <FilterBadge label="$120k+" onClear={() => {}} />
               <span className="text-xs text-slate-500 ml-auto italic italic">8,492 roles currently open</span>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
            
         
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Results for <span className="text-cyan-400">"{searchQuery || 'Engineering'}"</span></h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">Sort by:</span>
                  <select className="bg-transparent text-white text-xs font-bold focus:outline-none border-b border-white/20 pb-1 cursor-pointer">
                    <option>Most Relevant</option>
                    <option>Highest Salary</option>
                    <option>Recent</option>
                  </select>
                </div>
              </div>

              {isSearching ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 w-full bg-slate-900/40 rounded-2xl animate-pulse border border-white/5"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {dummyJobs.map((job, idx) => (
                    <JobCard key={idx} job={job} />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-violet-600/20 transition-colors"></div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <PieChart size={20} className="text-cyan-400" /> Market Analytics
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                      <span>In Demand Skill</span>
                      <span className="text-cyan-400">+12.4% YoY</span>
                    </div>
                    <div className="text-lg font-bold text-white mb-1">TypeScript & Next.js</div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-gradient-to-r from-cyan-400 to-violet-500"></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-tighter">Common Skill Gaps in candidates</p>
                    <div className="space-y-3">
                      {["GraphQL Architecture", "AWS Lambda", "Web3.js"].map(skill => (
                        <div key={skill} className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0a192f] to-[#050b14] border border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
                 <Zap className="text-cyan-400 mb-4" size={32} />
                 <h4 className="text-xl font-bold text-white mb-2">AI Resume Sync</h4>
                 <p className="text-sm text-slate-400 mb-6 leading-relaxed">Let our AI agent monitor these search results and notify you the second a high-match job appears.</p>
                 <button className="w-full py-3 bg-white hover:bg-cyan-400 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                   Automate Search
                 </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default FindJobs;