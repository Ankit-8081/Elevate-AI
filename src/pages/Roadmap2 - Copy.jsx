import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Zap, Brain, CheckCircle2, Sparkles, TrendingUp,
  ChevronDown, BookOpen, Clock, Download, ExternalLink, Info,
  Mic, MicOff, Globe, HardHat
} from 'lucide-react';
import jsPDF from 'jspdf';

const API = import.meta.env.VITE_API_BASE_URL;

const ROLE_SKILLS = {
  "AI Engineer": ["Python", "PyTorch", "Transformers", "MLOps", "Deep Learning"],
  "Backend Developer": ["Node.js", "Databases", "API Design", "Docker", "System Design"],
  "Data Scientist": ["Python", "Statistics", "Machine Learning", "Pandas", "SQL"],
  "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"]
};

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr", speechCode: "en-US" },
  { code: "hi", label: "हिन्दी", dir: "ltr", speechCode: "hi-IN" },
  { code: "mr", label: "मराठी", dir: "ltr", speechCode: "mr-IN" },
  { code: "te", label: "తెలుగు", dir: "ltr", speechCode: "te-IN" },
  { code: "ta", label: "தமிழ்", dir: "ltr", speechCode: "ta-IN" },
  { code: "kn", label: "ಕನ್ನಡ", dir: "ltr", speechCode: "kn-IN" },
];

