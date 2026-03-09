import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Zap, Brain, CheckCircle2, Sparkles, TrendingUp, 
  ChevronDown, BookOpen, Clock, BarChart3, Target, Award 
} from 'lucide-react';
import Sidebar from '../components/sidebar';

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

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowRoadmap(true);
    }, 1500);
  };

 return (
  <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex font-sans">

    <Sidebar />

    <main
      style={{ marginLeft: "var(--sidebar-width)" }}
      className="flex-1 flex flex-col overflow-y-auto"
    >
  
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
            <Map className="text-blue-400" /> Skill Path Architect
          </h1>
          <p className="text-slate-400 mt-2">AI-powered career mapping for the next generation of engineers.</p>
        </header>

     
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="col-span-1 md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Role</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Domain Focus</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Generative AI</option>
                <option>Web Systems</option>
                <option>Cloud Infrastructure</option>
              </select>
            </div>
            <button 
              onClick={handleGenerate}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={18}/> Generate Roadmap</>}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8">
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
          </main>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" /> AI Insights
              </h3>
              
              <div className="space-y-4">
                <InsightItem 
                  title="Skill Gaps" 
                  desc="You lack practical experience in PyTorch and Cloud Deployment."
                />
                <InsightItem 
                  title="Job Readiness" 
                  desc="Estimated 4.5 months until ready for Junior AI roles."
                />
                
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Progress Overview</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Total Completion</span>
                    <span className="text-sm font-bold text-blue-400">32%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '32%' }}
                      className="h-full bg-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <StatBox label="Streak" value="12 Days" icon={<TrendingUp size={14}/>} color="text-orange-400" />
                  <StatBox label="Skills" value="8/24" icon={<CheckCircle2 size={14}/>} color="text-green-400" />
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
      
      <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-slate-900 ${stage.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} />
      
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
        <div 
          className="p-5 cursor-pointer flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-blue-500 uppercase">Stage {stage.id}</span>
              <h2 className="text-xl font-bold">{stage.title}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Clock size={14}/> {stage.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={14}/> {stage.skills.length} modules</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 mb-1">Stage Progress</div>
              <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.progress}%` }}
                  className={`h-full ${stage.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                />
              </div>
            </div>
            <ChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} size={20} />
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
    className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 group"
  >
    <div className="flex justify-between items-start mb-3">
      <h4 className="font-semibold text-slate-200">{skill.name}</h4>
      <StatusBadge status={skill.status} />
    </div>
    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-500">
      <span className={`px-2 py-0.5 rounded-md border ${getDiffColor(skill.difficulty)}`}>{skill.difficulty}</span>
      <span className="flex items-center gap-1"><Clock size={10}/> {skill.time}</span>
    </div>
  </motion.div>
);

const InsightItem = ({ title, desc }) => (
  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-800">
    <div className="text-xs font-bold text-blue-400 mb-1">{title}</div>
    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
    <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
    <div className="text-sm font-bold">{value}</div>
    <div className="text-[10px] text-slate-500 uppercase">{label}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    "Completed": "bg-green-500/10 text-green-500 border-green-500/20",
    "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Not Started": "bg-slate-700/30 text-slate-500 border-slate-700/50"
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[status]}`}>{status}</span>;
};

const getDiffColor = (diff) => {
  if (diff === 'Easy') return 'text-emerald-400 border-emerald-900/50 bg-emerald-900/10';
  if (diff === 'Medium') return 'text-amber-400 border-amber-900/50 bg-amber-900/10';
  return 'text-rose-400 border-rose-900/50 bg-rose-900/10';
};

export default SkillRoadmap;