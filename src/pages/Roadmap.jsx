import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Zap, Brain, CheckCircle2, Sparkles, TrendingUp,
  ChevronDown, BookOpen, Clock, Download, ExternalLink, Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import Sidebar from '../components/sidebar';

const API = import.meta.env.VITE_API_BASE_URL;
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
  const [role, setRole] = useState("");
  const [roadmapData, setRoadmapData] = useState([]);
  const [user, setUser] = useState(null);
  const roadmapRef = useRef(null);
  const [streak, setStreak] = useState(0);
  const highlightSkill = location.state?.highlightSkill;
  const openStageId = highlightSkill
  ? roadmapData.find(stage =>
      stage.skills?.some(s => s.name === highlightSkill)
    )?.id
  : null;
  const [experience, setExperience] = useState("Beginner");
  const [learningStyle, setLearningStyle] = useState("Project Based");;
  useEffect(() => {

  const token = localStorage.getItem("token");

  if (location.state?.trigger === "resume") {

    axios.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {

      if (res.data.target_role) {
        setRole(res.data.target_role);
      }

    });

  }

}, [location.state]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }


 axios.get(`${API}/me`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => {
  setUser(res.data);
  setStreak(res.data.learning_streak || 0);
})
.catch(err => console.error(err));

axios.get(`${API}/roadmap/user`, {
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

  if (
    location.state?.trigger === "resume" &&
    role.trim() !== "" &&
    !showRoadmap
  ) {
    handleGenerate();
  }

}, [role]);

const handleStatusChange = (stageId, skillName, newStatus) => {

  let wasCompleted = false;

  const newData = roadmapData.map(stage => {
    if (stage.id === stageId) {
      const updatedSkills = stage.skills.map(skill => {

        if (skill.name === skillName) {
          if (skill.status === "Completed") {
            wasCompleted = true;
          }

          return { ...skill, status: newStatus };
        }

        return skill;
      });

      const completed = updatedSkills.filter(s => s.status === "Completed").length;
      const stageProgress = Math.round((completed / updatedSkills.length) * 100);

      return { ...stage, skills: updatedSkills, progress: stageProgress };
    }
    return stage;
  });

  setRoadmapData(newData);

  const token = localStorage.getItem("token");
  if (!token) return;

  axios.post(`${API}/roadmap/save`,
    { roadmap: newData },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!wasCompleted && newStatus === "Completed") {
    axios.post(`${API}/streak/update`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStreak(res.data.streak);
    })
    .catch(err => console.error(err));
  }
};

  const parseLearningTime = (timeStr) => {
    if (!timeStr) return 0;

    const lower = timeStr.toLowerCase();

    if (lower.includes("-")) {
      const parts = lower.split("-");
      const first = parseFloat(parts[0]);
      const second = parseFloat(parts[1]);
      if (!isNaN(first) && !isNaN(second)) {
        return (first + second) / 2;
      }
    }

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
const formatRoadmapText = () => {
  let content = `${role.toUpperCase()} ROADMAP\n\n`;

  roadmapData.forEach((stage, i) => {
    content += `STAGE ${i + 1}: ${stage.title}\n`;
    content += `Duration: ${stage.duration}\n\n`;

    stage.skills.forEach((skill, idx) => {
      content += `${idx + 1}. ${skill.name}\n`;
      content += `   Time: ${skill.time}\n`;
      content += `   Status: ${skill.status}\n`;
      content += `   Difficulty: ${skill.difficulty}\n`;
      if (skill.url) content += `   Link: ${skill.url}\n`;
      content += `\n`;
    });

    content += `--------------------------------------\n\n`;
  });

  return content;
};
  const handleGenerate = async () => {

    if (!role.trim()) {
      alert("Please enter a target role");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/roadmap`, {
        topic: role,
        experience_level: experience,
        learning_style: learningStyle,
        upper_limit: 8  });

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
            url: c.learning_link || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`
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
            url: c.learning_link || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`
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
            url: c.learning_link || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`
          }))
        }
      ];

     setRoadmapData(formatted);
     setShowRoadmap(true);


    const token = localStorage.getItem("token");

await 
axios.post(`${API}/roadmap/save`,
  { roadmap: formatted },
  { headers: { Authorization: `Bearer ${token}` } }
);

