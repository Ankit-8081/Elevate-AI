import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Zap, Target, Star, Code2, 
  Briefcase, Globe, ArrowRight, Shield, 
  LayoutDashboard, Terminal, Sparkles, Instagram, Linkedin, Twitter, Check
} from 'lucide-react';
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import axios from "axios";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";

const API = import.meta.env.VITE_API_URL;
const GlassCard = ({ children, className = "" }) => (
  <motion.div 
    whileHover={{ 
      y: -5, 
      scale: 1.02,
      boxShadow: "0 0 25px rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.2)"
    }}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'h-[64px] bg-[#050b14]/95 shadow-xl' : 'h-20 bg-transparent'
    } backdrop-blur-md border-b border-white/10`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
       <Link to="/" className="flex items-center gap-3">
       <img
        src={logo}
        alt="Elevate AI"
        className="h-16 w-auto object-contain"
       />
      </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="relative group hover:text-white transition-colors">
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <button className="relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <span className="relative z-10">Sign Up / Log In</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-32 pb-16 px-6 overflow-hidden min-h-[85vh] flex items-center">
    <motion.div 
      animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 8, repeat: Infinity }}
      className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen" 
    />
    <motion.div 
      animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 10, repeat: Infinity }}
      className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen" 
    />

    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
      <FadeIn>
        <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Discover Top Talent. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Rise Through Merit.
          </span>
        </h1>
        <p className="text-base md:text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
          Elevate AI ranks professionals based on real skills and impact, helping companies find the best people faster, without the noise of traditional resumes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
<Link to="/login">
  <button className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
    Get Started 
    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
  </button>
</Link>
          <Link to="/Roadmap2">
  <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-8 py-3 rounded-xl transition-all">
    <Sparkles size={18} className="text-blue-400" /> Blue Collar Jobs
  </button>
</Link>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="relative hidden lg:block h-[400px]">
         <motion.div 
  animate={{ y: [-8, 8, -8] }} 
  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
  className="absolute top-4 right-0 w-72 bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl"
>
  <img 
    src={img1} 
    alt="preview" 
    className="w-full h-auto rounded-lg object-cover"
  />
</motion.div>

         <motion.div 
  animate={{ y: [8, -8, 8] }} 
  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
  className="absolute bottom-12 left-8 w-64 bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl"
>
  <img 
    src={img2} 
    alt="preview" 
    className="w-full h-auto rounded-lg object-cover"
  />
</motion.div>
      </FadeIn>
    </div>
  </section>
);

const Stats = () => {
  const [stats, setStats] = useState([
    { label: "Professionals", value: "...", icon: Users },
    { label: "Projects Built", value: "...", icon: Code2 },
    { label: "Companies", value: "850+", icon: Briefcase },
    { label: "Countries", value: "45", icon: Globe },
  ]);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`);

      setStats([
  {
    label: "Professionals",
    value: `${res.data.totalUsers}+`,
    icon: Users
  },
  {
    label: "Projects Built",
    value: `${res.data.totalProjects}+`,
    icon: Code2
  },
  {
    label: "Skills Verified",
    value: `${res.data.totalSkills}+`,
    icon: Shield
  },
  {
    label: "Top Talent",
    value: "Top 1%",
    icon: Star
  }
]);

    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  fetchStats();
}, []);
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1} className="group flex flex-col items-center text-center">
              <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
                <stat.icon size={22} className="text-blue-500 mb-3" />
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { title: "Merit-Based Ranking", desc: "Our proprietary Elevate Score ranks professionals based on verified skills, eliminating recruitment bias.", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Talent Discovery", desc: "Companies bypass the noise and instantly discover high-performing candidates matched to their needs.", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Skill Challenges", desc: "Prove your abilities in standardized, real-world coding and design environments to validate expertise.", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Project Impact", desc: "Showcase the actual work. We analyze GitHub and deployments to highlight your true technical impact.", icon: LayoutDashboard, color: "text-amber-400", bg: "bg-amber-500/10" }
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-4">Why Elevate AI</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Built for the Doers.</h3>
          <p className="text-slate-400 text-base">We believe talent is evenly distributed, but opportunity is not. We're fixing that by making hiring about what you build.</p>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 relative ${feat.bg}`}>
                  <feat.icon size={20} className={`${feat.color} relative z-10`} />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{feat.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Create Profile", desc: "Connect GitHub, LinkedIn, and your portfolio.", icon: Users, bg: "from-blue-500/20 to-transparent", border: "border-blue-500/30" },
    { title: "Complete Challenges", desc: "Prove your skills with domain assessments.", icon: Code2, bg: "from-purple-500/20 to-transparent", border: "border-purple-500/30" },
    { title: "Build Projects", desc: "Upload verifiable work to increase your score.", icon: Briefcase, bg: "from-emerald-500/20 to-transparent", border: "border-emerald-500/30" },
    { title: "Get Hired", desc: "Climb ranks and get offers from top-tier companies.", icon: Star, bg: "from-amber-500/20 to-transparent", border: "border-amber-500/30" },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">Your journey from creating a profile to landing your dream role.</p>
        </FadeIn>
        <div className="grid md:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1} className="relative z-10 text-center flex flex-col items-center group">
              <div className={`p-8 rounded-2xl bg-gradient-to-br ${step.bg} border ${step.border} backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
                <div className="w-14 h-14 rounded-xl bg-[#050b14] border border-white/10 flex items-center justify-center mb-6 mx-auto shadow-xl relative transition-transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                  <step.icon size={22} className="text-white relative z-10" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#050b14]">
                    {i + 1}
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      desc: "For aspiring talent starting out.",
      features: ["Public Skill Profile", "3 Challenges / month", "Standard Resume Analysis"],
      button: "Start Free",
      highlight: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/mo",
      desc: "Accelerate your career with AI.",
      features: ["Unlimited Challenges", "AI Interview Simulator", "Priority Verification", "Skill Roadmaps"],
      button: "Go Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For high-growth engineering teams.",
      features: ["Talent Pipeline", "Custom Assessments", "Diversity Analytics", "API Access"],
      button: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <FadeIn className="text-center mb-12">
          <h2 className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-4">Pricing Plans</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Invest in Your Future.</h3>
        </FadeIn>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className={`relative h-full p-6 rounded-2xl border transition-all duration-500 ${
                plan.highlight 
                  ? 'bg-blue-600/10 border-blue-500/40 shadow-lg' 
                  : 'bg-white/[0.02] border-white/10'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                      <Check size={14} className="text-blue-500 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-bold text-xs transition-all ${
                  plan.highlight 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}>
                  {plan.button}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-12 px-6">
    <div className="max-w-3xl mx-auto relative rounded-2xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-[#0a1120] to-purple-900/40" />
      <div className="relative z-10 py-10 px-6 text-center flex flex-col items-center">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Future of Merit-Based Hiring</h2>
          <p className="text-sm text-blue-200/60 mb-6 max-w-md mx-auto">Whether you are looking to hire the top 1% or prove you belong among them, Elevate AI is your platform.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <button className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-xl">Sign Up Free</button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
);

const Footer = () => {
 const platformLinks = [
  { name: "Resume Analyzer", link: "/platform#resume" },
  { name: "Skill Roadmap", link: "/platform#roadmap" },
  { name: "Interview Simulator", link: "/platform#interview" }
];

 const aboutLinks = [
  { name: "About Us", link: "/about#aboutus" },
  { name: "Core Pillars", link: "/about#pillars" },
  { name: "Contact", link: "/about#contact" }
];

  const legalLinks = [
    { name: "Privacy Policy", link: "/legal#privacy" },
    { name: "Terms of Service", link: "/legal#terms" },
    { name: "Cookie Policy", link: "/legal#cookies" }
  ];

  return (
    <footer className="bg-[#02050a] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center justify-items-center">
          
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Platform
            </h4>
        <ul className="space-y-3 text-sm text-slate-400">
  {platformLinks.map((item) => (
    <li key={item.name}>
      <Link to={item.link} className="hover:text-blue-400 transition-colors">
        {item.name}
      </Link>
    </li>
  ))}
</ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              About
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {aboutLinks.map((item) => (
                <li key={item.name}>
                  <Link to={item.link} className="hover:text-blue-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Legal
            </h4>
           <ul className="space-y-3 text-sm text-slate-400">
  {legalLinks.map((item) => (
    <li key={item.name}>
      <Link to={item.link} className="hover:text-blue-400 transition-colors">
        {item.name}
      </Link>
    </li>
  ))}
</ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover: pink-400 hover:bg-white/10 transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-all"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Twitter size={18} />
            </a>
          </div>

          <p className="text-slate-500 text-xs tracking-wide">
            © 2026 Elevate AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default function ElevateLandingPage() {
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}