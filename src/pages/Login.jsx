
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;
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
  <svg
    className="w-5 h-5 text-cyan-400"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M19 0h-14C2.239 0 0 2.239 0 5v14c0 2.761 
    2.239 5 5 5h14c2.761 0 5-2.239 
    5-5V5c0-2.761-2.239-5-5-5zM7.12 
    20.452H3.56V9h3.56v11.452zM5.34 
    7.433a2.065 2.065 0 1 
    1 0-4.13 2.065 2.065 0 0 
    1 0 4.13zM20.452 
    20.452h-3.56v-5.569c0-1.329-.026-3.04-1.852-3.04-1.853 
    0-2.137 1.446-2.137 
    2.945v5.664h-3.56V9h3.417v1.561h.049c.476-.9 
    1.637-1.852 3.368-1.852 3.6 0 4.263 
    2.368 4.263 5.451v6.292z" />
  </svg>
),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const InputField = ({ icon: Icon, type="text", name, placeholder, value, onChange, error, toggleIcon, onToggle }) => (
  <div className="group space-y-1">
    <div className={`relative flex items-center bg-[#0f172a]/50 backdrop-blur-sm border transition-all duration-300 rounded-lg overflow-hidden
      ${error ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-cyan-900/30 group-hover:border-cyan-500/50 group-focus-within:border-cyan-400 group-focus-within:shadow-[0_0_15px_rgba(6,182,212,0.3)]"}`}>
      
      <div className="pl-4 text-cyan-500/70">
        <Icon />
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none font-mono"
      />

      {toggleIcon && (
        <button type="button" onClick={onToggle} className="pr-4 text-cyan-500/50 hover:text-cyan-300">
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

  const [form, setForm] = useState({
    name:"",
    linkedin:"",
    email:"",
    password:""
  });

  const [errors, setErrors] = useState({});

  useEffect(()=>{
    const handleMouseMove = (e)=>{
      setMousePos({
        x:(e.clientX / window.innerWidth) * 20 - 10,
        y:(e.clientY / window.innerHeight) * 20 - 10
      });
    };

    window.addEventListener("mousemove",handleMouseMove);
    return ()=>window.removeEventListener("mousemove",handleMouseMove);
  },[]);

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
    if(errors[e.target.name]) setErrors({...errors,[e.target.name]:null});
  };

  const validate = () => {
  let err = {};

  if (!form.email) {
    err.email = "EMAIL_REQUIRED";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    err.email = "INVALID_EMAIL_FORMAT";
  }

  if (!form.password) {
    err.password = "PASSWORD_REQUIRED";
  } else if (form.password.length < 8) {
    err.password = "PASSWORD_MIN_8_CHARACTERS";
  }

  if (isSignup) {
    if (!form.name) err.name = "NAME_REQUIRED";
    if (!form.linkedin) err.linkedin = "LINKEDIN_REQUIRED";
  }

  return err;
};

  const handleSubmit = async (e)=>{

    e.preventDefault();

    const err = validate();
    setErrors(err);

    if(Object.keys(err).length>0) return;

    try{

      setLoading(true);

      if(isSignup){

        await axios.post(`${API}/signup`,{
          name: form.name,
          linkedin: form.linkedin,
          email: form.email,
          password: form.password
        });

        setErrors({general:"Signup successful. Please login."});
        setForm({name:"", linkedin:"", email:"", password:""});
        setIsSignup(false);
        return;
      }

      const res = await axios.post(`${API}/login`,{
        email:form.email,
        password:form.password
      });

      const {token,user} = res.data;

      localStorage.setItem("token",token);
      localStorage.setItem("user",JSON.stringify(user));

      navigate("/dashboard");

    }catch(error){

      if(error.response){
        setErrors({
                    general: error.response?.data?.detail || "Authentication failed"
                  });
      }else{
        setErrors({general:"Server unreachable"});
      }

    }finally{
      setLoading(false);
    }
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
              placeholder="Email address"
              value={form.email} 
              onChange={handleChange} 
              error={errors.email} 
            />

            <InputField 
              icon={Icons.Lock} 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password (min 8 characters)"
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
console.log("API:", API);

export default Login;

