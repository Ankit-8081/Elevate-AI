import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../components/sidebar";
import Header from "../components/header";

import { 
  Send, Mic, Play, CheckCircle2, AlertCircle, Lightbulb, 
  ChevronRight, Timer, BrainCircuit, RotateCcw, LayoutDashboard,
  BarChart3, Settings, LogOut, User, Search, Bell
} from 'lucide-react';

// --- UI COMPONENTS ---

const GlassCard = ({ children, className = "", hover = false }) => (
  <motion.div 
    whileHover={hover ? { translateY: -5, borderColor: "rgba(34, 211, 238, 0.4)" } : {}}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}
  >
    {children}
  </motion.div>
);

const NeonButton = ({ children, onClick, variant = "primary", className = "" }) => {
  const styles = variant === "primary"
    ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${styles} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// --- ANIMATION VARIANTS ---

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};


export default function InterviewApp() {
  const [view, setView] = useState('setup');

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans overflow-hidden flex">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        <Header />

        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {view === 'setup' && <SetupScreen key="setup" onStart={() => setView('interview')} />}
              {view === 'interview' && <InterviewScreen key="chat" onFinish={() => setView('feedback')} />}
              {view === 'feedback' && <FeedbackScreen key="feedback" onReset={() => setView('setup')} />}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SCREENS ---

function SetupScreen({ onStart }) {
  const [difficulty, setDifficulty] = useState('Medium');

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Initialize Simulator</h2>
        <p className="text-slate-400 mt-2">Our AI agent will conduct a realistic interview based on your preferences.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="md:col-span-2">
          <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold mb-4 block">Target Job Title</label>
          <input 
            type="text" 
            placeholder="e.g. Senior Frontend Developer" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-cyan-500 transition-colors text-lg"
          />
        </GlassCard>

        <GlassCard>
          <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 block">Interview Focus</label>
          <div className="grid grid-cols-2 gap-3">
            {['Technical', 'HR/Behavioral', 'System Design', 'Live Coding'].map(type => (
              <button key={type} className="py-3 px-2 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-sm">
                {type}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 block">Difficulty Level</label>
          <div className="flex bg-black/20 p-1 rounded-xl gap-1">
            {['Easy', 'Medium', 'Hard'].map(lvl => (
              <button 
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${difficulty === lvl ? 'bg-cyan-500 text-black font-bold' : 'text-slate-500 hover:text-white'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-center pt-6">
        <NeonButton onClick={onStart} className="w-full max-w-sm py-2 text-lg">
          Begin Session <ChevronRight size={20} />
        </NeonButton>
      </div>
    </motion.div>
  );
}

function InterviewScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your interviewer today. To get started, could you describe your experience with React and why you prefer it over other frameworks?" }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setIsThinking(true);

    // Simulated AI Response Delay
    setTimeout(() => {
      setIsThinking(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "That's a solid perspective. Speaking of React, how do you handle state management in large-scale applications? Specifically, when would you choose Context API over Redux?" 
      }]);
    }, 2000);
  };

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="flex flex-col h-[80vh]">
      {/* Session HUD */}
      <div className="flex justify-between items-center mb-6 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Timer size={18} />
            <span className="font-mono font-bold tracking-tighter text-lg">18:42</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            Question <span className="text-white ml-1">02 / 05</span>
          </div>
        </div>
        <button onClick={onFinish} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">End Session</button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`p-4 rounded-2xl max-w-[80%] leading-relaxed shadow-lg ${
              msg.role === 'ai' 
              ? 'bg-white/5 border border-white/10 rounded-tl-none text-slate-200' 
              : 'bg-cyan-500/10 border border-cyan-500/20 rounded-tr-none text-cyan-50'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <motion.div 
                    key={d}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <GlassCard className="!p-3 flex gap-4 items-center border-white/20">
        <button className="p-3 text-slate-400 hover:text-cyan-400 transition-colors">
          <Mic size={22} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your response here..."
          className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-600"
        />
        <button 
          onClick={handleSend}
          className="p-3 bg-cyan-500 rounded-xl text-black hover:bg-cyan-400 transition-colors"
        >
          <Send size={20} />
        </button>
      </GlassCard>
    </motion.div>
  );
}

function FeedbackScreen({ onReset }) {
  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold">Session Complete</h2>
        <p className="text-slate-400 mt-2">Here is your detailed AI-generated performance report.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center py-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 * 0.15 }} // 85%
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-cyan-500" 
                />
             </svg>
             <span className="absolute text-3xl font-bold font-mono">85%</span>
          </div>
          <p className="mt-4 font-bold uppercase tracking-widest text-slate-500 text-xs">Aptitude Score</p>
        </GlassCard>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <GlassCard className="!p-4 border-green-500/20 bg-green-500/5 flex items-start gap-4">
              <div className="p-2 bg-green-500 text-black rounded-lg"><CheckCircle2 size={18}/></div>
              <div>
                <h4 className="font-bold text-green-400 text-sm">Key Strength</h4>
                <p className="text-sm text-slate-300 mt-1">Excellent grasp of architectural patterns and state management principles.</p>
              </div>
            </GlassCard>

            <GlassCard className="!p-4 border-red-500/20 bg-red-500/5 flex items-start gap-4">
              <div className="p-2 bg-red-500 text-black rounded-lg"><AlertCircle size={18}/></div>
              <div>
                <h4 className="font-bold text-red-400 text-sm">Improvement Area</h4>
                <p className="text-sm text-slate-300 mt-1">Focus on explaining the "Why" behind optimization techniques like memoization.</p>
              </div>
            </GlassCard>

            <GlassCard className="!p-4 border-cyan-500/20 bg-cyan-500/5 flex items-start gap-4">
              <div className="p-2 bg-cyan-500 text-black rounded-lg"><Lightbulb size={18}/></div>
              <div>
                <h4 className="font-bold text-cyan-400 text-sm">Expert Tip</h4>
                <p className="text-sm text-slate-300 mt-1">Practice explaining System Design concepts using the STAR method.</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <NeonButton onClick={onReset} className="px-12">
          Retake Interview <RotateCcw size={18} />
        </NeonButton>
        <NeonButton onClick={onReset} variant="secondary" className="px-12">
          Back to Dashboard
        </NeonButton>
      </div>
    </motion.div>
  );
}