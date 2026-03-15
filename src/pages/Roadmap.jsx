import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Zap, Brain, CheckCircle2, Sparkles, TrendingUp,
  ChevronDown, BookOpen, Clock, Download, ExternalLink, Info
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Sidebar from '../components/sidebar';


const ROLE_SKILLS = {
  "AI Engineer": ["Python", "PyTorch", "Transformers", "MLOps", "Deep Learning"],
  "Backend Developer": ["Node.js", "Databases", "API Design", "Docker", "System Design"],
  "Data Scientist": ["Python", "Statistics", "Machine Learning", "Pandas", "SQL"],
  "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"]
};

const SkillRoadmap = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [role, setRole] = useState(location.state?.role || "");
  const [roadmapData, setRoadmapData] = useState([]);
  const [user, setUser] = useState(null);
  const roadmapRef = useRef(null);

  const highlightSkill = location.state?.highlightSkill;
  const [experience, setExperience] = useState("Beginner");
  const [learningStyle, setLearningStyle] = useState("Project Based");;
  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
    }
  }, [location.state])

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
.catch(err => console.error(err));

axios.get("http://127.0.0.1:8000/roadmap/user", {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => {
  if (res.data && res.data.roadmap) {
    setRoadmapData(res.data.roadmap);
    setShowRoadmap(true);
  }
})
.catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (location.state?.role && !showRoadmap && role.trim() !== "") {
      handleGenerate();
    }
  }, [location.state, role]);

  const handleStatusChange = (stageId, skillName, newStatus) => {
    const newData = roadmapData.map(stage => {
      if (stage.id === stageId) {
        const updatedSkills = stage.skills.map(skill =>
          skill.name === skillName ? { ...skill, status: newStatus } : skill
        );
        const completed = updatedSkills.filter(s => s.status === "Completed").length;
        const stageProgress = Math.round((completed / updatedSkills.length) * 100);
        return { ...stage, skills: updatedSkills, progress: stageProgress };
      }
      return stage;
    });

    setRoadmapData(newData);
    const token = localStorage.getItem("token");

    axios.post(
      "http://127.0.0.1:8000/roadmap/save",
      { roadmap: newData },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const parseLearningTime = (timeStr) => {
    if (!timeStr) return 0;

    const lower = timeStr.toLowerCase();

    // range like 2-3h
    if (lower.includes("-")) {
      const parts = lower.split("-");
      const first = parseFloat(parts[0]);
      const second = parseFloat(parts[1]);
      if (!isNaN(first) && !isNaN(second)) {
        return (first + second) / 2;
      }
    }

    // minutes
    if (lower.includes("min")) {
      const num = parseFloat(lower);
      return num / 60;
    }

    // days
    if (lower.includes("day")) {
      const num = parseFloat(lower);
      return num * 6; // assume 6h/day
    }

    // hours
    const num = parseFloat(lower);
    return isNaN(num) ? 0 : num;
  };

  const calculateWeeks = (concepts) => {
    const totalHours = concepts.reduce((sum, c) => {
      return sum + parseLearningTime(c.learning_time);
    }, 0);

    const weeks = Math.ceil(totalHours / 10);
    return `${weeks} Weeks`;
  };

  const handleGenerate = async () => {

    if (!role.trim()) {
      alert("Please enter a target role");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/roadmap", {
        topic: role,
        experience_level: experience,
        learning_style: learningStyle,
        limit: 5
      });

      const data = res.data;

      const formatted = [
        {
          id: 1,
          title: "Foundations",
          duration: calculateWeeks(data.basic),
          progress: 0,
          skills: data.basic.map(c => ({
            name: c.title,
            difficulty: c.toughness,
            time: c.learning_time,
            status: "Not Started",
            url: c.learning_link
          }))
        },
        {
          id: 2,
          title: "Core Skills",
          duration: calculateWeeks(data.core),
          progress: 0,
          skills: data.core.map(c => ({
            name: c.title,
            difficulty: c.toughness,
            time: c.learning_time,
            status: "Not Started",
            url: c.learning_link
          }))
        },
        {
          id: 3,
          title: "Advanced Topics",
          duration: calculateWeeks(data.advanced),
          progress: 0,
          skills: data.advanced.map(c => ({
            name: c.title,
            difficulty: c.toughness,
            time: c.learning_time,
            status: "Not Started",
            url: c.learning_link
          }))
        }
      ];

     setRoadmapData(formatted);
     setShowRoadmap(true);

    const token = localStorage.getItem("token");

await axios.post(
  "http://127.0.0.1:8000/roadmap/save",
  { roadmap: formatted },
  { headers: { Authorization: `Bearer ${token}` } }
);

const userRes = await axios.get("http://127.0.0.1:8000/me", {
  headers: { Authorization: `Bearer ${token}` }
});
setUser(userRes.data);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const downloadRoadmap = async () => {
    if (!roadmapRef.current) return;
    const canvas = await html2canvas(roadmapRef.current, {
      backgroundColor: "#0a0a0c",
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const fileRole = role ? role.replace(/\s+/g, "_") : "Career";
    pdf.save(`${fileRole}_Roadmap.pdf`);
  };

  const normalizedRole = role.trim();
  const requiredSkills = ROLE_SKILLS[normalizedRole] || [];
  const skillGaps = user?.skills
    ? requiredSkills.filter(skill => !user.skills.includes(skill))
    : [];

  const allSkills = roadmapData.flatMap(s => s.skills);
  const totalCompleted = allSkills.filter(s => s.status === "Completed").length;
  const globalProgress = allSkills.length > 0 ? Math.round((totalCompleted / allSkills.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex font-sans">
      <Sidebar />

      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
                <Map className="text-blue-400" /> Skill Path Architect
              </h1>
              <p className="text-slate-400 mt-2">AI-powered career mapping for the next generation of engineers.</p>
            </div>

            {showRoadmap && (
              <button
                onClick={downloadRoadmap}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 transition-all text-sm font-semibold shadow-xl"
              >
                <Download size={16} /> Download Path
              </button>
            )}
          </header>

          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Role</label>
                <input
                  type="text"
                  placeholder="Enter your target role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Experience</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Domain Focus</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option>Project Based</option>
                  <option>Theory First</option>
                  <option>Balanced</option>
                  <option>Fast Track</option>
                  <option>Deep Dive</option>
                </select>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all h-[42px]"
              >
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={18} /> Generate Roadmap</>}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8" ref={roadmapRef}>
              <AnimatePresence mode="wait">
                {showRoadmap ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {roadmapData.map((stage, index) => (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        index={index}
                        highlightSkill={highlightSkill}
                        onStatusChange={handleStatusChange}
                      />
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400" /> AI Insights
                  </h3>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className={`p-2 rounded-lg transition-all ${showInsights ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    <Info size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {showInsights && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-3"
                      >
                        {(!user?.skills || user.skills.length === 0) ? (
                          <InsightItem
                            title="Resume Needed"
                            desc="Upload your resume in the Resume Analyzer to unlock personalized insights."
                          />
                        ) : (
                          <>
                            <InsightItem
                              title="Skill Gaps"
                              desc={skillGaps.length ? `You should focus on learning: ${skillGaps.slice(0, 3).join(", ")}.` : "Your core skillset already aligns well with this role."}
                            />
                            <InsightItem
                              title="Job Readiness"
                              desc={user.market_readiness === "High" ? "You appear ready for interviews." : user.market_readiness === "Medium" ? "Partially ready. Close a few gaps." : "Significant preparation needed."}
                            />
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-400">Total Completion</span>
                      <span className="text-sm font-bold text-blue-400">{showRoadmap ? globalProgress : (user?.skills ? Math.min(100, user.skills.length * 10) : 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${showRoadmap ? globalProgress : (user?.skills ? Math.min(100, user.skills.length * 10) : 0)}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <StatBox label="Streak" value="12 Days" icon={<TrendingUp size={14} />} color="text-orange-400" />
                    <StatBox
                      label="Skills"
                      value={`${totalCompleted}/${allSkills.length}`}
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

const StageCard = ({ stage, index, onStatusChange, highlightSkill }) => {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 border-l-2 border-slate-800"
    >
      <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-slate-900 transition-colors ${stage.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`} />

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
                  className={`h-full transition-colors ${stage.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
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
                  <SkillCard
                    key={idx}
                    skill={skill}
                    highlight={highlightSkill === skill.name}
                    onStatusUpdate={(val) => onStatusChange(stage.id, skill.name, val)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SkillCard = ({ skill, onStatusUpdate, highlight }) => (<motion.div
  whileHover={{ y: -2 }}
  className={`p-4 rounded-xl border group transition-colors
${highlight
      ? "bg-red-500/10 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60"
    }`}
>
  <div className="flex justify-between items-start mb-4">
    <h4 className="font-semibold text-slate-200 text-sm leading-tight">{skill.name}</h4>
    <StatusBadge
      status={skill.status}
      onChange={onStatusUpdate}
    />
  </div>
  <div className="flex items-center justify-between text-[10px] text-slate-400">

    <span className={`px-2 py-0.5 rounded border uppercase font-bold ${getDiffColor(skill.difficulty)}`}>
      {skill.difficulty}
    </span>

    <span className="flex items-center gap-1">
      <Clock size={10} /> {skill.time}
    </span>

    {skill.url && (
      <a
        href={skill.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 font-bold hover:underline flex items-center gap-1"
      >
        Docs <ExternalLink size={10} />
      </a>
    )}

  </div>
</motion.div>
);

const StatusBadge = ({ status, onChange }) => {
  const getStatusStyles = (currentStatus) => {
    switch (currentStatus) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-700/30 text-slate-400 border-slate-700/50";
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none cursor-pointer text-[9px] uppercase font-black px-2 py-1 rounded-lg border outline-none transition-all ${getStatusStyles(status)}`}
      style={{ textAlignLast: 'center' }}
    >
      <option value="Not Started" className="bg-[#0a0a0c]">Not Started</option>
      <option value="In Progress" className="bg-[#0a0a0c]">In Progress</option>
      <option value="Completed" className="bg-[#0a0a0c]">Completed</option>
    </select>
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