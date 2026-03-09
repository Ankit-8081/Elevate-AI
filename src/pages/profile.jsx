import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Camera, Edit2, Check, X, 
  Linkedin, Github, Globe, Twitter, Code, Shield, Bell, 
  Lock, Briefcase, Target, Award, FileText, LayoutDashboard,
  LogOut, Settings, BarChart3, UploadCloud
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import axios from "axios";


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

const ProfileHeader = ({ user }) => {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className="relative mb-8">
      <div className="h-48 w-full bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black rounded-3xl border border-white/10" />
      
      <div className="absolute -bottom-16 left-8 flex items-end gap-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#050b14] shadow-2xl bg-gray-800">
            {image ? (
              <img src={image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User size={48} />
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl"
          >
            <Camera className="text-white" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>

        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user ? user.name : "Alex Rivest"}
          </h1>

          <div className="inline-flex flex-col gap-2 p-4 rounded-2xl bg-[#0f172a] border border-blue-500/40 shadow-xl">
            <p className="text-blue-400 font-bold text-sm flex items-center gap-2">
              <Code size={14} className="text-blue-400" />
              {user ? user.role || "Senior AI Engineer" : "Senior AI Engineer"}
            </p>

            <div className="flex gap-3 text-[11px] font-bold tracking-wide uppercase">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                <Check size={12} strokeWidth={3} /> Account Verified
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10">
                Joined {user?.joined || "March 2024"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsPanel = () => {
  const stats = [
    { label: 'Applications', value: '124', borderColor: 'border-l-blue-500', shadow: 'shadow-blue-500/5' },
    { label: 'Interviews', value: '12', borderColor: 'border-l-purple-500', shadow: 'shadow-purple-500/5' },
    { label: 'Skills Score', value: '98%', borderColor: 'border-l-emerald-500', shadow: 'shadow-emerald-500/5' },
    { label: 'Profile Views', value: '1.2k', borderColor: 'border-l-pink-500', shadow: 'shadow-pink-500/5' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <GlassCard 
          key={i} 
          className={`flex flex-col items-center justify-center py-5 border-l-4 ${stat.borderColor} ${stat.shadow}`}
        >
          <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.1em] mt-1.5">
            {stat.label}
          </span>
        </GlassCard>
      ))}
    </div>
  );
};

const ProfilePage = () => {
  const [is2FA, setIs2FA] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://127.0.0.1:8000/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUser(res.data);
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-300 selection:bg-blue-500/30">
      <Sidebar />
      
      <main className="lg:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto pt-4 pb-20">
          
          <ProfileHeader user={user} />

          <div className="mt-28 grid grid-cols-1 lg:grid-cols-12 gap-6">
    
            <div className="lg:col-span-8 space-y-6">
              
              <StatsPanel />

              <GlassCard>
                <SectionHeader icon={User} title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <EditableInput label="Full Name" value="Alex Rivest" icon={User} />
                  <EditableInput label="Username" value="alex_ai_dev" icon={User} />
                  <EditableInput label="Email Address" value="alex@aether.io" icon={Mail} type="email" />
                  <EditableInput label="Phone Number" value="+1 (555) 000-0000" icon={Phone} />
                  <EditableInput label="Location" value="San Francisco, CA" icon={MapPin} />
                </div>
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Bio / About Me</label>
                  <textarea 
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-gray-200 min-h-[100px] focus:outline-none focus:border-blue-500/50"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeader icon={Briefcase} title="Career Profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
                  <EditableInput label="Current Role" value="Senior AI Engineer" icon={Briefcase} />
                  <EditableInput label="Target Role" value="Lead AI Architect" icon={Target} />
                </div>
                
                <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/30 transition-colors group cursor-pointer text-center">
                  <UploadCloud className="w-8 h-8 mx-auto text-gray-500 group-hover:text-blue-400 mb-2 transition-colors" />
                  <p className="text-sm text-gray-400">Drag & drop your resume or <span className="text-blue-400">browse</span></p>
                  <p className="text-xs text-gray-600 mt-1">PDF, DOCX (Max 5MB)</p>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-4 space-y-6">
              
              <GlassCard>
                <SectionHeader icon={Globe} title="Professional Links" />
                <div className="space-y-1">
                  <EditableInput label="LinkedIn" value="linkedin.com/in/alex" icon={Linkedin} />
                  <EditableInput label="GitHub" value="github.com/alex-dev" icon={Github} />
                  <EditableInput label="Portfolio" value="alex-rivest.dev" icon={Globe} />
                  <EditableInput label="LeetCode" value="leetcode.com/alex" icon={Code} />
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeader icon={Shield} title="Account Settings" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-blue-400" />
                      <span className="text-sm font-medium">Two-Factor Auth</span>
                    </div>
                    <button 
                      onClick={() => setIs2FA(!is2FA)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${is2FA ? 'bg-blue-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${is2FA ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-purple-400" />
                      <span className="text-sm font-medium">Email Notifications</span>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-blue-500 relative">
                       <div className="absolute top-1 left-6 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-sm">
                    <Lock size={16} />
                    Change Password
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