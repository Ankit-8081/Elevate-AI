import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Camera, Edit2, Check, X,
  Linkedin, Github, Globe, Twitter, Code, Shield, Bell,
  Lock, Briefcase, Target, Award, FileText, LayoutDashboard,
  LogOut, Settings, BarChart3, UploadCloud, BookOpen, Sparkles,
  GraduationCap, Plus, Trash2, Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────────────────────────
   REUSABLE COMPONENTS (unchanged)
───────────────────────────────────────────── */
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
        <div className="absolute left-3 text-gray-500"><Icon size={16} /></div>
        <input
          disabled={!isEditing || disabled}
          value={value}
          onChange={(e) => {
            if (type === "tel") {
              setValue(e.target.value.replace(/\D/g, ""));
            } else {
              setValue(e.target.value);
            }
          }}
          type={type}
          className={`w-full bg-black/20 border ${isEditing ? 'border-blue-500/50' : 'border-white/5'} rounded-xl py-2.5 pl-10 pr-12 text-gray-200 disabled:opacity-50`}
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

const StatsPanel = ({ projects, skills, certifications, modulesCompleted }) => {
  const stats = [
    { label: "Projects Built",     value: projects?.length || 0,       borderColor: "border-l-amber-500",  shadow: "shadow-amber-500/10"  },
    { label: "Modules Completed",  value: modulesCompleted || 0,        borderColor: "border-l-purple-500", shadow: "shadow-purple-500/10" },
    { label: "Skills Mastered",    value: skills?.length || 0,          borderColor: "border-l-emerald-500",shadow: "shadow-emerald-500/10"},
    { label: "Certifications",     value: certifications?.length || 0,  borderColor: "border-l-pink-500",   shadow: "shadow-pink-500/10"   },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <GlassCard key={i} className={`h-full flex flex-col items-center justify-center text-center border-l-4 ${stat.borderColor} ${stat.shadow} hover:scale-[1.02] transition-transform cursor-default`}>
          <span className="text-2xl font-black text-white tracking-tight">{stat.value}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.12em] mt-1.5">{stat.label}</span>
        </GlassCard>
      ))}
    </div>
  );
};

