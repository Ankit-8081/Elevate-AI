import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  ShieldCheck, 
  Users, 
  Mail, 
  Linkedin, 
  Twitter, 
  Instagram,
  ArrowRight, 
  Code, 
  Palette, 
  BrainCircuit,
  Database,
  Cpu,
  Terminal
} from 'lucide-react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import aayushImg from "../assets/Aayush.jpeg";
import prateekImg from "../assets/Prateek.jpeg";
import rasikaImg from "../assets/Rasika.jpg"
import shreyanshImg from "../assets/Shreyansh.jpeg"
import emailjs from "@emailjs/browser";
import { useRef } from "react";

const AboutPage = () => {
  const location = useLocation();
  const form = useRef();

useEffect(() => {
  if (location.hash) {
    const element = document.querySelector(location.hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
}, [location]);
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl";

  const team = [
    {
      name: "Aayush Thakur",
      role: "Frontend & Team Leader",
      desc: "Architecting the vision and leading development for the next-gen career platform.",
      icon: <Palette className="text-blue-400" />,
      image: aayushImg
    },
    {
      name: "Shreyansh Kushwaha",
      role: "Backend Developer",
      desc: "Building scalable infrastructure and secure API ecosystems for seamless data flow.",
      icon: <Terminal className="text-purple-400" />,
      image: shreyanshImg
    },
    {
      name: "Prateek Rastogi",
      role: "AI Integration & Implementation",
      desc: "Deploying advanced neural networks to power real-time skill verification.",
      icon: <Cpu className="text-cyan-400" />,
      image: prateekImg
    },
    {
      name: "Rasika Kajale",
      role: "Database & Creative Context",
      desc: "Designing high-performance data schemas and ensuring creative consistency.",
      icon: <Database className="text-pink-400" />,
      image: rasikaImg
    }
  ];
const sendEmail = (e) => {
  e.preventDefault();

  emailjs.sendForm(
    "service_zg7e9zs",
    "template_2u5j608",
    form.current,
    "T3Y0FqLGUreR9NseC"
  ).then(
    () => {
      alert("Message sent successfully!");
    },
    () => {
      alert("Failed to send message.");
    }
  );
};
  return (
    <div className="bg-[#050b14] text-white min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-purple-400 mb-6">
            About Elevate AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium mb-8">
            Defining the next chapter of professional growth through intelligence.
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We are moving beyond the era of static resumes. Elevate AI transforms hiring into a merit-based evaluation ecosystem where your skills speak louder than your paper trail.
          </p>
        </motion.div>
      </section>

      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-bold mb-6">The Future of Talent Discovery</h2>
            <div className="space-y-6 text-slate-400 text-lg">
              <p>
                Traditional resumes are often biased, outdated, and fail to capture the true potential of a candidate. Great talent is frequently overlooked because of lack of pedigree or keyword matching.
              </p>
              <p>
                Elevate AI bridges this gap. By utilizing advanced AI architectures, we verify skills through real-world project analysis and simulated environments, allowing companies to discover talent based on actual capability.
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className={`${glassStyle} p-8 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <BrainCircuit className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Merit Engine</h3>
              <p className="text-slate-400 mb-6">Our proprietary AI evaluates your code, logic, and creative problem-solving in real-time to build a living skill profile.</p>
              <div className="flex flex-wrap gap-2">
                {['ATS Analysis', 'Skill Graph', 'Live Simulations'].map(tag => (
                  <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pillars" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold">Our Core Pillars</h2>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: <Target className="text-blue-400" />, title: "Merit-Based Hiring", desc: "Removing bias to ensure the most capable individuals get the opportunities they deserve." },
            { icon: <ShieldCheck className="text-green-400" />, title: "Skill Verification", desc: "A trustworthy standard for skills that goes beyond self-reported certifications." },
            { icon: <Users className="text-purple-400" />, title: "Opportunity for Everyone", desc: "Democratizing access to top-tier careers regardless of geographical or educational background." }
          ].map((pillar, idx) => (
            <motion.div 
              key={idx}
              {...fadeIn}
              whileHover={{ y: -10 }}
              className={`${glassStyle} p-8 text-center`}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
              <p className="text-slate-400">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="aboutus" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">The Minds Behind Elevate AI</h2>
          <p className="text-slate-400 max-w-xl mx-auto">A multidisciplinary team dedicated to revolutionizing the global hiring landscape.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <motion.div 
              key={idx} 
              {...fadeIn} 
              className={`${glassStyle} p-6 border-white/5 hover:border-blue-500/30 transition-all group`}
            >
              <div className="relative mb-6 overflow-hidden rounded-xl">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] to-transparent opacity-60" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/5">{member.icon}</div>
                <h3 className="text-lg font-bold">{member.name}</h3>
              </div>
              <p className="text-blue-400 text-sm font-semibold mb-3">{member.role}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        <motion.div {...fadeIn}>
          <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
          <p className="text-slate-400 mb-10 text-lg">Have questions? We'd love to hear from you. Reach out via our socials or the form.</p>
          
          <div className="space-y-6">

  <div className="flex items-center gap-4 text-slate-300">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
      <Mail size={22}/>
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-widest">Email Us</p>
      <span className="font-medium">elevateai2026@gmail.com</span>
    </div>
  </div>

  <div className="flex items-center gap-4 text-slate-300">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
      <Linkedin size={22}/>
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-widest">LinkedIn</p>
      <span className="font-medium">linkedin.com/company/elevateai</span>
    </div>
  </div>

  <div className="flex items-center gap-4 text-slate-300">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
      <Instagram size={22}/>
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-widest">Instagram</p>
      <span className="font-medium">instagram.com/elevateai</span>
    </div>
  </div>

</div>
        </motion.div>
        <motion.form
  ref={form}
  onSubmit={sendEmail}
  {...fadeIn}
  className={`${glassStyle} p-8 space-y-4`}
>
           <h1 className="text-4xl text-center font-bold mb-4">Contact Us</h1>
          <div className="grid md:grid-cols-2 gap-4">
           <input
  name="name"
  type="text"
  placeholder="Name"
  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors w-full"
/>
            <input
  name="email"
  type="email"
  placeholder="Email"
  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors w-full"
/>
          </div>
          <textarea
  name="message"
  placeholder="Message"
  rows={4}
  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors w-full resize-none"
/>
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
            Submit Message
          </button>
        </motion.form>
      </section>

    </div>
  );
};

export default AboutPage;