import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Users, Zap, Target, Star, ChevronRight, 
  Code2, Briefcase, Globe, ArrowRight, Shield, 
  LayoutDashboard, Terminal
} from 'lucide-react';
import { Link } from "react-router-dom";

const GlassCard = ({ children, className = "" }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl ${className}`}
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


const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050b14]/80 backdrop-blur-md border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Terminal size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Elevate AI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
        <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
       <Link to="/login">
  <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
    Sign Up / Log In
  </button>
   </Link>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
    <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
    <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />

    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
      <FadeIn>
        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Discover Top Talent. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Rise Through Merit.
          </span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
          Elevate AI ranks professionals based on real skills, projects, and impact helping companies find the best people faster, without the noise of traditional resumes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
         <Link to="/login">
   <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]">
    Get Started <ArrowRight size={18} />
   </button>
         </Link>
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-8 py-4 rounded-xl transition-all">
            <Trophy size={18} /> Explore Leaderboard
          </button>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="relative hidden lg:block h-[500px]">
        {/* Floating Mock UI Cards */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 w-80 bg-[#0a1120]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full p-[2px]">
              <div className="w-full h-full bg-[#0a1120] rounded-full border-2 border-[#0a1120] overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="avatar" />
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Sarah Chen</h4>
              <p className="text-xs text-blue-400">#1 AI Engineer</p>
            </div>
            <div className="ml-auto text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-bold">
              98 Score
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[98%]" />
            </div>
            <div className="flex gap-2 mt-3">
              <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300">PyTorch</span>
              <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300">TensorFlow</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [10, -10, 10] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-0 w-72 bg-[#0a1120]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Target size={20} className="text-purple-400" /></div>
            <div>
              <h4 className="text-white font-bold text-sm">System Design</h4>
              <p className="text-xs text-slate-400">Challenge Completed</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3">Ranked Top 2% globally in scalable architecture design.</p>
          <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://i.pravatar.cc/150?img=${i}`} className="w-6 h-6 rounded-full border border-[#0a1120]" alt="peers" />
            ))}
            <div className="w-6 h-6 rounded-full border border-[#0a1120] bg-white/10 flex items-center justify-center text-[8px] text-white">+8k</div>
          </div>
        </motion.div>
      </FadeIn>
    </div>
  </section>
);

const Stats = () => {
  const stats = [
    { label: "Professionals", value: "12,000+", icon: Users },
    { label: "Projects Built", value: "3,500+", icon: Code2 },
    { label: "Companies Hiring", value: "850+", icon: Briefcase },
    { label: "Countries", value: "45", icon: Globe },
  ];

  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={20} className="text-blue-500" />
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      title: "Merit-Based Ranking",
      desc: "Our proprietary Elevate Score ranks professionals based on verified skills and real-world achievements, eliminating bias.",
      icon: Shield,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Talent Discovery",
      desc: "Companies can bypass the noise and instantly discover the highest-performing candidates matched perfectly to their needs.",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      title: "Skill Challenges",
      desc: "Professionals prove their abilities in standardized, real-world coding and design environments to validate their expertise.",
      icon: Zap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Project Impact",
      desc: "Showcase the actual work you've done. We analyze your GitHub, deployments, and case studies to highlight true impact.",
      icon: LayoutDashboard,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase mb-3">Why Elevate AI</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for the Doers.</h3>
          <p className="text-slate-400 text-lg">We believe talent is evenly distributed, but opportunity is not. We're fixing that by making hiring purely about what you can build.</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <GlassCard className="p-8 h-full">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feat.bg}`}>
                  <feat.icon size={24} className={feat.color} />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{feat.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const LeaderboardPreview = () => {
  const users = [
    { rank: 1, name: "David Kim", role: "Full Stack Developer", score: 99, match: "React, Node.js, AWS", img: "2" },
    { rank: 2, name: "Elena Rostova", role: "Machine Learning Eng.", score: 97, match: "Python, PyTorch, SQL", img: "5" },
    { rank: 3, name: "Marcus Thorne", role: "Product Designer", score: 95, match: "Figma, Framer, UX/UI", img: "8" },
  ];

  return (
    <section id="leaderboard" className="py-20 px-6 bg-gradient-to-b from-[#050b14] to-[#0a1120]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">The Global Leaderboard</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Top companies recruit directly from our leaderboard. Rise through the ranks by completing challenges, contributing to open source, and building impactful projects.
            </p>
            <button className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 font-semibold px-6 py-3 rounded-xl transition-all">
              View Full Leaderboard <ChevronRight size={18} />
            </button>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h4 className="text-white font-semibold flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> Top Talent This Week</h4>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Live Updates</span>
              </div>
              <div className="space-y-4">
                {users.map((user, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 text-center font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-amber-700'}`}>
                        #{user.rank}
                      </div>
                      <img src={`https://i.pravatar.cc/150?img=${user.img}`} className="w-10 h-10 rounded-full" alt={user.name} />
                      <div>
                        <h5 className="text-white font-medium text-sm">{user.name}</h5>
                        <p className="text-xs text-slate-400">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-emerald-400 font-bold text-sm">{user.score} Score</div>
                      <div className="text-[10px] text-slate-500">{user.match}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Create Profile", desc: "Connect your GitHub, LinkedIn, and portfolio.", icon: Users },
    { title: "Complete Challenges", desc: "Take domain-specific assessments to prove your skills.", icon: Code2 },
    { title: "Build Projects", desc: "Upload verifiable work to increase your Elevate Score.", icon: Briefcase },
    { title: "Rise & Get Hired", desc: "Climb the leaderboard and get incoming offers from top tier companies.", icon: Trophy },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Your journey from creating a profile to landing your dream role.</p>
        </FadeIn>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 z-0" />
          
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.15} className="relative z-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#050b14] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <step.icon size={24} className="text-white relative z-10" />
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center border-2 border-[#050b14]">
                  {i + 1}
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-20 px-6">
    <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
      
      <div className="relative z-10 py-20 px-10 text-center flex flex-col items-center">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the Future of <br className="hidden md:block" /> Merit-Based Hiring
          </h2>
          <p className="text-xl text-blue-200/70 mb-10 max-w-2xl mx-auto">
            Whether you are looking to hire the top 1% of talent or prove you belong among them, Elevate AI is your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-900 hover:bg-slate-100 font-bold px-8 py-4 rounded-xl transition-all shadow-xl">
              Sign Up Free
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-8 py-4 rounded-xl transition-all">
              Explore Talent
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#02050a] border-t border-white/5 pt-20 pb-10 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-6 h-6 rounded border border-white/20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
               <Terminal size={12} className="text-white" />
             </div>
             <span className="text-lg font-bold text-white tracking-tight">Elevate AI</span>
          </div>
          <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
            The talent discovery platform where skills speak louder than resumes. Empowering builders to showcase their true potential.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"><Globe size={16}/></div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"><Target size={16}/></div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Leaderboard</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Skill Challenges</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Legal</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-600 text-sm">© 2026 Elevate AI. All rights reserved.</p>
        <p className="text-slate-600 text-sm flex items-center gap-1">Designed with <Star size={14} className="text-amber-500" /> for the builders.</p>
      </div>
    </div>
  </footer>
);

export default function ElevateLandingPage() {
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <LeaderboardPreview />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}