await axios.post(`${API}/roadmap/reset`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

setStreak(0); 

const userRes = await axios.get(`${API}/me`, {
  headers: { Authorization: `Bearer ${token}` }
});
setUser(userRes.data);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

const downloadRoadmap = () => {
  const pdf = new jsPDF();
  let y = 20;

  // 🖤 BACKGROUND + HEADER
  const drawBackground = () => {
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, 210, 297, "F");

    // HEADER
    pdf.setFillColor(30, 41, 59);
    pdf.rect(0, 0, 210, 25, "F");

    pdf.setTextColor(96, 165, 250);
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(`${(role || "Career").toUpperCase()} ROADMAP`, 10, 15);
  };

  drawBackground();
  y = 35;

  roadmapData.forEach((stage, i) => {
    // 🧠 PAGE BREAK
    if (y > 260) {
      pdf.addPage();
      drawBackground();
      y = 30;
    }

    // 🧱 STAGE CARD
    pdf.setFillColor(20, 20, 30);
    pdf.roundedRect(10, y, 190, 20, 4, 4, "F");

    const cleanTitle =
      stage.title?.split(":")[1]?.trim() || stage.title;

    pdf.setTextColor(96, 165, 250);
    pdf.setFontSize(10);
    pdf.text(`STAGE ${i + 1}`, 14, y + 7);

    pdf.setTextColor(255);
    pdf.setFontSize(12);
    pdf.text(cleanTitle, 14, y + 14);

    y += 24;

    // ⏱ DURATION
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(9);
    pdf.text(`Duration: ${stage.duration}`, 14, y);

    y += 10;

    stage.skills.forEach((skill, idx) => {
      if (y > 260) {
        pdf.addPage();
        drawBackground();
        y = 30;
      }

      // 🧩 SKILL CARD
      pdf.setFillColor(30, 30, 45);
      pdf.roundedRect(12, y - 4, 186, 34, 3, 3, "F");

      // 🔢 TITLE
      pdf.setTextColor(255);
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(`${idx + 1}. ${skill.name}`, 16, y + 2);

      y += 10;

      // 🎨 DIFFICULTY BADGE
      let color = [34, 197, 94]; // easy
      if (skill.difficulty?.toLowerCase() === "medium")
        color = [234, 179, 8];
      if (skill.difficulty?.toLowerCase() === "hard")
        color = [239, 68, 68];

      pdf.setFillColor(...color);
      pdf.roundedRect(150, y - 6, 35, 7, 2, 2, "F");

      pdf.setTextColor(0);
      pdf.setFontSize(8);
      pdf.text(skill.difficulty || "Easy", 152, y - 1);

      // 🕒 TIME BADGE (NO EMOJI)
      pdf.setFillColor(40, 40, 60);
      pdf.roundedRect(16, y - 4, 45, 8, 2, 2, "F");

      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(8);
      pdf.text(`Time: ${skill.time}`, 18, y + 1);

      y += 12;

      // 🔗 LINK CARD
      if (skill.url) {
        pdf.setFillColor(20, 20, 30);
        pdf.roundedRect(16, y - 2, 170, 12, 2, 2, "F");

        pdf.setTextColor(96, 165, 250);
        pdf.setFontSize(7);

        const link = pdf.splitTextToSize(skill.url, 160);
        pdf.text(link, 18, y + 4);

        y += link.length * 4 + 6;
      } else {
        y += 4;
      }

      y += 6; // spacing between skills
    });

    // divider
    pdf.setDrawColor(50);
    pdf.line(10, y, 200, y);

    y += 12;
  });

  pdf.save(`${(role || "Career")}_Dark_Roadmap.pdf`);
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
  openStageId={openStageId}
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
                    <StatBox
  label="Streak"
  value={`${streak} Days`}
  icon={<TrendingUp size={14} />}
  color="text-orange-400"
/>
                    <StatBox
                      label="Modules Completed"
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

const StageCard = ({ stage, index, onStatusChange, highlightSkill, openStageId }) => {
  const [expanded, setExpanded] = useState(openStageId === stage.id);

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

const SkillCard = ({ skill, onStatusUpdate, highlight }) => {

  const skillRef = useRef(null);

  useEffect(() => {
  if (highlight && skillRef.current) {
    setTimeout(() => {
      skillRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 300);
  }
}, [highlight]);

  return (
    <motion.div
      ref={skillRef}
      whileHover={{ y: -2 }}
      className={`p-4 rounded-xl border group transition-colors
      ${
        highlight
          ? "bg-red-500/10 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
          : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-slate-200 text-sm leading-tight">
          {skill.name}
        </h4>

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
  style={{
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: 700,
    marginTop: "4px"
  }}
>
  Docs <ExternalLink size={10} />
</a>
       )}

      </div>
    </motion.div>
  );
};

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