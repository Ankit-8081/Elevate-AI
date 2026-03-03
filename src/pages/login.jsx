import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Icons = {
  User: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Linkedin: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const InputField = ({ icon: Icon, type = "text", name, placeholder, value, onChange, error, toggleIcon, onToggle }) => (
  <div className="group space-y-1">
    <div className={`relative flex items-center bg-[#0f172a]/50 backdrop-blur-sm border transition-all duration-300 rounded-lg overflow-hidden
      ${error ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-cyan-900/30 group-hover:border-cyan-500/50 group-focus-within:border-cyan-400 group-focus-within:shadow-[0_0_15px_rgba(6,182,212,0.3)]"}
    `}>
      <div className="pl-4 text-cyan-500/70 group-focus-within:text-cyan-400">
        <Icon />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none font-mono"
        autoComplete="off"
      />
      {toggleIcon && (
        <button type="button" onClick={onToggle} className="pr-4 text-cyan-500/50 hover:text-cyan-300 transition-colors">
          {toggleIcon}
        </button>
      )}
    </div>
    {error && <p className="text-red-400 text-[10px] tracking-wider pl-1 font-mono animate-pulse">{`> ${error}`}</p>}
  </div>
);

function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [form, setForm] = useState({ name: "", linkedin: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    let err = {};
    if (!form.email) err.email = "MISSING_CREDENTIAL";
    else if (form.email !== "1000" && !/\S+@\S+\.\S+/.test(form.email)) err.email = "INVALID_SYNTAX";
    if (!form.password) err.password = "KEY_REQUIRED";
    if (isSignup) {
      if (!form.name) err.name = "IDENTITY_REQUIRED";
      if (!form.linkedin) err.linkedin = "LINK_REQUIRED";
    }
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignup) {
      const err = validate();
      setErrors(err);
      if (Object.keys(err).length === 0) {
        setErrors({ general: "Sign up is disabled in this demo. Please use login with ID 1000 and password 3000" });
      }
      return;
    }

    // Login validation
    const err = validate();
    setErrors(err);

    if (form.email !== "1000" || form.password !== "3000") {
      setErrors(prev => ({ ...prev, password: "Invalid ID or Password" }));
      return;
    }

    if (Object.keys(err).length > 0) return;

    // Fake successful login
    const fakeUser = {
      id: "1000",
      name: "Aayush",
      email: "demo@elevate.ai",
      role: "Pro Member",
      lastLogin: new Date().toISOString()
    };

    localStorage.setItem("user", JSON.stringify(fakeUser));

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b14] text-slate-200 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`
        }}
      ></div>

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600/20 blur-[120px] rounded-full animate-pulse delay-1000"></div>

      <div className="relative z-10 w-full max-w-[400px] p-1 mx-4">

        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-cyan-500/50 rounded-2xl blur-[2px] opacity-70"></div>

        <div className="relative bg-[#0a111e]/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">

          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 group">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-transparent animate-[spin_4s_linear_infinite]"></div>
              <div className="relative w-12 h-12 flex items-center justify-center text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor" className="opacity-50 animate-pulse"/>
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-slate-400 bg-clip-text text-transparent">
              ELEVATEAI
            </h1>

            <p className="text-[11px] font-mono text-cyan-400/70 mt-2 tracking-[0.2em] uppercase">
              {isSignup ? "Initializing New Identity" : "Secure System Access"}
            </p>
          </div>

          <div className="flex bg-[#0f172a] p-1 rounded-lg mb-8 border border-white/5 relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-cyan-900 to-slate-800 rounded-md transition-all duration-300 ease-out border border-white/10 ${
                isSignup ? "left-[calc(50%+2px)]" : "left-1"
              }`} 
            ></div>
            <button
              onClick={() => { setIsSignup(false); setErrors({}); }}
              className={`flex-1 relative z-10 py-2 text-xs font-semibold tracking-wider transition-colors duration-300 ${!isSignup ? "text-cyan-100" : "text-slate-500 hover:text-slate-300"}`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setIsSignup(true); setErrors({}); }}
              className={`flex-1 relative z-10 py-2 text-xs font-semibold tracking-wider transition-colors duration-300 ${isSignup ? "text-cyan-100" : "text-slate-500 hover:text-slate-300"}`}
            >
              SIGNUP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`space-y-4 transition-all duration-500 ease-in-out overflow-hidden ${isSignup ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <InputField 
                icon={Icons.User} 
                name="name" 
                placeholder="UserName" 
                value={form.name} 
                onChange={handleChange} 
                error={errors.name} 
              />
              <InputField 
                icon={Icons.Linkedin} 
                name="linkedin" 
                placeholder="LinkedIn Id" 
                value={form.linkedin} 
                onChange={handleChange} 
                error={errors.linkedin} 
              />
            </div>

            <InputField 
              icon={Icons.Mail} 
              name="email" 
              placeholder="ID (use 1000)" 
              value={form.email} 
              onChange={handleChange} 
              error={errors.email} 
            />

            <InputField 
              icon={Icons.Lock} 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password (use 3000)" 
              value={form.password} 
              onChange={handleChange} 
              error={errors.password}
              toggleIcon={showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              onToggle={() => setShowPassword(!showPassword)}
            />

            {errors.general && (
              <p className="text-red-400 text-xs text-center mt-2 font-mono animate-pulse">
                {errors.general}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full py-3.5 mt-6 rounded-lg font-bold tracking-widest text-xs uppercase overflow-hidden transition-all duration-300
                ${loading ? "bg-slate-800 cursor-wait" : "bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"}
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-300/30 border-t-cyan-100 rounded-full animate-spin"></div>
                  <span className="text-cyan-100 animate-pulse">Verifying...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2 text-white">
                  <span>{isSignup ? "Initialize" : "Connect"}</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300"><Icons.ChevronRight /></span>
                </div>
              )}
              
              {!loading && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Secured by
              <span className="text-cyan-500 font-bold ml-1 cursor-pointer hover:text-cyan-400 hover:underline transition-all">
                 Runtime Terror™
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;