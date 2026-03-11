import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Code2, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  Send, 
  Zap, 
  ChevronDown,
  Save,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/header'
import Sidebar from '../components/sidebar';

const ResumeBuilder = () => {
  const [latexCode, setLatexCode] = useState(`\\documentclass{article}\n\\begin{document}\n\\section{Experience}\n\\textbf{Software Engineer} @ TechCorp \\hfill 2022-Present\n\\begin{itemize}\n  \\item Optimized React components for 40% faster load times.\n  \\item Led a team of 5 developers for the new AI dashboard.\n\\end{itemize}\n\\end{document}`);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I can help you polish your resume. Try asking me to "quantify my achievements" or "improve my summary".' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => setIsCompiling(false), 800);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I've analyzed your bullet points. Try replacing 'Led a team' with 'Orchestrated a cross-functional team of 5 to deliver a high-scale AI module, reducing latency by 15%.'" 
      }]);
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#0a0a0c] text-slate-200 flex font-sans selection:bg-indigo-500/30 overflow-hidden">

  <Sidebar/>

<main
  style={{ marginLeft: "var(--sidebar-width)" }}
className="flex-1 flex flex-col min-h-0">

    <div className="flex flex-1 min-h-0 overflow-hidden">
        <section className="w-[35%] bg-[#0f0f12] border-r border-white/5 flex flex-col relative">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
              <FileText size={12} /> Live Preview
            </span>
            <div className="flex items-center gap-2 bg-white/5 rounded-md p-1">
              <button className="p-1 hover:bg-white/10 rounded transition-colors"><ZoomOut size={14} /></button>
              <span className="text-[10px] px-1 font-mono">100%</span>
              <button className="p-1 hover:bg-white/10 rounded transition-colors"><ZoomIn size={14} /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-900/50 custom-scrollbar">
            <motion.div 
              layout
              className="w-full max-w-[420px] aspect-[1/1.41] bg-white rounded-sm shadow-2xl relative overflow-hidden origin-top"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-10 text-black font-serif">
                <div className="h-4 w-3/4 bg-slate-200 mb-2" />
                <div className="h-2 w-1/4 bg-slate-100 mb-8" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-1/3 bg-slate-200" />
                      <div className="h-2 w-full bg-slate-100" />
                      <div className="h-2 w-5/6 bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
              {isCompiling && (
                <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="w-[40%] bg-[#0a0a0c] flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-4">
               <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                <Code2 size={12} /> main.tex
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer hover:text-white transition-colors">
                Template: Modern CV <ChevronDown size={10} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/5 rounded text-slate-400" title="Reset">
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={handleCompile}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <Play size={12} fill="currentColor" /> Compile
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative font-mono text-sm group overflow-y-auto custom-scrollbar">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-black/40 border-r border-white/5 flex flex-col items-center pt-4 text-slate-600 text-[10px] select-none">
              {[...Array(25)].map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
            </div>
            <textarea
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="w-full h-full pl-14 pr-4 pt-4 bg-transparent outline-none resize-none text-indigo-100/80 leading-6 caret-indigo-500"
              spellCheck="false"
            />
          </div>
        </section>

        <section className="w-[25%] bg-[#0f0f12] border-l border-white/5 flex flex-col">
          <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 flex items-center gap-2">
              <Sparkles size={12} /> AI Career Copilot
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20 space-y-3">
            <div className="flex flex-wrap gap-2">
              {['Add Metrics', 'Rewrite Summary', 'Fix Verbs'].map((label) => (
                <button 
                  key={label}
                  className="text-[10px] px-2 py-1 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 border border-white/10 rounded-full transition-all flex items-center gap-1"
                >
                  <Zap size={10} /> {label}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to improve..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </section>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;