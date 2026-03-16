import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Sparkles,
  Clock,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Briefcase,
  Search
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
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

const formatText = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
};

const GlassCard = ({ children, className = "", style = {} }) => (
  <div 
    style={style}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const WebcamPreview = ({ videoStreamRef, startRecording }) => {
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  useEffect(() => {
    let stream = null;
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: isCameraOn })
        .then(s => {
          stream = s;
          videoStreamRef.current = s;
          if (videoRef.current) videoRef.current.srcObject = s;
          startRecording();
        })
        .catch(err => console.error("Media error:", err));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  return (
    <GlassCard className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
      {isCameraOn ? (
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <VideoOff size={32} strokeWidth={1.5} />
          <span className="text-xs">Camera is off</span>
        </div>
      )}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
        <motion.div
          animate={{ opacity: isCameraOn ? [1, 0.5, 1] : 0.2 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-1.5 h-1.5 rounded-full ${isCameraOn ? 'bg-red-500' : 'bg-slate-500'}`}
        />
        <span className="text-[9px] font-bold uppercase tracking-wider text-white">
          {isCameraOn ? 'Live' : 'Paused'}
        </span>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`p-2 rounded-full transition-all ${isCameraOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
        >
          {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
        </button>
      </div>
    </GlassCard>
  );
};

const AnalysisDisplay = ({ analysis }) => {
  const lines = analysis.split("\n");
  const scoreLine = lines.find(line => line.toLowerCase().includes("score"));
  const otherLines = lines.filter(line => !line.toLowerCase().includes("score"));
  return (
    <div className="space-y-2">
      {scoreLine && (
        <div className="text-xl font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg inline-block">
          {scoreLine}
        </div>
      )}
      <div
        className="text-[11px] text-slate-300 leading-relaxed space-y-1"
        dangerouslySetInnerHTML={{
          __html: formatText(otherLines.join("\n"))
        }}
      />
    </div>
  );
};

export default function InterviewSimulator() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [videoFeedback, setVideoFeedback] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [nextQuestion, setNextQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [nextDifficulty, setNextDifficulty] = useState("");
  const [nextQuestionNumber, setNextQuestionNumber] = useState(null);
  const [interviewFinished, setInterviewFinished] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoStreamRef = useRef(null);

  const startRecording = () => {
    if (!videoStreamRef.current || (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")) return;
    const recorder = new MediaRecorder(videoStreamRef.current);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.current.push(event.data);
    };
    recorder.start();
  };

  const startInterview = async () => {
    if (!targetJob.trim()) return;
    setIsStarting(true);
    try {
      const res = await fetch("http://localhost:8000/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: targetJob,
          difficulty: "Medium"
        })
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setQuestion(data.question);
      setDifficulty(data.difficulty);
      setQuestionNumber(data.question_number);
      startRecording();
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      await new Promise(resolve => {
        mediaRecorderRef.current.onstop = resolve;
        mediaRecorderRef.current.stop();
      });
    }
    const videoBlob = new Blob(recordedChunks.current, { type: "video/webm" });
    recordedChunks.current = [];
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("answer", answer);
    formData.append("video", videoBlob, "recording.webm");
    
    const res = await fetch("http://localhost:8000/interview/submit", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setAnalysis(data.analysis);
    setVideoFeedback(data.video_feedback);
    setNextQuestion(data.next_question);
    setNextQuestionNumber(data.question_number);
    setNextDifficulty(data.difficulty);
    setIsAnalyzing(false);
    setShowNextButton(true);
  };

  const goToNextQuestion = () => {
    if (!nextQuestion) return;
    if (questionNumber >= 5) {
      setInterviewFinished(true);
      return;
    }
    setQuestion(nextQuestion);
    setQuestionNumber(nextQuestionNumber);
    setDifficulty(nextDifficulty);
    setAnswer("");
    setAnalysis(null);
    setVideoFeedback(null);
    setShowNextButton(false);
    startRecording();
  };

  const handleJobKeyPress = (e) => {
    if (e.key === 'Enter') startInterview();
  };

  return (
    <div className="flex h-screen bg-[#050b14] text-slate-200 font-sans overflow-hidden">
      <style>{`
        .custom-dark-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-dark-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
      
      <Sidebar />

      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col min-w-0">
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">AI Interview Simulator</h1>
            <p className="text-slate-400 text-xs">Real-time technical assessment environment.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-12 gap-5 flex-1 min-h-0"
          >
            <div className="col-span-4 flex flex-col gap-5 min-h-0">
              <WebcamPreview videoStreamRef={videoStreamRef} startRecording={startRecording} />
              <GlassCard className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center gap-2 text-slate-300 font-medium text-xs">
                  <Lightbulb size={14} className="text-amber-400" />
                  AI Coaching
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-dark-scrollbar">
                  <ul className="space-y-3 text-[11px] text-slate-400 leading-relaxed">
                    {videoFeedback ? (() => {
                      const sections = [];
                      let current = null;
                      videoFeedback.split("\n").forEach(line => {
                        const trimmed = line.trim();
                        if (!trimmed) return;
                        const boldMatch = trimmed.match(/\*\*(.*?)\*\*/);
                        if (boldMatch) {
                          const title = boldMatch[1];
                          current = { title, points: [] };
                          sections.push(current);
                          const remaining = trimmed.replace(/\*\*(.*?)\*\*/, "").trim();
                          if (remaining) current.points.push(remaining.replace(/^[\*\d\.\s]+/, ""));
                        } else if (current) {
                          current.points.push(trimmed.replace(/^[\*\d\.\s]+/, ""));
                        }
                      });
                      return sections.map((section, i) => (
                        <li key={i} className="space-y-1">
                          <div className="flex gap-2 font-medium text-slate-300">
                            <span className="text-emerald-400 font-mono">{String(i + 1).padStart(2, '0')}.</span>
                            <span className="font-semibold text-white" dangerouslySetInnerHTML={{ __html: formatText(section.title) }} />
                          </div>
                          {section.points.map((p, j) => (
                            <div key={j} className="flex gap-2 ml-6 text-slate-400 items-start">
                              <span className="mt-[7px] w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                              <span dangerouslySetInnerHTML={{ __html: formatText(p) }} />
                            </div>
                          ))}
                        </li>
                      ));
                    })() : (
                      <li className="flex gap-2">
                        <span className="text-emerald-400 font-mono">01.</span>
                        AI will analyze your body language after submission.
                      </li>
                    )}
                  </ul>
                </div>
              </GlassCard>
            </div>

            <div className="col-span-4 flex flex-col gap-5 min-h-0">
              <GlassCard style={{ minHeight: '160px' }} className="p-5 relative flex flex-col justify-center">
                {question ? (
                  <>
                    <div className="absolute top-5 right-5">
                      <Badge variant={difficulty === "Easy" ? "success" : difficulty === "Medium" ? "warning" : "default"}>
                        {difficulty}
                      </Badge>
                    </div>
                    <span className="text-emerald-400 font-mono text-[9px] uppercase tracking-[0.2em] mb-1.5 block">Question {questionNumber}/05</span>
                    <h2 className="text-base font-medium text-white leading-snug pr-14">
                      {question}
                    </h2>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500 border-t border-white/5 pt-3">
                      <span className="flex items-center gap-1"><Clock size={10} /> 01:45</span>
                      <span className="flex items-center gap-1"><RotateCcw size={10} /> 1 Retake</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <Sparkles size={20} className={`mx-auto text-slate-600 ${isStarting ? 'animate-pulse text-emerald-500' : ''}`} />
                    <p className="text-xs text-slate-500">{isStarting ? "Generating Question..." : "Enter a job title to begin"}</p>
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-4 shrink-0">
                <div className="flex items-center gap-2 mb-3 text-slate-300 font-medium text-xs">
                  <Briefcase size={14} className="text-slate-400" />
                  Target Job
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    onKeyPress={handleJobKeyPress}
                    disabled={!!sessionId}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/40 disabled:opacity-50"
                  />
                  {!sessionId && (
                    <button 
                      onClick={startInterview}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      <Search size={14} />
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="col-span-4 flex flex-col gap-5 min-h-0">
              <GlassCard className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Transcribed Answer</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-dark-scrollbar border-b border-white/5">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer will appear here..."
                    className="w-full h-full min-h-[150px] bg-transparent p-4 outline-none resize-none text-[13px] leading-relaxed text-slate-300 placeholder:text-slate-600"
                  />
                </div>
                <div className="h-1/3 overflow-y-auto custom-dark-scrollbar p-4 bg-black/10">
                  {analysis ? <AnalysisDisplay analysis={analysis} /> : <div className="text-[10px] text-slate-500 italic">Analysis will appear here.</div>}
                </div>
                <div className="p-3 border-t border-white/5">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2 p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <Sparkles size={14} className="text-emerald-400 animate-spin" />
                      <span className="text-[11px] font-medium text-emerald-400">Analyzing...</span>
                    </div>
                  ) : showNextButton ? (
                    interviewFinished ? (
                      <div className="w-full py-2.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg text-center border border-emerald-500/30">Done 🎉</div>
                    ) : (
                      <button onClick={goToNextQuestion} className="w-full py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-400 flex items-center justify-center gap-2 transition-all">
                        Next Question <ChevronRight size={14} />
                      </button>
                    )
                  ) : (
                    <button onClick={submitAnswer} disabled={!sessionId || !answer} className="w-full py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                      Submit Answer <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}