const T = {
  en: {
    title: "Skill Path Architect",
    subtitle: "AI-powered career mapping for skilled workers.",
    targetRole: "Your Job / Trade",
    placeholder: "e.g. Electrician, Welder, Plumber...",
    experience: "Experience",
    domainFocus: "Domain Focus",
    generate: "Generate Roadmap",
    generating: "Generating...",
    download: "Download Path",
    empty: "Define your trade above to visualize your learning path.",
    aiInsights: "AI Insights",
    totalCompletion: "Total Completion",
    streak: "Streak",
    modules: "Modules",
    resumeNeeded: "Resume Needed",
    resumeNeededDesc: "Upload your resume in the Resume Analyzer to unlock personalized insights.",
    skillGaps: "Skill Gaps",
    jobReadiness: "Job Readiness",
    progress: "Progress",
    notStarted: "Not Started",
    inProgress: "In Progress",
    completed: "Completed",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    docs: "Docs",
    micTip: "Listening... speak now",
    stage1: "Step 1: The Basics",
    stage2: "Step 2: Core Skills",
    stage3: "Step 3: Advanced Work",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    projectBased: "Project Based",
    theoryFirst: "Theory First",
    balanced: "Balanced",
    fastTrack: "Fast Track",
    deepDive: "Deep Dive",
    days: "Days",
    language: "Language",
  },
  hi: {
    title: "स्किल पाथ आर्किटेक्ट",
    subtitle: "कुशल कारीगरों के लिए AI करियर मैपिंग।",
    targetRole: "आपका काम / ट्रेड",
    placeholder: "जैसे: इलेक्ट्रीशियन, वेल्डर, प्लम्बर...",
    experience: "अनुभव",
    domainFocus: "डोमेन फोकस",
    generate: "रोडमैप बनाएं",
    generating: "बन रहा है...",
    download: "डाउनलोड करें",
    empty: "अपना ट्रेड ऊपर दर्ज करें।",
    aiInsights: "AI अंतर्दृष्टि",
    totalCompletion: "कुल प्रगति",
    streak: "स्ट्रीक",
    modules: "मॉड्यूल",
    resumeNeeded: "रिज्यूमे चाहिए",
    resumeNeededDesc: "व्यक्तिगत अंतर्दृष्टि के लिए रिज्यूमे अपलोड करें।",
    skillGaps: "स्किल गैप्स",
    jobReadiness: "नौकरी तैयारी",
    progress: "प्रगति",
    notStarted: "शुरू नहीं",
    inProgress: "जारी है",
    completed: "हो गया ✓",
    easy: "आसान",
    medium: "मध्यम",
    hard: "कठिन",
    docs: "गाइड",
    micTip: "सुन रहा है... बोलें",
    stage1: "चरण 1: बुनियाद",
    stage2: "चरण 2: मुख्य कौशल",
    stage3: "चरण 3: उन्नत कार्य",
    beginner: "नौसिखिया",
    intermediate: "मध्यम",
    advanced: "उन्नत",
    projectBased: "प्रोजेक्ट आधारित",
    theoryFirst: "सिद्धांत पहले",
    balanced: "संतुलित",
    fastTrack: "फास्ट ट्रैक",
    deepDive: "गहन अध्ययन",
    days: "दिन",
    language: "भाषा",
  },
  mr: {
    title: "स्किल पाथ आर्किटेक्ट",
    subtitle: "कुशल कामगारांसाठी AI-आधारित करिअर मॅपिंग.",
    targetRole: "तुमचा व्यवसाय / ट्रेड",
    placeholder: "उदा. इलेक्ट्रिशियन, वेल्डर, प्लंबर...",
    experience: "अनुभव",
    domainFocus: "डोमेन फोकस",
    generate: "रोडमॅप तयार करा",
    generating: "तयार होत आहे...",
    download: "पाथ डाउनलोड करा",
    empty: "तुमचा शिकण्याचा मार्ग पाहण्यासाठी तुमचा ट्रेड वर नमूद करा.",
    aiInsights: "AI अंतर्दृष्टी",
    totalCompletion: "एकूण प्रगती",
    streak: "स्ट्रीक",
    modules: "मॉड्यूल्स",
    resumeNeeded: "रेझ्युमे आवश्यक",
    resumeNeededDesc: "वैयक्तिक माहितीसाठी तुमचा रेझ्युमे अपलोड करा.",
    skillGaps: "कौशल्यातील कमतरता",
    jobReadiness: "नोकरीसाठी सज्जता",
    progress: "प्रगती",
    notStarted: "सुरू झाले नाही",
    inProgress: "प्रगतीपथावर",
    completed: "पूर्ण झाले ✓",
    easy: "सोपे",
    medium: "मध्यम",
    hard: "कठीण",
    docs: "मार्गदर्शक",
    micTip: "ऐकत आहे... आता बोला",
    stage1: "टप्पा १: मूलभूत गोष्टी",
    stage2: "टप्पा २: मुख्य कौशल्ये",
    stage3: "टप्पा ३: प्रगत काम",
    beginner: "सुरवातीचा",
    intermediate: "मध्यम",
    advanced: "प्रगत",
    projectBased: "प्रकल्प आधारित",
    theoryFirst: "सिद्धांतावर आधारित",
    balanced: "संतुलित",
    fastTrack: "जलद मार्ग",
    deepDive: "सखोल अभ्यास",
    days: "दिवस",
    language: "भाषा",
  },
  te: {
    title: "స్కిల్ పాత్ ఆర్కిటెక్ట్",
    subtitle: "నైపుణ్యం కలిగిన కార్మికుల కోసం AI కెరీర్ మ్యాపింగ్.",
    targetRole: "మీ పని / ట్రేడ్",
    placeholder: "ఉదా: ఎలక్ట్రీషియన్, వెల్డర్, ప్లంబర్...",
    experience: "అనుభవం",
    domainFocus: "డొమైన్ ఫోకస్",
    generate: "రోడ్‌మ్యాప్‌ను రూపొందించండి",
    generating: "రూపొందిస్తోంది...",
    download: "పాత్‌ను డౌన్‌లోడ్ చేయండి",
    empty: "మీ లెర్నింగ్ పాత్‌ను చూడటానికి మీ ట్రేడ్‌ను పైన నమోదు చేయండి.",
    aiInsights: "AI అంతర్దృష్టులు",
    totalCompletion: "మొత్తం పూర్తి",
    streak: "స్ట్రీక్",
    modules: "మాడ్యూల్స్",
    resumeNeeded: "రెజ్యూమ్ అవసరం",
    resumeNeededDesc: "వ్యక్తిగత వివరాల కోసం మీ రెజ్యూమ్‌ను అప్‌లోడ్ చేయండి.",
    skillGaps: "నైపుణ్య లోపాలు",
    jobReadiness: "ఉద్యోగ సంసిద్ధత",
    progress: "ప్రగతి",
    notStarted: "ప్రారంభించలేదు",
    inProgress: "పురోగతిలో ఉంది",
    completed: "పూర్తయింది ✓",
    easy: "సులభం",
    medium: "మధ్యస్థం",
    hard: "కఠినం",
    docs: "గైడ్",
    micTip: "వింటున్నాను... ఇప్పుడు మాట్లాడండి",
    stage1: "దశ 1: ప్రాథమిక విషయాలు",
    stage2: "దశ 2: ప్రధాన నైపుణ్యాలు",
    stage3: "దశ 3: అధునాతన పని",
    beginner: "ప్రారంభ స్థాయి",
    intermediate: "మధ్యస్థ స్థాయి",
    advanced: "అధునాతన స్థాయి",
    projectBased: "ప్రాజెక్ట్ ఆధారిత",
    theoryFirst: "థియరీ మొదట",
    balanced: "సమతుల్యత",
    fastTrack: "ఫాస్ట్ ట్రాక్",
    deepDive: "లోతైన అధ్యయనం",
    days: "రోజులు",
    language: "భాష",
  },
  ta: {
    title: "ஸ்கில் பாத் ஆர்க்கிடெக்ட்",
    subtitle: "திறன் கொண்ட தொழிலாளர்களுக்கான AI தொழில் வரைபடம்.",
    targetRole: "உங்கள் வேலை / தொழில்",
    placeholder: "எ.கா. எலக்ட்ரீஷியன், வெல்டர், பிளம்பர்...",
    experience: "அனுபவம்",
    domainFocus: "துறை கவனம்",
    generate: "வரைபடத்தை உருவாக்கு",
    generating: "உருவாக்கப்படுகிறது...",
    download: "பதிவிறக்கம் செய்",
    empty: "உங்கள் கற்றல் பாதையைக் காண உங்கள் தொழிலை மேலே உள்ளிடவும்.",
    aiInsights: "AI நுண்ணறிவு",
    totalCompletion: "மொத்த நிறைவு",
    streak: "ஸ்ட்ரீக்",
    modules: "பாடப்பிரிவுகள்",
    resumeNeeded: "ரெஸ்யூம் தேவை",
    resumeNeededDesc: "தனிப்பயனாக்கப்பட்ட நுண்ணறிவுகளுக்கு உங்கள் ரெஸ்யூமைப் பதிவேற்றவும்.",
    skillGaps: "திறன் இடைவெளிகள்",
    jobReadiness: "வேலை தயார்நிலை",
    progress: "முன்னேற்றம்",
    notStarted: "தொடங்கப்படவில்லை",
    inProgress: "செயல்பாட்டில் உள்ளது",
    completed: "முடிந்தது ✓",
    easy: "எளிதானது",
    medium: "நடுத்தரம்",
    hard: "கடினம்",
    docs: "வழிகாட்டி",
    micTip: "கேட்கிறது... இப்போது பேசவும்",
    stage1: "நிலை 1: அடிப்படைகள்",
    stage2: "நிலை 2: முக்கிய திறன்கள்",
    stage3: "நிலை 3: மேம்பட்ட வேலை",
    beginner: "தொடக்க நிலை",
    intermediate: "இடைநிலை",
    advanced: "மேம்பட்ட நிலை",
    projectBased: "திட்டம் சார்ந்தது",
    theoryFirst: "கோட்பாடு முதலில்",
    balanced: "சீரானது",
    fastTrack: "விரைவான பாதை",
    deepDive: "ஆழ்ந்த ஆய்வு",
    days: "நாட்கள்",
    language: "மொழி",
  },
  kn: {
    title: "ಸ್ಕಿಲ್ ಪಾತ್ ಆರ್ಕಿಟೆಕ್ಟ್",
    subtitle: "ಕುಶಲ ಕಾರ್ಮಿಕರಿಗಾಗಿ AI ವೃತ್ತಿ ಮ್ಯಾಪಿಂಗ್.",
    targetRole: "ನಿಮ್ಮ ಕೆಲಸ / ವೃತ್ತಿ",
    placeholder: "ಉದಾ: ಎಲೆಕ್ಟ್ರಿಷಿಯನ್, ವೆಲ್ಡರ್, ಪ್ಲಂಬರ್...",
    experience: "ಅನುಭವ",
    domainFocus: "ಕ್ಷೇತ್ರದ ಗಮನ",
    generate: "ರೋಡ್‌ಮ್ಯಾಪ್ ರಚಿಸಿ",
    generating: "ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    download: "ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    empty: "ಕಲಿಕೆಯ ಹಾದಿಯನ್ನು ನೋಡಲು ನಿಮ್ಮ ವೃತ್ತಿಯನ್ನು ಮೇಲೆ ನಮೂದಿಸಿ.",
    aiInsights: "AI ಒಳನೋಟಗಳು",
    totalCompletion: "ಒಟ್ಟು ಪೂರ್ಣಗೊಂಡಿದೆ",
    streak: "ಸ್ಟ್ರಿಕ್",
    modules: "ಮಾಡ್ಯೂಲ್‌ಗಳು",
    resumeNeeded: "ರೆಸ್ಯೂಮ್ ಅಗತ್ಯವಿದೆ",
    resumeNeededDesc: "ವೈಯಕ್ತಿಕ ಒಳನೋಟಗಳಿಗಾಗಿ ನಿಮ್ಮ ರೆಸ್ಯೂಮ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    skillGaps: "ಕೌಶಲ್ಯದ ಕೊರತೆಗಳು",
    jobReadiness: "ಕೆಲಸದ ಸಿದ್ಧತೆ",
    progress: "ಪ್ರಗತಿ",
    notStarted: "ಪ್ರಾರಂಭಿಸಿಲ್ಲ",
    inProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ ✓",
    easy: "ಸುಲಭ",
    medium: "ಮಧ್ಯಮ",
    hard: "ಕಠಿಣ",
    docs: "ಮಾರ್ಗದರ್ಶಿ",
    micTip: "ಕೇಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ",
    stage1: "ಹಂತ 1: ಮೂಲಭೂತ ವಿಷಯಗಳು",
    stage2: "ಹಂತ 2: ಪ್ರಮುಖ ಕೌಶಲ್ಯಗಳು",
    stage3: "ಹಂತ 3: ಸುಧಾರಿತ ಕೆಲಸ",
    beginner: "ಪ್ರಾರಂಭಿಕ",
    intermediate: "ಮಧ್ಯಂತರ",
    advanced: "ಸುಧಾರಿತ",
    projectBased: "ಯೋಜನೆ ಆಧಾರಿತ",
    theoryFirst: "ಸಿದ್ಧಾಂತ ಮೊದಲು",
    balanced: "ಸಮತೋಲಿತ",
    fastTrack: "ವೇಗದ ಹಾದಿ",
    deepDive: "ಆಳವಾದ ಅಧ್ಯಯನ",
    days: "ದಿನಗಳು",
    language: "ಭಾಷೆ",
  },
};

