import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, Globe,
  Sparkles, Bookmark, ChevronRight,
  Loader2, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import Sidebar from '../components/sidebar';

const FindJobs = () => {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [searchQuery, setSearchQuery] = useState({
    query: '',
    location: '',
    experience: 'Intermediate',
    sources: ['linkedin', 'naukri', 'web']
  });

  const sources = [
    { id: 'linkedin', label: 'LinkedIn', color: 'bg-blue-600' },
    { id: 'naukri', label: 'Naukri', color: 'bg-orange-500' },
    { id: 'web', label: 'Web Jobs', color: 'bg-emerald-500' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const mockJobs = [
        {
          id: 1,
          title: "Machine Learning Engineer",
          company: "Google",
          location: "Bangalore",
          salary: "₹20–35 LPA",
          source: "LinkedIn",
          match_score: 92,
          description: "Lead the development of LLM frameworks...",
          skills: ["Python", "PyTorch", "Transformers"]
        },
        {
          id: 2,
          title: "Senior AI Researcher",
          company: "Anthropic",
          location: "Remote",
          salary: "$180k - $240k",
          source: "Web",
          match_score: 74,
          description: "Focus on safety-first alignment...",
          skills: ["RLHF", "NLP"]
        },
        {
          id: 3,
          title: "Data Scientist",
          company: "Zomato",
          location: "Gurgaon",
          salary: "₹15–25 LPA",
          source: "Naukri",
          match_score: 58,
          description: "Optimize delivery routes using graph networks...",
          skills: ["SQL", "Pandas"]
        }
      ];

      setJobs(mockJobs);
      setLoading(false);
    }, 1500);
  };

  const toggleSource = (id) => {
    setSearchQuery(prev => ({
      ...prev,
      sources: prev.sources.includes(id)
        ? prev.sources.filter(s => s !== id)
        : [...prev.sources, id]
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-indigo-500/30">

      <Sidebar />

      <main
        style={{ marginLeft: "var(--sidebar-width)" }}
        className="flex-1 overflow-y-auto pt-3 px-6 lg:px-10 pb-20"
      >
        <div className="max-w-7xl mx-auto space-y-6">

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-10"
          >

            <h3 className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
              Find Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Opportunity
              </span>
            </h3>

            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Search jobs across LinkedIn, Naukri, and the open web powered by AI matching.
            </p>

            <form
              onSubmit={handleSearch}
              className="relative max-w-4xl mx-auto mt-2 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-2"
            >

              <div className="flex-1 flex items-center px-4 gap-3 border-r border-white/10">
                <Search className="text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Job title or keywords"
                  className="bg-transparent border-none outline-none w-full py-3 text-white placeholder:text-slate-500"
                  onChange={(e) => setSearchQuery({ ...searchQuery, query: e.target.value })}
                />
              </div>

              <div className="flex-1 flex items-center px-4 gap-3">
                <MapPin className="text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Location"
                  className="bg-transparent border-none outline-none w-full py-3 text-white placeholder:text-slate-500"
                  onChange={(e) => setSearchQuery({ ...searchQuery, location: e.target.value })}
                />
              </div>

              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                {loading ? <Loader2 className="animate-spin" /> : "Search Jobs"}
              </button>

            </form>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {sources.map(source => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-2
                  ${searchQuery.sources.includes(source.id)
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${searchQuery.sources.includes(source.id) ? source.color : 'bg-slate-600'}`} />
                  {source.label}
                </button>
              ))}
            </div>

          </motion.section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <AnimatePresence>

              {loading ? (

                <div className="col-span-full py-20 text-center space-y-4">
                  <Loader2 className="animate-spin mx-auto text-indigo-500" size={40} />
                  <p className="text-slate-400 animate-pulse">
                    Searching across LinkedIn, Naukri, and Web jobs...
                  </p>
                </div>

              ) : jobs.length > 0 ? (

                jobs.map((job) => (
                  <JobCard key={job.id} job={job} onOpen={() => setSelectedJob(job)} />
                ))

              ) : (

                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                  <AlertCircle className="mx-auto text-slate-600 mb-4" size={48} />
                  <h3 className="text-xl font-medium text-white">No jobs found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
                </div>

              )}

            </AnimatePresence>

          </section>

        </div>
      </main>

      <AnimatePresence>
        {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      </AnimatePresence>

    </div>
  );
};

const JobCard = ({ job, onOpen }) => {

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-400/10';
    if (score >= 60) return 'text-amber-400 bg-amber-400/10';
    return 'text-rose-400 bg-rose-400/10';
  };

  const getSourceColor = (source) => {
    if (source === "LinkedIn") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (source === "Naukri") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  return (
    <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all">

      <div className="flex justify-between items-start mb-4">

        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Briefcase className="text-indigo-400" size={24} />
        </div>

        <div className="flex items-center gap-2">

          <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getScoreColor(job.match_score)}`}>
            {job.match_score}% Match
          </div>

          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getSourceColor(job.source)}`}>
            {job.source}
          </span>

        </div>

      </div>

      <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">
        {job.title}
      </h3>

      <p className="text-slate-400 mt-1 font-medium">{job.company}</p>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
        <MapPin size={14} /> {job.location}
      </div>

      <div className="mt-6 flex items-center justify-between">

        <span className="text-white font-semibold">{job.salary}</span>

        <button
          onClick={onOpen}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
        >
          <ChevronRight size={20} />
        </button>

      </div>

    </div>
  );
};

const JobModal = ({ job, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[#0a101f] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
      >

        <div className="p-8 space-y-6">

          <div className="flex justify-between items-start">

            <div>
              <h2 className="text-3xl font-bold text-white">{job.title}</h2>
              <p className="text-indigo-400 font-medium mt-1">
                {job.company} • {job.location}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
            >
              <X size={24} />
            </button>

          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">About the Role</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">

            <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">
              Apply on {job.source}
            </button>

            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
              <Bookmark size={20} />
            </button>

          </div>

        </div>

      </motion.div>

    </motion.div>
  );
};

export default FindJobs;