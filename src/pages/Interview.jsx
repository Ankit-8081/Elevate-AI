import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  MessageSquare, 
  Mic, 
  MicOff, 
  VideoOff, 
  Send, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Lightbulb,
  MoreVertical,
  RotateCcw
} from 'lucide-react';

import Sidebar from '../components/sidebar';
import Header from '../components/header';

const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: "bg-white/10 text-slate-300",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl ${className}`}>
    {children}
  </div>
);

const WebcamPreview = () => {
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  useEffect(() => {
    let stream = null;
    if (isCameraOn || isMicOn) {
      navigator.mediaDevices.getUserMedia({ video: isCameraOn, audio: isMicOn })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Media error:", err));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, isMicOn]);

  return (
    <GlassCard className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
      {isCameraOn ? (
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <VideoOff size={48} strokeWidth={1.5} />
          <span className="text-sm">Camera is off</span>
        </div>
      )}
      
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <motion.div 
          animate={{ opacity: isCameraOn ? [1, 0.5, 1] : 0.2 }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-red-500' : 'bg-slate-500'}`} 
        />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white">
          {isCameraOn ? 'Live Recording' : 'Paused'}
        </span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
        <button 
          onClick={() => setIsCameraOn(!isCameraOn)} 
          className={`p-3 rounded-full transition-all ${isCameraOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
        >
          {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button 
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-3 rounded-full transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
      </div>
    </GlassCard>
  );
};


export default function InterviewSimulator() {
  const [mode, setMode] = useState('video');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answer, setAnswer] = useState("");

 return (
<div className="flex min-h-screen bg-[#050b14] text-slate-200 font-sans">

  <Sidebar />

  <main
    style={{ marginLeft: "var(--sidebar-width)" }}
    className="flex-1 flex flex-col"
  >
    

    <div className="p-8 flex-1 overflow-y-auto">
     
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">AI Interview Simulator</h1>
          <p className="text-slate-400 text-sm">Real-time technical assessment environment.</p>
        </div>
        
        <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5">
          {['video', 'text'].map((m) => (
            <button 
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${mode === m ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {m === 'video' ? <Video size={16} /> : <MessageSquare size={16} />} {m} Mode
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'video' ? (
          <motion.div 
            key="video-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-12 gap-6"
          >
            
            <div className="col-span-4 flex flex-col gap-6">
              <WebcamPreview />
              <GlassCard className="p-5 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium text-sm">
                  <Lightbulb size={16} className="text-amber-400" />
                  AI Coaching
                </div>
                <ul className="space-y-4 text-xs text-slate-400 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-mono">01.</span>
                    Explain the "Virtual DOM" concept if you mention reconciliation.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-mono">02.</span>
                    Try to speak clearly; your current pace is slightly fast.
                  </li>
                </ul>
              </GlassCard>
            </div>

            <div className="col-span-5 flex flex-col gap-6">
              <GlassCard className="p-6 relative">
                <div className="absolute top-6 right-6">
                  <Badge variant="warning">Medium</Badge>
                </div>
                <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-2 block">Question 03/08</span>
                <h2 className="text-lg font-medium text-white leading-snug pr-16">
                  "How would you optimize a React application experiencing performance bottlenecks in a large list?"
                </h2>
                <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500 border-t border-white/5 pt-4">
                   <span className="flex items-center gap-1"><Clock size={12} /> 01:45</span>
                   <span className="flex items-center gap-1"><RotateCcw size={12} /> 1 Retake Left</span>
                </div>
              </GlassCard>

              <GlassCard className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Transcribed Answer</span>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500/80">Listening...</span>
                  </div>
                </div>
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex-1 bg-transparent p-6 outline-none resize-none text-sm leading-relaxed text-slate-300 placeholder:text-slate-600"
                  placeholder="Your speech will appear here, or you can type to refine..."
                />
                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Sparkles size={16} className="text-emerald-400" />
                      </motion.div>
                      <span className="text-xs font-medium text-emerald-400">Analyzing response...</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAnalyzing(true)}
                      className="w-full py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      Finish & Submit <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="col-span-3">
               <GlassCard className="h-full flex flex-col">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scratchpad</span>
                    <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
                  </div>
                  <textarea 
                    className="flex-1 bg-transparent p-5 outline-none resize-none text-xs leading-relaxed text-slate-400 placeholder:text-slate-600"
                    placeholder="Sketch out your logic here..."
                  />
               </GlassCard>
            </div>
          </motion.div>
        ) : (
     
          <motion.div 
            key="text-mode"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-12 gap-6"
          >
            <div className="col-span-8 flex flex-col gap-4 overflow-hidden">
               <GlassCard className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="bg-white/[0.05] p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
                      <p className="text-sm leading-relaxed text-slate-300">
                        Excellent breakdown. To follow up, how would you handle state synchronization across multiple browser tabs?
                      </p>
                    </div>
                  </div>
               </GlassCard>

               <div className="relative">
                  <textarea 
                    className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-6 pr-20 outline-none focus:border-emerald-500/50 transition-colors text-sm text-slate-300 placeholder:text-slate-600 resize-none"
                    placeholder="Type your technical response..."
                  />
                  <button className="absolute bottom-6 right-6 p-3 bg-white text-black rounded-xl hover:bg-slate-200 transition-all">
                    <Send size={18} />
                  </button>
               </div>
            </div>

            <div className="col-span-4 space-y-6">
              <GlassCard className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Competency Map</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>Technical Depth</span>
                      <span className="text-emerald-400">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>Communication</span>
                      <span className="text-cyan-400">72%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-cyan-400" />
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {['BroadcastChannel', 'LocalStorage', 'SharedWorker', 'PubSub'].map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </main>
    </div>
  );
}