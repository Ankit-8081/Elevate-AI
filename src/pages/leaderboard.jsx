import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trophy, Users, TrendingUp, Filter, MapPin, 
  MessageSquare, UserPlus, ExternalLink, ChevronDown, 
  CheckCircle2, Star, Zap, Award, Target, BarChart3, X
} from 'lucide-react';
import Sidebar from '../components/sidebar';

const MOCK_USERS = [
  { id: 1, name: "Sarah Chen", role: "AI Engineer", score: 98, interviews: 42, matches: 31, location: "Singapore", joined: "Jan 2024", badges: ["Top Performer", "Verified"] },
  { id: 2, name: "Marcus Thorne", role: "Lead Architect", score: 96, interviews: 38, matches: 28, location: "London, UK", joined: "Feb 2024", badges: ["Fast Learner"] },
  { id: 3, name: "Aria Rodriguez", role: "Data Scientist", score: 94, interviews: 35, matches: 24, location: "Austin, TX", joined: "Dec 2023", badges: ["Top Performer", "Verified"] },
  { id: 4, name: "Kenji Sato", role: "Backend Developer", score: 91, interviews: 29, matches: 19, location: "Tokyo, JP", joined: "Mar 2024", badges: ["Verified"] },
  { id: 5, name: "Elena Volkov", role: "AI Engineer", score: 89, interviews: 22, matches: 15, location: "Berlin, DE", joined: "Feb 2024", badges: ["Fast Learner"] },
  { id: 6, name: "David Park", role: "Full Stack Dev", score: 85, interviews: 18, matches: 12, location: "Seoul, KR", joined: "Jan 2024", badges: [] },
];


const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl bg-${colorClass}-500/10 text-${colorClass}-400`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-bold">{label}</p>
    </div>
  </motion.div>
);

const RankBadge = ({ rank }) => {
  const styles = {
    1: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
    2: "bg-slate-300/20 text-slate-300 border-slate-300/50",
    3: "bg-orange-700/20 text-orange-500 border-orange-700/50",
  };
  
  if (rank > 3) return <span className="text-gray-500 font-mono text-lg w-8 text-center">#{rank}</span>;

  return (
    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg ${styles[rank]}`}>
      {rank}
    </div>
  );
};

const UserCard = ({ user, rank }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ y: -4 }}
    className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all ${
      rank <= 3 ? 'bg-[#0f172a] border-blue-500/30 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}
  >
    <div className="flex items-center gap-6 min-w-[140px]">
      <RankBadge rank={rank} />
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center text-xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
        </div>
        {user.badges.includes("Verified") && (
          <CheckCircle2 className="absolute -bottom-1 -right-1 text-blue-400 fill-[#050b14]" size={18} />
        )}
      </div>
    </div>

    <div className="flex-1 text-center md:text-left">
      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
        {user.name}
      </h3>
      <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Target size={12} className="text-blue-400" /> {user.role}</span>
        <span className="flex items-center gap-1"><MapPin size={12} /> {user.location}</span>
      </div>
      <div className="flex gap-2 mt-3">
        {user.badges.map(b => (
          <span key={b} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase">
            {b}
          </span>
        ))}
      </div>
    </div>

    <div className="grid-cols-3 gap-8 px-8 border-x border-white/5 hidden lg:grid">
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.score}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Skill Score</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.interviews}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Interviews</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.matches}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Matches</p>
      </div>
    </div>

    <div className="flex gap-2">
      <button className="p-3 rounded-xl bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all border border-white/10 hover:border-blue-500/40">
        <MessageSquare size={18} />
      </button>
      <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
        <UserPlus size={18} />
        <span className="hidden sm:inline">Connect</span>
      </button>
    </div>
  </motion.div>
);

const LeaderboardPage = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredUsers = useMemo(() => {
    return MOCK_USERS
      .filter(u => 
        (u.name.toLowerCase().includes(search.toLowerCase()) || 
         u.role.toLowerCase().includes(search.toLowerCase())) &&
        (activeFilter === "All" || u.role === activeFilter)
      )
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [search, sortBy, activeFilter]);

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-300">
      <Sidebar />

      <main
  style={{ marginLeft: "var(--sidebar-width)" }}
  className="flex-1 flex flex-col overflow-y-auto transition-all duration-300 p-4 md:p-8"
>
        <div className="max-w-7xl mx-auto space-y-8 pt-4">
      
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="text-yellow-500 w-6 h-6" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Explore Talent Leaderboard</h1>
              </div>
              <p className="text-gray-400 max-w-xl">
                Discover top performers on the platform ranked by skills, activity, and achievements.
              </p>
            </div>

            <div className="flex gap-4">
               <StatCard label="Total Talent" value="12.8k" icon={Users} colorClass="blue" />
               <StatCard label="Trending Skill" value="PyTorch" icon={TrendingUp} colorClass="purple" />
            </div>
          </header>

          <hr className="border-white/5" />

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search by username, skill, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="lg:col-span-4 flex gap-2">
              <div className="relative flex-1">
                <select 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="score">Sort by: Skill Score</option>
                  <option value="interviews">Sort by: Interviews</option>
                  <option value="matches">Sort by: Job Matches</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {["All", "AI Engineer", "Data Scientist", "Backend Developer", "Lead Architect"].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${
                  activeFilter === filter 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <section className="space-y-4 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <UserCard key={user.id} user={user} rank={index + 1} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl"
                >
                  <div className="bg-gray-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">No results found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters to find more talent.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050b14; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        select {
          background-image: none;
        }
      `}</style>
    </div>
  );
};

export default LeaderboardPage;