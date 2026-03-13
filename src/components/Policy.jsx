import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Cookie, ChevronRight, Scale, Lock, Eye, Gavel } from 'lucide-react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const LegalPage = () => {
 const location = useLocation();

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

  const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 mb-12";

  const PolicySection = ({ id, title, icon: Icon, children }) => (
    <motion.section id={id} {...fadeIn} className={glassStyle}>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Icon className="text-blue-400" size={28} />
        </div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-8 text-slate-400 leading-relaxed">
        {children}
      </div>
    </motion.section>
  );

  const SubContent = ({ subtitle, text }) => (
    <div>
      <h3 className="text-xl font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <ChevronRight size={18} className="text-blue-500" />
        {subtitle}
      </h3>
      <div className="pl-6 space-y-3">
        {text.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#050b14] text-white min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl z-10"
        >
          
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-purple-400 mb-6">
            Legal & Policies
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            At Elevate AI, we value your privacy and trust above all. 
            Learn how we protect your data and the rules of our platform.
          </p>
        </motion.div>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-32">
        
        <PolicySection id="privacy" title="Privacy Policy" icon={Eye}>
          <SubContent 
            subtitle="Information We Collect" 
            text={[
              "We collect information you provide directly to us, including your name, email, professional history, and resume data for AI analysis.",
              "Our AI engines process your interaction data, including interview simulation transcripts and skill assessment results, to generate personalized roadmaps.",
              "Automatically collected data includes IP addresses, device types, and usage patterns via telemetry to improve platform stability."
            ]}
          />
          <SubContent 
            subtitle="How We Use Information" 
            text={[
              "To provide AI-driven career analytics and job matching services specific to your profile.",
              "To populate global leaderboards and rank skill competencies relative to industry standards.",
              "To train our proprietary Large Language Models on anonymized data sets to improve resume parsing accuracy."
            ]}
          />
          <SubContent 
            subtitle="Data Security" 
            text={[
              "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
              "We implement strict identity and access management (IAM) protocols to ensure only authorized AI processes interact with your sensitive information."
            ]}
          />
          <SubContent 
            subtitle="Third Party Services" 
            text={[
              "We may share anonymized metadata with recruitment partners and cloud infrastructure providers like AWS and Google Cloud.",
              "We do not sell your personal identifying information to third-party data brokers."
            ]}
          />
          <SubContent 
            subtitle="User Rights" 
            text={[
              "You have the right to request a full export of your career data and simulation history.",
              "You may request the deletion of your account and all associated AI-generated professional profiles at any time."
            ]}
          />
        </PolicySection>

        <PolicySection id="terms" title="Terms of Service" icon={Gavel}>
          <SubContent 
            subtitle="Acceptance of Terms" 
            text={[
              "By accessing Elevate AI, you agree to be bound by these Terms and all applicable laws and regulations.",
              "If you do not agree with any of these terms, you are prohibited from using or accessing this site."
            ]}
          />
          <SubContent 
            subtitle="Platform Usage Rules" 
            text={[
              "Users must provide accurate career information. Misrepresentation of skills in assessments may lead to account suspension.",
              "Automated scraping or 'jailbreaking' our AI models is strictly prohibited and will result in permanent banning."
            ]}
          />
          <SubContent 
            subtitle="Intellectual Property" 
            text={[
              "The Elevate AI brand, code, and proprietary scoring algorithms remain the exclusive property of Elevate AI.",
              "You retain ownership of your uploaded resumes, but grant Elevate AI a license to process and analyze them for service delivery."
            ]}
          />
          <SubContent 
            subtitle="Limitation of Liability" 
            text={[
              "Elevate AI provides career suggestions based on algorithmic predictions. We do not guarantee employment or specific career outcomes.",
              "We are not liable for any discrepancies between AI-simulated results and real-world performance."
            ]}
          />
          <SubContent 
            subtitle="Termination" 
            text={[
              "We reserve the right to terminate access to the platform for any breach of security protocols or unethical use of AI features."
            ]}
          />
        </PolicySection>

        <PolicySection id="cookies" title="Cookie Policy" icon={Cookie}>
          <SubContent 
            subtitle="What Cookies Are" 
            text={[
              "Cookies are small text files stored on your device to help us recognize you and remember your preferences."
            ]}
          />
          <SubContent 
            subtitle="How We Use Cookies" 
            text={[
              "To keep you logged in during your session and maintain your progress in skill assessments.",
              "To remember your UI preferences, such as Dark Mode or localized language settings."
            ]}
          />
          <SubContent 
            subtitle="Types of Cookies" 
            text={[
              "Essential: Necessary for the platform to function securely.",
              "Analytics: Help us understand how users navigate the career roadmaps.",
              "Personalization: Used by the AI to tailor suggestions based on previous visits."
            ]}
          />
          <SubContent 
            subtitle="Managing Cookie Preferences" 
            text={[
              "You can control or reset your cookies through your browser settings, though some AI features may become unavailable.",
              "Our platform honors 'Do Not Track' signals from supported web browsers."
            ]}
          />
        </PolicySection>

        <motion.div {...fadeIn} className="text-center pt-12">
          <p className="text-slate-500 mb-4 font-medium">Have questions regarding our policies?</p>
          <a 
            href="mailto:elevateai2026@gmail.com" 
            className="text-blue-400 hover:text-blue-300 transition-colors font-bold underline decoration-blue-500/30 underline-offset-8"
          >
            elevateai2026@gmail.com
          </a>
        </motion.div>

      </main>
    </div>
  );
};

export default LegalPage;