const SkillRoadmap2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [role, setRole] = useState("");
  const [roadmapData, setRoadmapData] = useState([]);
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(0);
  const [language, setLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const roadmapRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const highlightSkill = location.state?.highlightSkill;
  const openStageId = highlightSkill
    ? roadmapData.find(stage => stage.skills?.some(s => s.name === highlightSkill))?.id
    : null;

  const [experience, setExperience] = useState("Beginner");
  const [learningStyle, setLearningStyle] = useState("Project Based");

  const t = T[language] || T.en;
  const langDir = LANGUAGES.find(l => l.code === language)?.dir || "ltr";

  const toggleMic = async () => {
    if (isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm"
        });
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

          const selectedLang = LANGUAGES.find(l => l.code === language);

          const formData = new FormData();
          formData.append("file", audioBlob);
          formData.append("language", selectedLang?.code || "en"); // 🔥 backend expects "hi", "en"

          try {
            const res = await axios.post(`${API}/audio/process`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            const detectedRole = res.data.transcription;
            setShowRoadmap(false);
            setRoadmapData([]);
            setRole(detectedRole);
          } catch (err) {
            console.error("Audio processing error:", err);
          }
        };

        mediaRecorderRef.current.start();
        setIsListening(true);

      } catch (err) {
        console.error("Mic error:", err);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (location.state?.trigger === "resume") {
      axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { if (res.data.target_role) setRole(res.data.target_role); });
    }
  }, [location.state]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { return; }
    axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setUser(res.data); setStreak(res.data.learning_streak || 0); })
      .catch(err => console.error(err));
    axios.get(`${API}/roadmap/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data?.roadmap) { setRoadmapData(res.data.roadmap); setShowRoadmap(true); } })
      .catch(() => { });
  }, [navigate]);

  useEffect(() => {
    if (role.trim() !== "" && !showRoadmap) {
      handleGenerate();
    }
  }, [role]);

  const handleStatusChange = (stageId, skillName, newStatus) => {
    let wasCompleted = false;
    const newData = roadmapData.map(stage => {
      if (stage.id === stageId) {
        const updatedSkills = stage.skills.map(skill => {
          if (skill.name === skillName) {
            if (skill.status === "Completed") wasCompleted = true;
            return { ...skill, status: newStatus };
          }
          return skill;
        });
        const completed = updatedSkills.filter(s => s.status === "Completed").length;
        return { ...stage, skills: updatedSkills, progress: Math.round((completed / updatedSkills.length) * 100) };
      }
      return stage;
    });
    setRoadmapData(newData);
    const token = localStorage.getItem("token");
    if (!token) return;
    localStorage.setItem("roadmap", JSON.stringify(newData));
    if (!wasCompleted && newStatus === "Completed") {
      axios.post(`${API}/streak/update`, {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setStreak(res.data.streak))
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
      if (!isNaN(first) && !isNaN(second)) return (first + second) / 2;
    }
    if (lower.includes("min")) return parseFloat(lower) / 60;
    if (lower.includes("day")) return parseFloat(lower) * 6;
    const num = parseFloat(lower);
    return isNaN(num) ? 0 : num;
  };

  const calculateWeeks = (concepts) => {
    const totalHours = concepts.reduce((sum, c) => sum + parseLearningTime(c.learning_time), 0);
    return `${Math.ceil(totalHours / 10)} Weeks`;
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
    if (!role.trim()) { alert("Please enter a target role"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/roadmap`, {
        topic: role,
        experience_level: experience,
        learning_style: learningStyle,
        limit: 8,
        language: language,
      });
      const data = res.data;
      const stageTitles = [t.stage1, t.stage2, t.stage3];
      const formatted = [
        {
          id: 1,
          title: stageTitles[0],
          duration: calculateWeeks(data.basic),
          progress: 0,
          skills: data.basic.map(c => ({
            name: c.title, difficulty: c.toughness, time: c.learning_time, status: "Not Started",
            url: c.learning_link || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`
          }))
        },
        {
          id: 2,
          title: stageTitles[1],
          duration: calculateWeeks(data.core),
          progress: 0,
          skills: data.core.map(c => ({
            name: c.title, difficulty: c.toughness, time: c.learning_time, status: "Not Started",
            url: c.learning_link || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`
          }))
        },
        {
          id: 3,
          title: stageTitles[2],
          duration: calculateWeeks(data.advanced),
          progress: 0,
          skills: data.advanced.map(c => ({
            name: c.title, difficulty: c.toughness, time: c.learning_time, status: "Not Started",
            url: c.learning_link || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`
          }))
        }
      ];
      setRoadmapData(formatted);
      setShowRoadmap(true);
      localStorage.setItem("roadmap", JSON.stringify(formatted));
      setStreak(0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  useEffect(() => {
    const savedRoadmap = localStorage.getItem("roadmap");

    if (savedRoadmap) {
      const parsed = JSON.parse(savedRoadmap);
      setRoadmapData(parsed);
      setShowRoadmap(true);
    }
  }, []);
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
  const skillGaps = user?.skills ? requiredSkills.filter(skill => !user.skills.includes(skill)) : [];
  const allSkills = roadmapData.flatMap(s => s.skills);
  const totalCompleted = allSkills.filter(s => s.status === "Completed").length;
  const globalProgress = allSkills.length > 0 ? Math.round((totalCompleted / allSkills.length) * 100) : 0;

  return (
    <div dir={langDir} className="min-h-screen bg-[#0a0a0c] text-slate-200 flex font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .sr-root { font-family: 'Space Grotesk', sans-serif; }

        .sr-input {
          width: 100%;
          background: #1e1e2a;
          border: 1px solid #2a2a3d;
          border-radius: 8px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sr-input::placeholder { color: #4a5568; }
        .sr-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        .sr-select {
          width: 100%;
          background: #1e1e2a;
          border: 1px solid #2a2a3d;
          border-radius: 8px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
        .sr-select:focus { border-color: #3b82f6; }
        .sr-select option { background: #1a1a2e; }

        .sr-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #4a5568;
          margin-bottom: 6px;
        }

        .sr-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          font-weight: 600;
          font-size: 13px;
          border: none;
          border-radius: 8px;
          height: 42px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .sr-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(59,130,246,0.35); }
        .sr-btn-primary:active { transform: translateY(0); }

        .sr-btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1e1e2a;
          border: 1px solid #2a2a3d;
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .sr-btn-secondary:hover { background: #252536; border-color: #3b82f6; }

        .sr-mic-btn {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid #2a2a3d;
          background: #1e1e2a;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .sr-mic-btn.listening {
          background: rgba(239,68,68,0.12);
          border-color: #ef4444;
          color: #ef4444;
          animation: micPulse 1.2s ease-in-out infinite;
        }
        .sr-mic-btn:hover:not(.listening) { border-color: #3b82f6; color: #3b82f6; }

        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }

        .sr-lang-wrap {
          min-width: 170px; 
          width: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1e1e2a;
          border: 1px solid #2a2a3d;
          position: relative;
          border-radius: 8px;
          padding: 6px 12px;
          transition: border-color 0.2s;
        }
        .sr-lang-wrap:hover { border-color: #3b82f6; }

        .sr-lang-select {
          background: transparent;
          padding-right: 24px;
          width: 100%;
          border: none;
          text-align: left;
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          z-index: 50;
          position: relative;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0 center;
          min-width: 120px;
        }
        .sr-lang-select option {
         white-space: nowrap;
         background: #1a1a2e; 
         padding-left: 10px;
         }

        .sr-stage-card {
          background: rgba(30,30,42,0.5);
          border: 1px solid #1e1e2a;
          border-radius: 12px;
          overflow: visible;
          transition: border-color 0.2s;
        }
        .sr-stage-card:hover { border-color: #2a2a3d; }

        .sr-skill-card {
          padding: 14px;
          border-radius: 10px;
          border: 1px solid rgba(42,42,61,0.5);
          background: rgba(42,42,61,0.4);
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .sr-skill-card:hover { background: rgba(42,42,61,0.65); transform: translateY(-1px); }
        .sr-skill-card.highlighted {
          background: rgba(239,68,68,0.08);
          border-color: #ef4444;
          box-shadow: 0 0 12px rgba(239,68,68,0.25);
        }

        .sr-status-select {
          appearance: none;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid;
          outline: none;
          transition: all 0.2s;
          text-align: center;
        }
        .sr-status-select option { background: #0a0a0c; }

        .sr-diff-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid;
        }

        .sr-insight-item {
          padding: 10px 12px;
          background: rgba(42,42,61,0.3);
          border-radius: 8px;
          border: 1px solid #1e1e2a;
        }

        .sr-stat-box {
          background: rgba(42,42,61,0.4);
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #1e1e2a;
          text-align: center;
        }

        .sr-progress-bar {
          height: 6px;
          background: #1e1e2a;
          border-radius: 999px;
          overflow: visible;
        }

        .sr-form-section {
          background: rgba(20,20,30,0.6);
          border: 1px solid #1e1e2a;
          border-radius: 16px;
          padding: 20px 24px;
          backdrop-filter: blur(12px);
        }

        .sr-aside-card {
          background: rgba(20,20,30,0.6);
          border: 1px solid #1e1e2a;
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .sr-listening-tip {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #ef4444;
          font-size: 11px;
          font-weight: 600;
          margin-top: 5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        @media (max-width: 767px) {
          .sr-form-grid { grid-template-columns: 1fr !important; }
          .sr-skill-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .sr-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>



      <main className="sr-root flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">

          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
                <Map className="text-blue-400" /> {t.title}
              </h1>
              <p className="text-slate-400 mt-1 text-sm">{t.subtitle}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="sr-lang-wrap">
                <Globe size={13} className="text-slate-500 flex-shrink-0" />
                <select
                  className="sr-lang-select"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  title={t.language}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>
                      {"\u00A0\u00A0"}{l.label}
                    </option>
                  ))}
                </select>
              </div>

              {showRoadmap && (
                <button className="sr-btn-secondary" onClick={downloadRoadmap}>
                  <Download size={14} /> {t.download}
                </button>
              )}
            </div>
          </header>

          <section className="sr-form-section mb-8">
            <div
              className="sr-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", alignItems: "end" }}
            >
              <div style={{ gridColumn: "span 1" }}>
                <label className="sr-label">{t.targetRole}</label>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={t.placeholder}
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="sr-input"
                    style={{ flex: 1 }}
                    onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  />
                  {micSupported && (
                    <button
                      onClick={toggleMic}
                      className={`sr-mic-btn${isListening ? " listening" : ""}`}
                      title={isListening ? t.micTip : "Speak your trade"}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                  )}
                </div>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sr-listening-tip"
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "micPulse 1s infinite" }} />
                    {t.micTip}
                  </motion.div>
                )}
              </div>

              <div>
                <label className="sr-label">{t.experience}</label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="sr-select"
                >
                  <option value="Beginner">{t.beginner}</option>
                  <option value="Intermediate">{t.intermediate}</option>
                  <option value="Advanced">{t.advanced}</option>
                </select>
              </div>

              <div>
                <label className="sr-label">{t.domainFocus}</label>
                <select
                  value={learningStyle}
                  onChange={e => setLearningStyle(e.target.value)}
                  className="sr-select"
                >
                  <option value="Project Based">{t.projectBased}</option>
                  <option value="Theory First">{t.theoryFirst}</option>
                  <option value="Balanced">{t.balanced}</option>
                  <option value="Fast Track">{t.fastTrack}</option>
                  <option value="Deep Dive">{t.deepDive}</option>
                </select>
              </div>

              <button className="sr-btn-primary" onClick={handleGenerate} disabled={loading}>
                {loading
                  ? <><div className="sr-spinner" /> {t.generating}</>
                  : <><Sparkles size={16} /> {t.generate}</>
                }
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
                        t={t}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 gap-3">
                    <Brain size={48} className="opacity-20" />
                    <p className="text-sm text-center px-6">{t.empty}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StageCard = ({ stage, index, onStatusChange, highlightSkill, openStageId, t }) => {
  const [expanded, setExpanded] = useState(openStageId === stage.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 border-l-2 border-slate-800"
    >
      <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-[#0a0a0c] transition-colors ${stage.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`} />

      <div className="sr-stage-card">
        <div
          className="p-5 cursor-pointer flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                {stage.title.includes(":") ? stage.title.split(":")[0] : `Stage ${stage.id}`}
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                {stage.title.includes(":") ? stage.title.split(":")[1]?.trim() : stage.title}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Clock size={13} /> {stage.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={13} /> {stage.skills.length} {t.modules}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">{t.progress}</div>
              {stage.progress > 0 && (
                <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    style={{
                      height: "100%",
                      background: stage.progress === 100
                        ? "#10b981"
                        : "linear-gradient(90deg,#3b82f6,#6366f1)",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              )}
            </div>
            <ChevronDown
              className="text-slate-500 transition-transform"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
              size={18}
            />
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-5 pb-5">
                <div
                  className="sr-skill-grid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "8px" }}
                >
                  {stage.skills.map((skill, idx) => (
                    <SkillCard
                      key={idx}
                      skill={skill}
                      highlight={highlightSkill === skill.name}
                      onStatusUpdate={val => onStatusChange(stage.id, skill.name, val)}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SkillCard = ({ skill, onStatusUpdate, highlight, t }) => {
  const skillRef = useRef(null);

  useEffect(() => {
    if (highlight && skillRef.current) {
      setTimeout(() => skillRef.current.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [highlight]);

  const getDiffStyle = (diff) => {
    if (!diff) return { color: "#34d399", borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.07)" };
    const d = diff.toLowerCase();
    if (d === "easy") return { color: "#34d399", borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.07)" };
    if (d === "medium") return { color: "#fbbf24", borderColor: "rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.07)" };
    return { color: "#f87171", borderColor: "rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.07)" };
  };

  const getDiffLabel = (diff) => {
    if (!diff) return t.easy;
    const d = diff.toLowerCase();
    if (d === "easy") return t.easy;
    if (d === "medium") return t.medium;
    return t.hard;
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") return { color: "#34d399", borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)" };
    if (status === "In Progress") return { color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.08)" };
    return { color: "#6b7280", borderColor: "rgba(107,114,128,0.3)", background: "rgba(107,114,128,0.08)" };
  };

  const getStatusLabel = (status) => {
    if (status === "Completed") return t.completed;
    if (status === "In Progress") return t.inProgress;
    return t.notStarted;
  };

  const diffStyle = getDiffStyle(skill.difficulty);
  const statusStyle = getStatusStyle(skill.status);

  return (
    <motion.div
      ref={skillRef}
      whileHover={{ y: -2 }}
      className={`sr-skill-card${highlight ? " highlighted" : ""}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "6px" }}>
        <h4 style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3, flex: 1 }}>
          {skill.name}
        </h4>
        <select
          value={skill.status}
          onChange={e => onStatusUpdate(e.target.value)}
          className="sr-status-select"
          style={{ ...statusStyle, background: statusStyle.background }}
        >
          <option value="Not Started">{t.notStarted}</option>
          <option value="In Progress">{t.inProgress}</option>
          <option value="Completed">{t.completed}</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "5px" }}>
        <span className="sr-diff-badge" style={diffStyle}>
          {getDiffLabel(skill.difficulty)}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#4a5568", fontSize: "10px" }}>
          <Clock size={9} /> {skill.time}
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
            {t.docs} <ExternalLink size={10} />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default SkillRoadmap2;