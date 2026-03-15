import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Linkedin, Github, Globe,
  FileText, Cpu, Briefcase, Code, GraduationCap, Award,
  Trophy, Languages, Plus, X, Send, Sparkles, ChevronLeft, Download
} from 'lucide-react';
import Sidebar from '../components/sidebar.jsx';

const Card = ({ children, title, icon: Icon }) => (
  <motion.div
    whileHover={{ y: -1, boxShadow: '0 10px 30px -10px rgba(255,255,255,0.03)' }}
    className="bg-white/5 border border-white/10 rounded-xl p-5 transition-all duration-300"
  >
    {title && (
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="p-1.5 bg-white/5 rounded-md text-white">
          <Icon size={16} />
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
    )}
    {children}
  </motion.div>
);

const Input = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-medium text-white/60">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <input
      {...props}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
    />
  </div>
);

const Textarea = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-medium text-white/60">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <textarea
      {...props}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all min-h-[80px] resize-y"
    />
  </div>
);

export default function ResumeBuilder() {
  const [stage, setStage] = useState(1);
  const chatScrollRef = useRef(null);

  const [contactInfo, setContactInfo] = useState({
    fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: ''
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [achievementInput, setAchievementInput] = useState('');
  const [languages, setLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState('');
  const [resumeHTML, setResumeHTML] = useState('');
  const [user, setUser] = useState(null);

const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email);
const phoneValid = /^[0-9]{10,15}$/.test(contactInfo.phone);

const educationValid = education.every(
  edu =>
    edu.degree &&
    edu.institution &&
    edu.startYear &&
    edu.endYear &&
    (!edu.gpa || (edu.gpa >= 0 && edu.gpa <= 10))
);

const isResumeValid =
  contactInfo.fullName.trim() &&
  emailValid &&
  phoneValid &&
  summary.trim() &&
  skills.length > 0 &&
  education.length > 0 &&
  educationValid;

  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your AI resume assistant. I've generated your initial resume layout. How would you like to improve it?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {

  const token = localStorage.getItem("token");
  if (!token) return;

  axios.get("http://127.0.0.1:8000/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => setUser(res.data))
  .catch(err => console.error(err));

}, []);

  const addArrayItem = (setter, item) => {
    setter(prev => [...prev, item]);
  };

  const updateArrayItem = (setter, index, field, value) => {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeArrayItem = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompile = async () => {

    const token = localStorage.getItem("token")

    const resumeData = {
      contact: contactInfo,
      summary,
      skills,
      experience,
      projects,
      education,
      certifications,
      achievements,
      languages
    }

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/resume/generate",
        {
          session_id: user ? user.email : "session1",
          resume_data: resumeData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const cleanedHTML = res.data.html
  .replace(/^```html\s*/i, "")
  .replace(/^```/i, "")
  .replace(/```$/, "");

setResumeHTML(cleanedHTML);
      setStage(2)

    } catch (err) {
      console.error(err)
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <title>${contactInfo.fullName}_Resume</title>
        </head>
        <body style="margin:0; padding:0; background:#f4f4f4;">
          ${resumeHTML}
        </body>
      </html>
    `], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${contactInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(element);
    element.click();
  };

  const handleChatCompile = async () => {

    if (!chatInput.trim()) return

    const token = localStorage.getItem("token")

    setMessages(prev => [...prev, { role: "user", content: chatInput }])

    const resumeData = {
      contact: contactInfo,
      summary,
      skills,
      experience,
      projects,
      education,
      certifications,
      achievements,
      languages,
      instruction: chatInput
    }

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/resume/generate",
        {
          session_id: user?.email || "session1",
          resume_data: resumeData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const cleanedHTML = res.data.html
     .replace(/^```html\s*/i, "")
     .replace(/^```/i, "")
     .replace(/```$/, "");
     setResumeHTML(cleanedHTML);

      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Resume updated successfully." }
      ])

    } catch (err) {
      console.error(err)
    }

    setChatInput("")
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white flex font-sans selection:bg-white/20 overflow-hidden">
      <Sidebar />
      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_40%)] pointer-events-none" />
        <div className="flex-1 overflow-y-auto p-6 md:p-8 w-full relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {stage === 1 ? (
              <motion.div
                key="stage1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                className="max-w-5xl mx-auto space-y-5 pb-24"
              >
                <div className="space-y-1 mb-6">
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Resume Builder
                  </h1>
                  <p className="text-sm text-white/60">Fill in your details below to generate an AI-optimized resume.</p>
                </div>

                <Card title="Contact Information" icon={User}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input required label="Full Name" value={contactInfo.fullName} onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })} placeholder="Jane Doe" />
                    <Input
  required
  label="Email Address"
  type="email"
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  value={contactInfo.email}
  onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
  placeholder="jane@example.com"
/>
  <Input
  required
  label="Phone Number"
  type="tel"
  inputMode="numeric"
  pattern="[0-9]{10,15}"
  maxLength={15}
  value={contactInfo.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // remove non-digits
    setContactInfo({ ...contactInfo, phone: value });
  }}
  placeholder="9876543210"
/>
                    <Input label="Location" value={contactInfo.location} onChange={e => setContactInfo({ ...contactInfo, location: e.target.value })} placeholder="San Francisco, CA" />
                    <Input label="LinkedIn URL" value={contactInfo.linkedin} onChange={e => setContactInfo({ ...contactInfo, linkedin: e.target.value })} placeholder="linkedin.com/in/janedoe" />
                    <Input label="GitHub URL" value={contactInfo.github} onChange={e => setContactInfo({ ...contactInfo, github: e.target.value })} placeholder="github.com/janedoe" />
                    <div className="md:col-span-3">
                      <Input label="Portfolio Website" value={contactInfo.portfolio} onChange={e => setContactInfo({ ...contactInfo, portfolio: e.target.value })} placeholder="janedoe.com" />
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card title="Professional Summary" icon={FileText}>
                    <Textarea required label="Professional Summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="A passionate software engineer with experience in..." />
                  </Card>

                  <Card title="Skills" icon={Cpu}>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="e.g. React.js, Python, AWS"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                           onKeyDown={e => {
  if (e.key === 'Enter' && skillInput.trim()) {
    e.preventDefault();

    const skill = skillInput.trim().toLowerCase();

    if (!skills.map(s => s.toLowerCase()).includes(skill)) {
      addArrayItem(setSkills, skillInput.trim());
    }

    setSkillInput('');
  }
}}
                          />
                        </div>
                        <button
                          onClick={() => {
  if (skillInput.trim()) {

    const skill = skillInput.trim().toLowerCase();

    if (!skills.map(s => s.toLowerCase()).includes(skill)) {
      addArrayItem(setSkills, skillInput.trim());
    }

    setSkillInput('');
  }
}}
                          className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-lg flex items-center gap-1.5 transition-all text-sm font-medium whitespace-nowrap"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {skills.map((skill, index) => (
                          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={index} className="bg-white/10 border border-white/10 px-3 py-1 rounded-md flex items-center gap-1.5 text-xs">
                            {skill}
                            <button onClick={() => removeArrayItem(setSkills, index)} className="text-white/40 hover:text-white transition-colors">
                              <X size={12} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                <Card title="Work Experience" icon={Briefcase}>
                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="p-4 border border-white/10 rounded-xl space-y-3 bg-white/[0.02] relative group">
                        <button onClick={() => removeArrayItem(setExperience, index)} className="absolute top-3 right-3 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="lg:col-span-2"><Input label="Job Title" value={exp.title} onChange={e => updateArrayItem(setExperience, index, 'title', e.target.value)} /></div>
                          <div className="lg:col-span-2"><Input label="Company" value={exp.company} onChange={e => updateArrayItem(setExperience, index, 'company', e.target.value)} /></div>
                          <Input label="Start Date" type="month" value={exp.startDate} onChange={e => updateArrayItem(setExperience, index, 'startDate', e.target.value)} />
                          <Input label="End Date" type="month" value={exp.endDate} onChange={e => updateArrayItem(setExperience, index, 'endDate', e.target.value)} />
                        </div>
                        <Textarea label="Description" value={exp.description} onChange={e => updateArrayItem(setExperience, index, 'description', e.target.value)} />
                      </div>
                    ))}
                    <button onClick={() => addArrayItem(setExperience, { title: '', company: '', startDate: '', endDate: '', description: '' })} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"><Plus size={16} /> Add Experience</button>
                  </div>
                </Card>

                <Card title="Projects" icon={Code}>
                  <div className="space-y-4">
                    {projects.map((proj, index) => (
                      <div key={index} className="p-4 border border-white/10 rounded-xl space-y-3 bg-white/[0.02] relative group">
                        <button onClick={() => removeArrayItem(setProjects, index)} className="absolute top-3 right-3 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="lg:col-span-2"><Input label="Project Name" value={proj.name} onChange={e => updateArrayItem(setProjects, index, 'name', e.target.value)} /></div>
                          <div className="lg:col-span-2"><Input label="Tech Stack" value={proj.tech} onChange={e => updateArrayItem(setProjects, index, 'tech', e.target.value)} /></div>
                          <div className="lg:col-span-2"><Input label="GitHub Link" value={proj.github} onChange={e => updateArrayItem(setProjects, index, 'github', e.target.value)} /></div>
                          <div className="lg:col-span-2"><Input label="Live Link" value={proj.live} onChange={e => updateArrayItem(setProjects, index, 'live', e.target.value)} /></div>
                        </div>
                        <Textarea label="Description" value={proj.description} onChange={e => updateArrayItem(setProjects, index, 'description', e.target.value)} />
                      </div>
                    ))}
                    <button onClick={() => addArrayItem(setProjects, { name: '', tech: '', description: '', github: '', live: '' })} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"><Plus size={16} /> Add Project</button>
                  </div>
                </Card>

                <Card title="Education" icon={GraduationCap}>
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="p-4 border border-white/10 rounded-xl space-y-3 bg-white/[0.02] relative group">
                        <button onClick={() => removeArrayItem(setEducation, index)} className="absolute top-3 right-3 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div className="lg:col-span-2"><Input label="Degree" value={edu.degree} onChange={e => updateArrayItem(setEducation, index, 'degree', e.target.value)} /></div>
                          <div className="lg:col-span-3"><Input label="Institution" value={edu.institution} onChange={e => updateArrayItem(setEducation, index, 'institution', e.target.value)} /></div>
                          <Input
  label="Start Year"
  type="date"
  value={edu.startYear}
  onChange={e =>
    updateArrayItem(setEducation, index, 'startYear', e.target.value)
  }
/>

<Input
  label="End Year"
  type="date"
  min={edu.startYear}
  value={edu.endYear}
  onChange={e =>
    updateArrayItem(setEducation, index, 'endYear', e.target.value)
  }
/>
                          <Input
  label="CPI"
  type="number"
  min="0"
  max="10"
  step="0.01"
  value={edu.gpa}
  onChange={e => {
    const value = parseFloat(e.target.value);
    if (value >= 0 && value <= 10) {
      updateArrayItem(setEducation, index, 'gpa', value);
    }
  }}
/>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addArrayItem(setEducation, { degree: '', institution: '', startYear: '', endYear: '', gpa: '' })} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"><Plus size={16} /> Add Education</button>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1 space-y-5">
                    <Card title="Certifications" icon={Award}>
                      <div className="space-y-3">
                        {certifications.map((cert, index) => (
                          <div key={index} className="p-3 border border-white/10 rounded-lg space-y-2 bg-white/[0.02] relative group">
                            <button onClick={() => removeArrayItem(setCertifications, index)} className="absolute top-2 right-2 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                            <Input label="Name" value={cert.name} onChange={e => updateArrayItem(setCertifications, index, 'name', e.target.value)} />
                            <Input label="Issuer" value={cert.issuer} onChange={e => updateArrayItem(setCertifications, index, 'issuer', e.target.value)} />
                            <Input label="Year" type="number" value={cert.year} onChange={e => updateArrayItem(setCertifications, index, 'year', e.target.value)} />
                          </div>
                        ))}
                        <button onClick={() => addArrayItem(setCertifications, { name: '', issuer: '', year: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"><Plus size={14} /> Add Cert</button>
                      </div>
                    </Card>

                    <Card title="Languages" icon={Languages}>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input placeholder="e.g. English" value={languageInput} onChange={e => setLanguageInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && languageInput.trim()) { e.preventDefault(); addArrayItem(setLanguages, languageInput.trim()); setLanguageInput(''); } }} />
                          </div>
                          <button onClick={() => { if (languageInput.trim()) { addArrayItem(setLanguages, languageInput.trim()); setLanguageInput(''); } }} className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg flex items-center justify-center transition-all"><Plus size={16} /></button>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1">
                          {languages.map((lang, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md flex items-center justify-between text-xs">
                              {lang}
                              <button onClick={() => removeArrayItem(setLanguages, index)} className="text-white/40 hover:text-white transition-colors"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="md:col-span-2">
                    <Card title="Achievements" icon={Trophy}>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <Textarea placeholder="Describe your achievement..." value={achievementInput} onChange={e => setAchievementInput(e.target.value)} />
                          <button onClick={() => { if (achievementInput.trim()) { addArrayItem(setAchievements, achievementInput.trim()); setAchievementInput(''); } }} className="bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-sm font-medium self-end px-4"><Plus size={16} /> Add Achievement</button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {achievements.map((ach, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg flex items-start justify-between text-sm gap-4">
                              <p className="flex-1 text-white/80 text-xs leading-relaxed">{ach}</p>
                              <button onClick={() => removeArrayItem(setAchievements, index)} className="text-white/40 hover:text-white transition-colors mt-0.5"><X size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {isResumeValid && (
  <div className="flex justify-center pt-6">
                  <motion.button
                    whileHover={isResumeValid ? { scale: 1.02 } : {}}
                    whileTap={isResumeValid ? { scale: 0.98 } : {}}
                    onClick={isResumeValid ? handleCompile : undefined}
                    disabled={!isResumeValid}
                    className={`px-8 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2.5 transition-colors shadow-2xl ${isResumeValid ? "bg-white text-[#050b14] hover:bg-blue-400" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
                  >
                    Compile Resume <Sparkles size={20} />
                  </motion.button>
                </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="stage2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                // Fix 1: Use h-auto on smaller screens to allow stacking, and fixed height only on extra-large screens
                className="h-[calc(100vh-80px)] w-full grid grid-cols-1 xl:grid-cols-12 gap-6"
              >
                {/* --- RESUME PREVIEW PANEL --- */}
                {/* Fix 2: Give minimum heights for when columns stack on smaller screens */}
                <div className="xl:col-span-8 min-h-[600px] xl:min-h-0 h-full flex flex-col bg-[#0b1320] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
                  
                  {/* Fix 3: Moved buttons into a proper Flex Header instead of absolute positioning overlapping the resume */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
                    <button onClick={() => setStage(1)} className="bg-white/5 p-2 rounded-xl text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2">
                      <ChevronLeft size={20} /> <span className="text-sm font-medium hidden sm:inline">Back to Editor</span>
                    </button>
                    <button onClick={handleDownload} className="bg-blue-600/90 px-4 py-2 rounded-xl text-white hover:bg-blue-500 shadow-lg transition-all flex items-center gap-2 text-sm font-medium">
                      <Download size={18} /> Download HTML
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 flex justify-center items-start bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_80%)]">
                   <iframe
  title="resume-preview"
  className="w-full max-w-[800px] h-[29.7cm] bg-white shadow-2xl border-0"
  srcDoc={`
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            margin:0;
            padding:20px;
            background:white;
            font-family: Inter, sans-serif;
          }
        </style>
      </head>
      <body>
        ${resumeHTML}
      </body>
    </html>
  `}
/>
                  </div>
                </div>

                {/* --- AI CHAT PANEL --- */}
                <div className="xl:col-span-4 h-[500px] xl:h-full flex flex-col bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
                  
                  {/* Fix 5: Added shrink-0 to prevent headers/footers from squishing when chat fills up */}
                  <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-bold">AI Resume Editor</h3>
                      <p className="text-xs text-white/60">Powered by ElevateAI</p>
                    </div>
                  </div>

                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-white/90 rounded-bl-none border border-white/10'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl space-y-3 shrink-0">
                    <div className="relative flex items-center">
                      <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatCompile()} placeholder="e.g. Add React to my skills..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all" />
                      <button onClick={handleChatCompile} className="absolute right-2 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Send size={16} /></button>
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleChatCompile} className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 text-sm">
                      <Cpu size={16} /> Execute AI Updates
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}} />
    </div>
  );
}