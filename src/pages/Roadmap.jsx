import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Zap, Brain, CheckCircle2, Sparkles, TrendingUp,
  ChevronDown, BookOpen, Clock
} from "lucide-react";
import Sidebar from "../components/sidebar";

const MOCK_ROADMAP = [
  {
    id: 1,
    title: "Foundations",
    duration: "4 Weeks",
    progress: 100,
    skills: [
      { name: "Python", difficulty: "Easy", time: "10h", status: "Completed" },
      { name: "Linear Algebra", difficulty: "Medium", time: "15h", status: "Completed" },
      { name: "Probability", difficulty: "Medium", time: "12h", status: "Completed" },
    ]
  },
  {
    id: 2,
    title: "Core Skills",
    duration: "8 Weeks",
    progress: 45,
    skills: [
      { name: "Machine Learning", difficulty: "Hard", time: "40h", status: "In Progress" },
      { name: "Deep Learning", difficulty: "Hard", time: "50h", status: "Not Started" },
      { name: "PyTorch", difficulty: "Medium", time: "30h", status: "Not Started" },
    ]
  },
  {
    id: 3,
    title: "Advanced Topics",
    duration: "6 Weeks",
    progress: 0,
    skills: [
      { name: "LLMs", difficulty: "Hard", time: "25h", status: "Not Started" },
      { name: "Transformers", difficulty: "Hard", time: "20h", status: "Not Started" },
      { name: "MLOps", difficulty: "Medium", time: "20h", status: "Not Started" },
    ]
  }
];

