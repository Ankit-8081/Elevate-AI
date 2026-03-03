import Sidebar from "../components/sidebar";
import Header from "../components/header";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Briefcase, Mic2, Search, Bell, User, Send, Mic, Play, ChevronRight, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';

// --- Reusable Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const NeonButton = ({ children, onClick, variant = "primary" }) => {
  const styles = variant === "primary" 
    ? "bg-gradient-to-r from-neonCyan to-neonViolet text-white shadow-neon"
    : "border border-white/20 text-white hover:bg-white/5";
    
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all ${styles}`}
    >
      {children}
    </motion.button>
  );
};

// --- Main App Component ---

export default function InterviewApp() {
  const [activeTab, setActiveTab] = useState('Simulator');
  const [view, setView] = useState('setup'); // setup, interview, feedback

  return (
    <div className="flex h-screen bg-darkBg text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-neonCyan/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-neonViolet/10 blur-[120px] rounded-full" />

        {/* Header */}
       <Header />
        {/* Dynamic Screens */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          <AnimatePresence mode="wait">
            {view === 'setup' && <SetupScreen key="setup" onStart={() => setView('interview')} />}
            {view === 'interview' && <InterviewScreen key="chat" onFinish={() => setView('feedback')} />}
            {view === 'feedback' && <FeedbackScreen key="feedback" onReset={() => setView('setup')} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- SCREEN 1: Setup ---

function SetupScreen({ onStart }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-2">Configure Your Session</h2>
      <p className="text-slate-400 mb-8">AI will tailor questions based on your specific role and level.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="col-span-2">
          <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Target Role</label>
          <input 
            type="text" 
            placeholder="e.g. Senior Frontend Developer" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neonCyan focus:ring-1 focus:ring-neonCyan transition-all outline-none"
          />
        </GlassCard>

        <GlassCard>
          <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Interview Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['Technical', 'Behavioral', 'System Design', 'HR'].map(t => (
              <button key={t} className="px-4 py-2 rounded-lg border border-white/10 hover:border-neonCyan/50 bg-white/5 text-sm transition-colors">{t}</button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Experience Level</label>
          <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none">
            <option>Fresher (0-1 yr)</option>
            <option>Junior (1-3 yrs)</option>
            <option>Senior (3-7 yrs)</option>
            <option>Lead (7+ yrs)</option>
          </select>
        </GlassCard>
      </div>

      <div className="mt-10 flex justify-center">
        <NeonButton onClick={onStart}>
          <span className="flex items-center gap-2">Initialize AI Simulator <Play size={18} /></span>
        </NeonButton>
      </div>
    </motion.div>
  );
}

// --- SCREEN 2: Live Interview ---

function InterviewScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Welcome to your Frontend Engineer interview. Let's start with a foundational concept. Can you explain how React's Virtual DOM works?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput("");
    
    // Fake AI "Thinking"
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "Excellent explanation. Following up on that, how does the reconciliation algorithm handle list items without unique keys?" }]);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full flex flex-col max-w-3xl mx-auto"
    >
      {/* HUD Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono">
            QUESTION <span className="text-neonCyan">02 / 05</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            12:44 REMAINING
          </div>
        </div>
        <button onClick={onFinish} className="text-xs text-slate-500 hover:text-white underline">End Session</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'ai' 
              ? 'bg-white/5 border border-white/10 rounded-tl-none' 
              : 'bg-neonViolet/20 border border-neonViolet/30 rounded-tr-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Bar */}
      <GlassCard className="!p-3 flex items-center gap-3">
        <button className="p-3 text-slate-400 hover:text-white transition-colors">
          <Mic size={20} />
        </button>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm" 
          placeholder="Describe your answer in detail..."
        />
        <button 
          onClick={handleSend}
          className="p-3 bg-neonCyan/20 text-neonCyan rounded-xl hover:bg-neonCyan/30 transition-colors"
        >
          <Send size={20} />
        </button>
      </GlassCard>
    </motion.div>
  );
}

// --- SCREEN 3: Feedback ---

function FeedbackScreen({ onReset }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold">Interview Analysis</h2>
        <p className="text-slate-400">Your performance has been evaluated by Lumina AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="text-center flex flex-col items-center justify-center border-neonCyan/30">
          <div className="relative w-24 h-24 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
              <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="283" strokeDashoffset="42" className="text-neonCyan" />
            </svg>
            <span className="absolute text-2xl font-bold">85%</span>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Overall Score</p>
        </GlassCard>

        <div className="md:col-span-2 space-y-4">
          <GlassCard className="!py-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><CheckCircle2 /></div>
            <div>
              <h4 className="font-bold text-sm">Strengths</h4>
              <p className="text-xs text-slate-400 italic">Core React concepts, State Management, Problem Solving</p>
            </div>
          </GlassCard>
          <GlassCard className="!py-4 flex items-center gap-4 border-red-500/20">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><AlertCircle /></div>
            <div>
              <h4 className="font-bold text-sm">Weaknesses</h4>
              <p className="text-xs text-slate-400 italic">Advanced Performance Optimization, Bundle Size Analysis</p>
            </div>
          </GlassCard>
          <GlassCard className="!py-4 flex items-center gap-4 border-neonCyan/20">
            <div className="p-3 bg-neonCyan/10 text-neonCyan rounded-lg"><Lightbulb /></div>
            <div>
              <h4 className="font-bold text-sm">Suggestions</h4>
              <p className="text-xs text-slate-400 italic">Review useMemo and useCallback hook implementations.</p>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={onReset} className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-medium border border-white/10">Back to Dashboard</button>
        <NeonButton onClick={onReset}>Try Another Session</NeonButton>
      </div>
    </motion.div>
  );
}