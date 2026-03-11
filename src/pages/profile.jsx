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

const EditableInput = ({ label, value, icon: Icon, type = "text" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div className="group relative mb-4">
      <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-500">
          <Icon size={16} />
        </div>
        <input
          disabled={!isEditing}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          type={type}
          className={`w-full bg-black/20 border ${isEditing ? 'border-blue-500/50' : 'border-white/5'} rounded-xl py-2.5 pl-10 pr-12 text-gray-200 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500/30`}
        />
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="absolute right-2 p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          {isEditing ? <Check size={16} className="text-green-400" /> : <Edit2 size={14} />}
        </button>
      </div>
    </div>
  );
};

const StatsPanel = () => {
  const stats = [
    { label: 'Courses Done', value: '24', borderColor: 'border-l-amber-500', shadow: 'shadow-amber-500/10' },
    { label: 'Learning Streak', value: '48', borderColor: 'border-l-purple-500', shadow: 'shadow-purple-500/10' },
    { label: 'Networks', value: '06', borderColor: 'border-l-emerald-500', shadow: 'shadow-emerald-500/10' },
    { label: 'Profile Views', value: '1.2k', borderColor: 'border-l-pink-500', shadow: 'shadow-pink-500/10' },
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

const DynamicProfessionalLinks = () => {
  const [links, setLinks] = useState([
    { id: 1, platform: 'LinkedIn', url: 'linkedin.com/in/user' },
    { id: 2, platform: 'Portfolio', url: 'my-work.com' }
  ]);

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
                  placeholder="Platform (e.g. Behance, Github)"
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
  
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://127.0.0.1:8000/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(err => console.log(err));
  }, []);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'profile') setImage(url);
      else setCoverImage(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-300 selection:bg-blue-500/30">
      <Sidebar />
      
      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto pt-4 pb-20 w-full">
          
          {/* Profile Header Section */}
          <div className="relative mb-8">
            {/* Cover Image Container */}
            <div className="group relative h-48 w-full rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black">
              {coverImage && (
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              )}
              
              {/* Cover Image Upload Button */}
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              >
                <Camera size={14} />
                Change Cover
              </button>
              <input ref={coverInputRef} type="file" className="hidden" onChange={(e) => handleImageChange(e, 'cover')} accept="image/*" />
            </div>

            {/* Profile Avatar & Info Overlay */}
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#050b14] shadow-2xl bg-gray-800 flex items-center justify-center">
                  {image ? <img src={image} className="w-full h-full object-cover" /> : <User size={48} className="text-gray-500" />}
                </div>
                <button onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl">
                  <Camera className="text-white" />
                </button>
                <input ref={profileInputRef} type="file" className="hidden" onChange={(e) => handleImageChange(e, 'profile')} accept="image/*" />
              </div>

              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white mb-2">{user?.name || "Alex Rivest"}</h1>
                <div className="inline-flex flex-col gap-2 p-4 rounded-2xl bg-[#0f172a] border border-blue-500/40 shadow-xl">
                  <p className="text-blue-400 font-bold text-sm flex items-center gap-2">
                    <Code size={14} /> {user?.role || "Senior Professional"}
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
                  <EditableInput label="Full Name" value={user?.name || "Alex Rivest"} icon={User} />
                  <EditableInput label="Username" value="alex_pro" icon={User} />
                  <EditableInput label="Email Address" value={user?.email || "alex@career.io"} icon={Mail} type="email" />
                  <EditableInput label="Phone Number" value="+1 (555) 000-0000" icon={Phone} />
                </div>
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Bio / About Me</label>
                  <textarea className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-gray-200 min-h-[100px] focus:outline-none focus:border-blue-500/50" placeholder="Describe your professional journey..." />
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeader icon={Briefcase} title="Career Profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
                  <EditableInput label="Current Role" value="Senior Specialist" icon={Briefcase} />
                  <EditableInput label="Target Role" value="Lead Director" icon={Target} />
                </div>
                <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/30 transition-colors group cursor-pointer text-center">
                  <UploadCloud className="w-8 h-8 mx-auto text-gray-500 group-hover:text-blue-400 mb-2 transition-colors" />
                  <p className="text-sm text-gray-400">Upload your latest Resume/Portfolio <span className="text-blue-400">browse</span></p>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <DynamicProfessionalLinks />
              
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