const SkillRoadmap = () => {
  const [loading, setLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [role, setRole] = useState("AI Engineer");
  const [user, setUser] = useState(null);   // ← ADD THIS
  const navigate = useNavigate();           // ← ADD THIS

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowRoadmap(true);
    }, 1500);
  };
  const ROLE_SKILLS = {
    "AI Engineer": ["Python", "PyTorch", "Transformers", "MLOps", "Deep Learning"],
    "Backend Developer": ["Node.js", "Databases", "API Design", "Docker", "System Design"],
    "Data Scientist": ["Python", "Statistics", "Machine Learning", "Pandas", "SQL"],
    "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"]
  };
  const requiredSkills = ROLE_SKILLS[role] || [];
  
  const skillGaps = user?.skills
    ? requiredSkills.filter(skill => !user.skills.includes(skill))
    : [];
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://127.0.0.1:8000/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setUser(res.data))
      .catch(err => console.error(err));

  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex font-sans">
      <Sidebar />

      <main
        style={{ marginLeft: "var(--sidebar-width)" }}
        className="flex-1 flex flex-col overflow-y-auto"
      >
        <div className="p-8 max-w-7xl mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
              <Map className="text-blue-400" /> Skill Path Architect
            </h1>
            <p className="text-slate-400 mt-2">AI-powered career mapping for the next generation of engineers.</p>
          </header>

          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Role</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>AI Engineer</option>
                  <option>Backend Developer</option>
                  <option>Data Scientist</option>
                  <option>DevOps Engineer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Experience</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Domain Focus</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option>Generative AI</option>
                  <option>Web Systems</option>
                  <option>Cloud Infrastructure</option>
                </select>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 h-[42px]"
              >
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={18} /> Generate Roadmap</>}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {showRoadmap ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {MOCK_ROADMAP.map((stage, index) => (
                      <StageCard key={stage.id} stage={stage} index={index} />
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                    <Brain size={48} className="mb-4 opacity-20" />
                    <p>Define your goals above to visualize your learning path.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <aside className="lg:col-span-4 space-y-6">

  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md sticky top-8">

    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Zap size={20} className="text-yellow-400" /> AI Insights
    </h3>

    <div className="space-y-4">

      {(!user?.skills || user.skills.length === 0) ? (

        <InsightItem
          title="Resume Needed"
          desc="Upload your resume in the Resume Analyzer to unlock personalized insights."
        />

      ) : (

        <>
          <InsightItem
            title="Skill Gaps"
            desc={
              skillGaps.length
                ? `You should focus on learning: ${skillGaps.slice(0,3).join(", ")}.`
                : "Your core skillset already aligns well with this role."
            }
          />

          <InsightItem
            title="Job Readiness"
            desc={
              user.market_readiness === "High"
                ? "You appear ready for interviews in this role."
                : user.market_readiness === "Medium"
                ? "You are partially ready. Focus on closing a few skill gaps."
                : "You still need significant preparation for this role."
            }
          />
        </>
      )}

      <div className="pt-4 border-t border-slate-800">

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">
            Total Completion
          </span>

          <span className="text-sm font-bold text-blue-400">
            {user?.skills ? Math.min(100, user.skills.length * 10) : 0}%
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${user?.skills ? Math.min(100, user.skills.length * 10) : 0}%` }}
            className="h-full bg-blue-500"
          />
        </div>

      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">

        <StatBox
          label="Streak"
          value="12 Days"
          icon={<TrendingUp size={14} />}
          color="text-orange-400"
        />

        <StatBox
          label="Skills"
          value={user?.skills ? `${user.skills.length}/24` : "--"}
          icon={<CheckCircle2 size={14} />}
          color="text-green-400"
        />

      </div>

    </div>

  </div>

</aside>
          </div>
        </div>
      </main>
    </div>
  );
};

const StageCard = ({ stage, index }) => {
  const [expanded, setExpanded] = useState(index === 1);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 border-l-2 border-slate-800"
    >
      <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-slate-900 ${stage.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`} />

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
        <div
          className="p-5 cursor-pointer flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Stage {stage.id}</span>
              <h2 className="text-xl font-bold">{stage.title}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Clock size={14} /> {stage.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={14} /> {stage.skills.length} modules</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Progress</div>
              <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.progress}%` }}
                  className={`h-full ${stage.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
              </div>
            </div>
            <ChevronDown className={`transition-transform text-slate-500 ${expanded ? 'rotate-180' : ''}`} size={20} />
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-5 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {stage.skills.map((skill, idx) => (
                  <SkillCard key={idx} skill={skill} />
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-between">
                <span className="text-xs text-blue-300 font-medium italic">Pro Tip: Focus on practical implementation of these concepts.</span>
                <button className="text-xs text-blue-400 font-bold hover:underline">View Resources</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SkillCard = ({ skill }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 group hover:bg-slate-800/60 transition-colors"
  >
    <div className="flex justify-between items-start mb-4">
      <h4 className="font-semibold text-slate-200 text-sm leading-tight">{skill.name}</h4>
      <StatusBadge
        status={skill.status}
        onChange={(val) => console.log(val)}
      />
    </div>
    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
      <span className={`px-2 py-0.5 rounded-md border ${getDiffColor(skill.difficulty)}`}>
        {skill.difficulty}
      </span>
      <span className="flex items-center gap-1 text-slate-500">
        <Clock size={10} /> {skill.time}
      </span>
    </div>
  </motion.div>
);

const StatusBadge = ({ status, onChange }) => {
  const getStatusStyles = (currentStatus) => {
    switch (currentStatus) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
      case "Not Started":
        return "bg-slate-700/30 text-slate-400 border-slate-700/50 hover:bg-slate-700/50";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none cursor-pointer
          text-[9px] uppercase tracking-tighter font-black
          px-2 py-1 rounded-lg border outline-none
          transition-all duration-200
          ${getStatusStyles(status)}
        `}
        style={{ textAlignLast: 'center' }}
      >
        <option value="Completed" className="bg-[#0a0a0c] text-emerald-400">Completed</option>
        <option value="In Progress" className="bg-[#0a0a0c] text-blue-400">In Progress</option>
        <option value="Not Started" className="bg-[#0a0a0c] text-slate-400">Not Started</option>
      </select>
    </div>
  );
};

const getDiffColor = (diff) => {
  if (diff === 'Easy') return 'text-emerald-400 border-emerald-900/50 bg-emerald-900/10';
  if (diff === 'Medium') return 'text-amber-400 border-amber-900/50 bg-amber-900/10';
  return 'text-rose-400 border-rose-900/50 bg-rose-900/10';
};

const InsightItem = ({ title, desc }) => (
  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-800">
    <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">{title}</div>
    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
    <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
    <div className="text-sm font-bold">{value}</div>
    <div className="text-[10px] text-slate-500 uppercase font-semibold">{label}</div>
  </div>
);

export default SkillRoadmap;