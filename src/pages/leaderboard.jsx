import React, { useState, useMemo, useEffect } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trophy, Users, TrendingUp, Filter, MapPin, 
  MessageSquare, UserPlus, ChevronDown, 
  CheckCircle2, Target, X, Zap
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;
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

const UserCard = ({ user, rank, onClick, navigate, currentUser }) => {
  const isSelf = String(currentUser?.id) === String(user.id);
  const isFriend = user.isFriend;
  const [sent, setSent] = useState(user.requestSent || false);
  const [showMenu, setShowMenu] = useState(false);

  return (
  <motion.div
    layout
    onClick={onClick}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ y: -4 }}
    className={`cursor-pointer group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all ${
      rank <= 3 ? 'bg-[#0f172a] border-blue-500/30 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}
  >
    <div className="flex items-center gap-6 min-w-[140px]">
      <RankBadge rank={rank} />
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-2xl bg-gray-900 overflow-hidden flex items-center justify-center">
  {user.profile_image ? (
    <img
      src={`${API}${user.profile_image}`}
      alt="pfp"
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-xl font-bold text-white">
      {user.name?.charAt(0)}
    </span>
  )}
</div>
        </div>
        {user.badges?.includes("Verified") && (
          <CheckCircle2 className="absolute -bottom-1 -right-1 text-blue-400 fill-[#050b14]" size={18} />
        )}
      </div>
    </div>

    <div className="flex-1 text-center md:text-left">
      <div className="flex items-center justify-center md:justify-start gap-3">
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
          {user.name}
        </h3>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Zap size={10} className="text-emerald-400 fill-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400">{user.relevancyScore}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Target size={12} className="text-blue-400" /> {user.role}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {user.location}
        </span>
      </div>
      <div className="flex gap-2 mt-3">
        {user.badges?.map(b => (
          <span key={b} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase">
            {b}
          </span>
        ))}
      </div>
    </div>

    <div className="grid-cols-4 gap-8 px-8 border-x border-white/5 hidden lg:grid">
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.projectsBuilt || 0}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Projects Built</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.modulesCompleted || 0}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Modules Done</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.skillsMastered || 0}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Skills Mastered</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">{user.profileViews || 0}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
           Profile Views
       </p>
      </div>
    </div>

    

<div className="flex gap-2">
  {isSelf ? (
    <div className="w-[110px]" />
  ) : isFriend ? (
<>
  <button
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/chat/${user.id}`);
    }}
    className="p-3 rounded-xl bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all border border-white/10 hover:border-blue-500/40"
  >
    <MessageSquare size={18} />
  </button>

  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowMenu(prev => !prev);
      }}
      className="px-4 py-3 rounded-xl bg-green-600/20 text-green-400 border border-green-500/30 text-sm font-bold hover:bg-green-600/30 transition"
    >
      Friend ✓
    </button>

    {showMenu && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 mt-2 w-36 bg-[#0f172a] border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <button
          onClick={() => {
            axios.delete(`${API}/friends/remove/${user.id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            })
            .then(() => {
              setShowMenu(false);
              window.location.reload();
            })
            .catch(err => {
              console.error(err);
              alert("Failed to remove friend");
            });
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          Remove Friend
        </button>
      </div>
    )}
  </div>
</>
) : (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/chat/${user.id}`);
        }}
        className="p-3 rounded-xl bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all border border-white/10 hover:border-blue-500/40"
      >
        <MessageSquare size={18} />
      </button>

      <button
        disabled={sent}
        onClick={(e) => {
          e.stopPropagation();
          axios.post(`${API}/friends/request/${user.id}`, {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          })
          .then(() => setSent(true))
          .catch(() => setSent(true));
        }}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-white transition ${
          sent ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        <UserPlus size={18} />
        {sent ? "Sent" : "Connect"}
      </button>
    </>
  )}
</div>
  </motion.div>
);
};

const LeaderboardPage = () => {
  const navigate = useNavigate(); 
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [trendingSkill, setTrendingSkill] = useState("");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sortBy, setSortBy] = useState("relevancyScore");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API}/api/leaderboard`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});
        const rawUsers = res.data?.users || [];
        const processedUsers = rawUsers.map(u => {
          const p = u.projectsBuilt || 0;
          const m = u.modulesCompleted || 0;
          const s = u.skillsMastered || 0;
          return {
            ...u,
            projectsBuilt: p,
            modulesCompleted: m,
            skillsMastered: s,
            relevancyScore: (p * 50) + (m * 20) + (s * 30)
          };
        });
        setUsers(processedUsers);
        setTotalUsers(res.data.totalUsers || 0);
        setTrendingSkill(res.data.trendingSkill || "None");
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
  const fetchMe = async () => {
    try {
      const res = await axios.get(`${API}/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  fetchMe();
}, []);
  const filteredUsers = useMemo(() => {
    return users
      .filter(u =>
        (u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.role?.toLowerCase().includes(search.toLowerCase())) &&
        (activeFilter === "All" || u.role === activeFilter)
      )
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [users, search, sortBy, activeFilter]);

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
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Explore Talent Leaderboard
                </h1>
              </div>
              <p className="text-gray-400 max-w-xl">
                Discover top performers on the platform ranked by projects, completion rates, and mastered expertise.
              </p>
            </div>
            <div className="flex gap-4">
              <StatCard
                label="Total Talent"
                value={totalUsers}
                icon={Users}
                colorClass="blue"
              />
              <StatCard
                label="Trending Skill"
                value={trendingSkill}
                icon={TrendingUp}
                colorClass="purple"
              />
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
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                >
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
                  <option value="relevancyScore">Sort by: Relevancy</option>
                  <option value="projectsBuilt">Sort by: Projects</option>
                  <option value="modulesCompleted">Sort by: Modules</option>
                  <option value="skillsMastered">Sort by: Skills</option>
                  <option value="profileViews">Sort by: Profile Views</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </section>

          <section className="space-y-4 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id || user.name}
                  user={user}
                  rank={index + 1}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  navigate={navigate}
                  currentUser={currentUser}
                />
              ))}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;