const ProfessionalLinks = ({ links, setLinks, linkedin, setLinkedin, isOwnProfile }) => {
  const [editing, setEditing] = useState({ linkedin: false, portfolio: false });

  const updateLink = (platform, value) => {
    setLinks(prev => {
      const index = prev.findIndex(l => l.platform === platform);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], url: value };
        return updated;
      }
      return [...prev, { platform, url: value }];
    });
  };

  const getUrl = (platform) => {
    const found = links.find(l => l.platform === platform);
    return found ? found.url : "";
  };

  return (
    <GlassCard>
      <SectionHeader icon={Globe} title="Professional Links" />
      <div className="space-y-4">
        {/* LinkedIn */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"><Linkedin size={16} /></div>
          <input
            disabled={!editing.linkedin || !isOwnProfile}
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="LinkedIn Profile URL"
            className={`w-full bg-black/20 border ${editing.linkedin ? "border-blue-500/50" : "border-white/5"} rounded-xl py-2.5 pl-10 pr-12 text-gray-300 disabled:opacity-60`}
          />
          {isOwnProfile && (
            <button
              onClick={() => setEditing(prev => ({ ...prev, linkedin: !prev.linkedin }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
            >
              {editing.linkedin ? <Check size={16} className="text-green-400" /> : <Edit2 size={14} />}
            </button>
          )}
        </div>

        {/* Portfolio */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><Globe size={16} /></div>
          <input
            disabled={!editing.portfolio || !isOwnProfile}
            value={getUrl("portfolio")}
            onChange={(e) => updateLink("portfolio", e.target.value)}
            placeholder="Portfolio Website URL"
            className={`w-full bg-black/20 border ${editing.portfolio ? "border-blue-500/50" : "border-white/5"} rounded-xl py-2.5 pl-10 pr-12 text-gray-300 disabled:opacity-60`}
          />
          {isOwnProfile && (
            <button
              onClick={() => setEditing(prev => ({ ...prev, portfolio: !prev.portfolio }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
            >
              {editing.portfolio ? <Check size={16} className="text-green-400" /> : <Edit2 size={14} />}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────
   DELETE ACCOUNT CONFIRMATION MODAL
───────────────────────────────────────────── */
const DeleteAccountModal = ({ onConfirm, onCancel, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md bg-[#0d1829] border border-red-500/20 rounded-2xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
    >
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={26} className="text-red-400" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-bold text-white text-center mb-2">Delete Account</h2>
      <p className="text-sm text-gray-400 text-center mb-1">
        This action is <span className="text-red-400 font-semibold">permanent and irreversible.</span>
      </p>
      <p className="text-sm text-gray-500 text-center mb-6">
        All your data — profile, resume, roadmap, skills, and history — will be deleted forever.
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-gray-300 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 border border-red-500/30 text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          {loading ? "Deleting..." : "Yes, Delete My Account"}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────────── */
const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isOwnProfile = !id || String(currentUser?.id) === String(id);

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
  const [linkedin, setLinkedin] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Delete account state ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadUser = (data) => {
    setUser(data);
    setName(data.name || "");
    setUsername(data.username || "");
    setPhone(data.phone || "");
    setBio(data.bio || "");
    setCurrentRole(data.current_role || "");
    setTargetRole(data.target_role || "");
    setLinks(Array.isArray(data.professional_links) ? data.professional_links : []);
    setLinkedin(data.linkedin || "");
    setImage(data.profile_image || null);
    setCoverImage(data.cover_image || null);
    setResume(data.resume || null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (id) {
      axios.get(`${API}/user/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => loadUser(res.data))
        .catch(err => console.error("Error fetching user:", err));
    } else if (token) {
      axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => loadUser(res.data))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [id, API]);

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      await axios.post(
        `${API}/profile/update`,
        { name, username, phone, bio, current_role, target_role, linkedin, professional_links: links },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const current_password = prompt("Enter current password");
    const new_password = prompt("Enter new password");
    const confirm_password = prompt("Confirm new password");
    if (!current_password || !new_password || !confirm_password) return;
    if (new_password !== confirm_password) { alert("Passwords do not match"); return; }
    if (new_password.length < 6) { alert("Password must be at least 6 characters"); return; }
    try {
      await axios.post(
        `${API}/change-password`,
        { current_password, new_password },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Password updated successfully");
    } catch (err) {
      alert(err.response?.data?.detail || "Error updating password");
    }
  };

  // ── Delete account handler ──
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/profile/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Delete account failed:", err);
      alert(err.response?.data?.detail || "Failed to delete account. Please try again.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const uploadFile = async (file, endpoint, setter) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
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
    if (type === "cover")   uploadFile(file, "/profile/upload-cover", setCoverImage);
    if (type === "resume")  uploadFile(file, "/profile/upload-resume", setResume);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-300 selection:bg-blue-500/30">
      <Sidebar />

      <main style={{ marginLeft: "var(--sidebar-width)" }} className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto pt-4 pb-20 w-full">

          {/* ── Profile Header ── */}
          <div className="relative mb-8">
            <div className="group relative h-48 w-full rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black">
              {coverImage && (
                <img src={`${API}${coverImage}`} alt="Cover" className="w-full h-full object-cover" />
              )}
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                  >
                    <Camera size={14} /> Change Cover
                  </button>
                  <input ref={coverInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "cover")} accept="image/*" />
                </>
              )}
            </div>

            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#050b14] shadow-2xl bg-gray-800 flex items-center justify-center">
                  {image ? (
                    <img src={`${API}${image}`} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">
                      {username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl"
                    >
                      <Camera className="text-white" />
                    </button>
                    <input ref={profileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "profile")} accept="image/*" />
                  </>
                )}
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

          {/* ── Main Grid ── */}
          <div className="mt-28 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-6">
              <StatsPanel
                projects={user?.projects}
                skills={user?.skills}
                certifications={user?.certifications}
                modulesCompleted={user?.modules_completed}
              />

              {/* Personal Info */}
              <GlassCard>
                <SectionHeader icon={User} title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <EditableInput label="Full Name"      value={name}            setValue={setName}     icon={User}  disabled={!isOwnProfile} />
                  <EditableInput label="Username"       value={username}        setValue={setUsername} icon={User}  disabled={!isOwnProfile} />
                  <EditableInput label="Email Address"  value={user?.email || ""} icon={Mail} type="email" disabled={true} />
                  <EditableInput label="Phone Number"   value={phone}           setValue={setPhone}    icon={Phone} type="tel" disabled={!isOwnProfile} />
                </div>
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Bio / About Me</label>
                  <textarea
                    value={bio}
                    disabled={!isOwnProfile}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-gray-200 min-h-[100px] focus:border-blue-500/40 outline-none transition-colors"
                  />
                </div>
              </GlassCard>

              {/* Career Profile */}
              <GlassCard>
                <SectionHeader icon={Briefcase} title="Career Profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
                  <EditableInput label="Current Role" value={current_role} setValue={setCurrentRole} icon={Briefcase} disabled={!isOwnProfile} />
                  <EditableInput label="Target Role"  value={target_role}  setValue={setTargetRole}  icon={Target}   disabled={!isOwnProfile} />
                </div>
                <div
                  onClick={() => isOwnProfile && !resume && resumeInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/30 transition-colors group cursor-pointer text-center"
                >
                  <UploadCloud className="w-8 h-8 mx-auto text-gray-500 group-hover:text-blue-400 mb-3 transition-colors" />
                  {!resume ? (
                    <>
                      <p className="text-sm text-gray-400">Upload your latest Resume</p>
                      <span className="text-blue-400 text-sm">Browse File</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-green-400 font-semibold">Uploaded: {resume.split("/").pop()}</p>
                      <div className="flex gap-3 mt-2">
                        <a href={`${API}${resume}`} target="_blank" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition">
                          Download
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); setResume(null); resumeInputRef.current.click(); }}
                          className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg transition"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  )}
                  <input ref={resumeInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, "resume")} />
                </div>
              </GlassCard>
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 space-y-6">
              <ProfessionalLinks
                links={links}
                setLinks={setLinks}
                linkedin={linkedin}
                setLinkedin={setLinkedin}
                isOwnProfile={isOwnProfile}
              />

              {/* Security & Settings */}
              <GlassCard>
                <SectionHeader icon={Shield} title="Security & Settings" />
                <div className="space-y-3">
                  {isOwnProfile && (
                    <>
                      {/* Change Password */}
                      <button
                        onClick={handleChangePassword}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-sm"
                      >
                        <Lock size={16} /> Change Password
                      </button>

                      {/* Divider */}
                      <div className="h-px bg-white/[0.06]" />

                      {/* Delete Account */}
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20 hover:border-red-500/40 text-sm text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} /> Delete Account
                      </button>
                    </>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* ── Save Changes FAB ── */}
      {isOwnProfile && (
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-all active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteAccountModal
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteModal(false)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 right-8 bg-[#0f172a] border border-green-500/30 text-green-400 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <Check size={20} className="text-green-400" />
            <div>
              <p className="font-semibold text-sm">Profile Saved</p>
              <p className="text-xs text-gray-400">Your profile has been updated successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
