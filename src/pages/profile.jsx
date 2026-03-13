import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Camera, Edit2, Check, X,
  Linkedin, Github, Globe, Twitter, Code, Shield, Bell,
  Lock, Briefcase, Target, Award, FileText, LayoutDashboard,
  LogOut, Settings, BarChart3, UploadCloud, BookOpen, Sparkles,
  GraduationCap, Plus, Trash2, Image as ImageIcon
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import axios from "axios";

// --- UI COMPONENTS ---

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-blue-500/20 rounded-lg">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <h3 className="text-xl font-semibold text-white/90">{title}</h3>
  </div>
);

const EditableInput = ({ label, value, setValue, icon: Icon, type = "text", disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="group relative mb-4">
      <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-500">
          <Icon size={16} />
        </div>
        <input
          disabled={!isEditing || disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={type}
          className={`w-full bg-black/20 border ${isEditing ? 'border-blue-500/50' : 'border-white/5'
            } rounded-xl py-2.5 pl-10 pr-12 text-gray-200 disabled:opacity-50`}
        />
        {!disabled && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute right-2 p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
          >
            {isEditing ? <Check size={16} className="text-green-400" /> : <Edit2 size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};

const StatsPanel = () => {
  const stats = [
    { label: 'Projects Built', value: '07', borderColor: 'border-l-amber-500', shadow: 'shadow-amber-500/10' },
    { label: 'Modules Completed', value: '21', borderColor: 'border-l-purple-500', shadow: 'shadow-purple-500/10' },
    { label: 'Skills Mastered', value: '18', borderColor: 'border-l-emerald-500', shadow: 'shadow-emerald-500/10' },
    { label: 'Certifications', value: '03', borderColor: 'border-l-pink-500', shadow: 'shadow-pink-500/10' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <GlassCard
          key={i}
          className={`flex flex-col items-center justify-center py-5 border-l-4 ${stat.borderColor} ${stat.shadow} hover:scale-[1.02] transition-transform cursor-default`}
        >
          <span className="text-2xl font-black text-white tracking-tight">{stat.value}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.12em] mt-1.5">
            {stat.label}
          </span>
        </GlassCard>
      ))}
    </div>
  );
};

const ProfessionalLinks = ({ links, setLinks }) => {
  const addLink = () => {
    setLinks([...links, { id: Date.now(), platform: '', url: '' }]);
  };

  const removeLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const updateLink = (id, field, value) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-6">
        <SectionHeader icon={Globe} title="Professional Links" />
        <button
          onClick={addLink}
          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-black/20 border border-white/5 rounded-xl p-3 relative"
            >
              <div className="flex items-center justify-between mb-1">
                <input
                  value={link.platform}
                  onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                  placeholder="Platform (e.g. LinkedIn, Github)"
                  className="bg-transparent text-[10px] font-bold text-blue-400 uppercase tracking-widest focus:outline-none w-full"
                />
                <button
                  onClick={() => removeLink(link.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                placeholder="https://..."
                className="bg-transparent text-sm text-gray-300 w-full focus:outline-none"
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {links.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-4">No links added yet.</p>
        )}
      </div>
    </GlassCard>
  );
};

// --- MAIN PAGE ---

const ProfilePage = () => {
  const [is2FA, setIs2FA] = useState(true);
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [resume, setResume] = useState(null);

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [current_role, setCurrentRole] = useState("");
  const [target_role, setTargetRole] = useState("");
  const [links, setLinks] = useState([]);

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const data = res.data;
        setUser(data);
        setName(data.name || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setCurrentRole(data.current_role || "");
        setTargetRole(data.target_role || "");
        setLinks(Array.isArray(data.professional_links) ? data.professional_links : []);
        setImage(data.profile_image || null);
        setCoverImage(data.cover_image || null);
        setResume(data.resume || null);
      })
      .catch(err => console.error("Error fetching user:", err));
  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_BASE}/profile/update`,
        { name, username, phone, bio, current_role, target_role, professional_links: links },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile saved successfully 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  const uploadFile = async (file, endpoint, setter) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      // Extract the key from response (e.g., res.data.resume or res.data.profile_image)
      const dataKey = Object.keys(res.data)[0];
      setter(res.data[dataKey]);
    } catch (err) {
      console.error(`Upload to ${endpoint} failed`, err);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profile") uploadFile(file, "/profile/upload-image", setImage);
    if (type === "cover") uploadFile(file, "/profile/upload-cover", setCoverImage);
    if (type === "resume") uploadFile(file, "/profile/upload-resume", setResume);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-300 selection:bg-blue-500/30">
      <Sidebar />

      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto pt-4 pb-20 w-full">

          {/* Profile Header Section */}
          <div className="relative mb-8">
            <div className="group relative h-48 w-full rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black">
              {coverImage && (
                <img
                  src={`http://127.0.0.1:8000${coverImage}`}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Cover Image Upload Button */}
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              >
                <Camera size={14} /> Change Cover
              </button>
              <input ref={coverInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
            </div>

            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#050b14] shadow-2xl bg-gray-800 flex items-center justify-center">
                  {image ? (
                    <img src={`http://127.0.0.1:8000${image}`} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-500" />
                  )}
                </div>
                <button onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl">
                  <Camera className="text-white" />
                </button>
                <input ref={profileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" />
              </div>

              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white mb-2">{username}</h1>
                <div className="inline-flex flex-col gap-2 p-4 rounded-2xl bg-[#0f172a] border border-blue-500/40 shadow-xl">
                  <p className="text-blue-400 font-bold text-sm flex items-center gap-2">
                    <Code size={14} /> {current_role || "Professional"}
                  </p>
                  <div className="flex gap-3 text-[11px] font-bold tracking-wide uppercase">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                      <Check size={12} strokeWidth={3} /> Account Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-28 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <StatsPanel />

              <GlassCard>
                <SectionHeader icon={User} title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <EditableInput label="Full Name" value={name} setValue={setName} icon={User} />
                  <EditableInput label="Username" value={username} setValue={setUsername} icon={User} />
                  <EditableInput label="Email Address" value={user?.email || ""} icon={Mail} type="email" disabled={true} />
                  <EditableInput label="Phone Number" value={phone} setValue={setPhone} icon={Phone} />
                </div>
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Bio / About Me</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-gray-200 min-h-[100px] focus:border-blue-500/40 outline-none transition-colors"
                  />
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeader icon={Briefcase} title="Career Profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
                  <EditableInput label="Current Role" value={current_role} setValue={setCurrentRole} icon={Briefcase} />
                  <EditableInput label="Target Role" value={target_role} setValue={setTargetRole} icon={Target} />
                </div>
                <div
                  onClick={() => resumeInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/30 transition-colors group cursor-pointer text-center"
                >
                  <UploadCloud className="w-8 h-8 mx-auto text-gray-500 group-hover:text-blue-400 mb-2 transition-colors" />
                  <p className="text-sm text-gray-400">
                    {resume ? `Uploaded: ${resume.split('/').pop()}` : "Upload your latest Resume"}
                  </p>
                  <span className="text-blue-400 text-sm">Browse File</span>
                  <input ref={resumeInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} />
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <ProfessionalLinks links={links} setLinks={setLinks} />

              <GlassCard>
                <SectionHeader icon={Shield} title="Security & Settings" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3"><Shield size={18} className="text-blue-400" /><span className="text-sm font-medium">2FA Auth</span></div>
                    <button onClick={() => setIs2FA(!is2FA)} className={`w-10 h-5 rounded-full transition-colors relative ${is2FA ? 'bg-blue-500' : 'bg-gray-700'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${is2FA ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-sm">
                    <Lock size={16} /> Change Password
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={saveProfile}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-all active:scale-95"
        >
          Save Changes
        </button>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050b14; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default ProfilePage;