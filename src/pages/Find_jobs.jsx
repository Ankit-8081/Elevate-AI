import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const FindJobs = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    query: "",
    location: "",
    experience: "Intermediate",
    sources: ["linkedin", "naukri", "web"],
  });

  const sources = [
    { id: "linkedin", label: "LinkedIn", color: "bg-blue-600" },
    { id: "naukri", label: "Naukri", color: "bg-orange-500" },
    { id: "web", label: "Web Jobs", color: "bg-emerald-500" },
  ];

  // ... inside FindJobs component

  useEffect(() => {
    const fromResume = location.state?.trigger === "resume";
    const passedRole = location.state?.role; // 🔥 GET ROLE FROM NAVIGATION STATE

    if (fromResume) {
      // If we already have the role passed from the previous page, use it immediately!
      if (passedRole) {
        setSearchQuery(prev => ({ ...prev, query: passedRole }));
        autoSearch(passedRole);
      } else {
        // Fallback: If for some reason it wasn't passed, fetch it from backend
        const token = localStorage.getItem("token");
        axios.get(`${API}/user/best-job`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            const role = res.data.best_job_role;
            if (role) {
              setSearchQuery(prev => ({ ...prev, query: role }));
              autoSearch(role);
            }
          });
      }

      // Clean up the state so a refresh doesn't trigger auto-search again
      window.history.replaceState({}, document.title);
    } else {
      fetchJobs();
    }
  }, []);

  const fetchJobs = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API}/jobs`);
      const data = await res.json();

      const formattedJobs = (data.jobs || []).map((job, i) => ({
        id: i,
        title: job.title,
        company: job.company,
        location: job.location,

        source: job.source || "Web",
        match_score: Math.floor(Math.random() * 40) + 60,
        description: job.description,
        skills: [],
        url: job.url,
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Initial job fetch failed:", err);
    }

    setLoading(false);
  };

  const autoSearch = async (jobTitle) => {

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/jobs/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`   // 🔥 ADD THIS
        },
        body: JSON.stringify({
          ...searchQuery,
          query: jobTitle
        }),
      });

      const data = await res.json();

      const formattedJobs = (data.jobs || []).map((job, i) => ({
        id: i,
        title: job.title,
        company: job.company,
        location: job.location,

        source: job.source || "Web",
        match_score: Math.floor(Math.random() * 40) + 60,
        description: job.description,
        skills: [],
        url: job.url,
      }));

      setJobs(formattedJobs);

    } catch (err) {
      console.error("Auto job search failed:", err);
    }

    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.query) {
      alert("Please enter a job title");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/jobs/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`   // 🔥 ADD THIS
        },
        body: JSON.stringify(searchQuery),
      });

      const data = await res.json();

      const formattedJobs = (data.jobs || []).map((job, i) => ({
        id: i,
        title: job.title,
        company: job.company,
        location: job.location,
        source: job.source || "Web",
        match_score: Math.floor(Math.random() * 40) + 60,
        description: job.description,
        skills: [],
        url: job.url,
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Job search failed:", err);
    }

    setLoading(false);
  };

  const toggleSource = (id) => {
    setSearchQuery((prev) => ({
      ...prev,
      sources: prev.sources.includes(id)
        ? prev.sources.filter((s) => s !== id)
        : [...prev.sources, id],
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

          {/* HERO */}

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
                  value={searchQuery.query}
                  placeholder="Job title or keywords"
                  className="bg-transparent border-none outline-none w-full py-3 text-white placeholder:text-slate-500"
                  onChange={(e) =>
                    setSearchQuery({
                      ...searchQuery,
                      query: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex-1 flex items-center px-4 gap-3">
                <MapPin className="text-slate-500" size={20} />
                <input
                  type="text"
                  value={searchQuery.location}
                  placeholder="Location"
                  className="bg-transparent border-none outline-none w-full py-3 text-white placeholder:text-slate-500"
                  onChange={(e) =>
                    setSearchQuery({
                      ...searchQuery,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                {loading ? <Loader2 className="animate-spin" /> : "Search Jobs"}
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {sources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-2
                  ${searchQuery.sources.includes(source.id)
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-white/5 text-slate-500 hover:border-white/10"
                    }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${searchQuery.sources.includes(source.id)
                      ? source.color
                      : "bg-slate-600"
                      }`}
                  />
                  {source.label}
                </button>
              ))}
            </div>
          </motion.section>

          {/* JOB LIST */}

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>

              {loading ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Loader2 className="animate-spin mx-auto text-indigo-500" size={40} />
                </div>

              ) : jobs.length > 0 ? (

                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onOpen={() => setSelectedJob(job)}
                  />
                ))

              ) : (

                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                  <Briefcase className="mx-auto text-slate-600 mb-4" size={48} />
                  <h3 className="text-xl font-medium text-white">Start Your Job Search</h3>
                </div>

              )}

            </AnimatePresence>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {selectedJob && (
          <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const JobCard = ({ job, onOpen }) => {

  // Soft pastel background palette
  const cardColors = [
    "bg-indigo-500/10 border-indigo-400/20",
    "bg-cyan-500/10 border-cyan-400/20",
    "bg-emerald-500/10 border-emerald-400/20",
    "bg-pink-500/10 border-pink-400/20",
    "bg-purple-500/10 border-purple-400/20",
    "bg-orange-500/10 border-orange-400/20",
  ];

  // pick color based on job id
  const color = cardColors[job.id % cardColors.length];

  const getSourceColor = (source) => {
    if (source === "LinkedIn")
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (source === "Naukri")
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  return (
    <motion.div
      onClick={onOpen}
      whileHover={{ y: -5 }}
      className={`group relative p-6 rounded-2xl backdrop-blur-xl
      border transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10
      ${color}`}
    >

      {/* Header */}
      <div className="flex items-start justify-between mb-5">

        <div className="flex items-center gap-4">


          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
              {job.title}
            </h3>

            <p className="text-slate-300 text-sm font-medium">
              {job.company}
            </p>
          </div>

        </div>

        <span
          className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getSourceColor(job.source)}`}
        >
          {job.source}
        </span>

      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-6">
        <MapPin size={15} className="text-indigo-400" />
        {job.location || "Remote"}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">

        <button
          className="flex items-center gap-2 text-sm font-semibold text-indigo-300
          group-hover:text-indigo-200 transition"
        >
          View Job
          <ChevronRight size={18} />
        </button>

      </div>

    </motion.div>
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
        <div className="p-8 space-y-7">

          {/* HEADER */}
          <div className="flex justify-between items-start">

            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white">
                {job.title}
              </h2>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-indigo-400 font-medium">
                  {job.company}
                </span>

                <span className="w-1 h-1 bg-slate-600 rounded-full" />

                <span>{job.location || "Remote"}</span>

                <span className="w-1 h-1 bg-slate-600 rounded-full" />

                <span className="text-indigo-300">
                  {job.source}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition"
            >
              <X size={22} />
            </button>

          </div>


          {/* DESCRIPTION */}
          <div>
            <h4 className="text-white font-semibold mb-2">
              About the Role
            </h4>

            <p className="text-slate-400 text-sm leading-relaxed">
              {job.description}
            </p>
          </div>


          {/* APPLY CARD */}
          <div className="bg-gradient-to-br from-indigo-600/10 via-indigo-500/5 to-cyan-500/10 border border-indigo-500/20 rounded-2xl p-6 space-y-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-white font-semibold text-lg">
                  Ready to Apply?
                </p>

                <p className="text-sm text-slate-400">
                  This will open the job posting on{" "}
                  <span className="text-indigo-400">{job.source}</span>
                </p>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 px-3 py-1 rounded-lg text-xs font-semibold">
                External
              </div>

            </div>


            <div className="flex gap-4">

              {/* APPLY BUTTON */}
              <button
                onClick={() => window.open(job.url, "_blank")}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                Apply Now
                <ChevronRight size={18} />
              </button>

              {/* SAVE BUTTON */}
              <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center">
                <Bookmark size={20} />
              </button>

            </div>

          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default FindJobs;
