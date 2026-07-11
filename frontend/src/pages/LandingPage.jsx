import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { Code2, ArrowRight, Github, Linkedin, Mail, Command, Terminal, Star, Zap } from 'lucide-react';
import ParticleBackground from '../components/Landing/ParticleBackground';
import TechStack from '../components/Landing/TechStack';
import Experience from '../components/Landing/Experience';
import Contact from '../components/Landing/Contact';
import Hero3D from '../components/Landing/Hero3D';
import CommandPalette from '../components/CommandPalette';

function LandingPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Ctrl+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen relative overflow-x-hidden selection:bg-primary/30">
      <ParticleBackground />
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-[#050505]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center"
            >
              <Code2 size={24} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">CodingAdda</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#skills" className="hover:text-white transition-colors">Skills</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <Command size={14} />
              <span>Cmd + K</span>
            </button>

            {isAuthenticated ? (
              <NavLink
                to="/problems"
                className="px-6 py-2.5 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform"
              >
                Dashboard
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-[0_0_20px_rgba(var(--p),0.5)] transition-all hover:scale-105"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary mb-6">
              <Zap size={16} className="fill-primary" />
              <span className="text-sm font-medium">Futuristic AI Developer</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Crafting <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary">
                Digital Realities
              </span>
            </h1>

            <p className="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
              I build immersive, high-performance web applications powered by modern architecture and artificial intelligence. Explore my portfolio or solve DSA problems on the platform.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <NavLink
                to={isAuthenticated ? "/problems" : "/signup"}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
              >
                Start Coding <ArrowRight size={20} />
              </NavLink>
              <a
                href="https://abhinav-portfolio-tawny.vercel.app/"
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition-colors"
              >
                View Portfolio
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6 text-gray-400">
              <a href="https://github.com/Abhinav6072" className="hover:text-white transition-colors"><Github size={24} /></a>
              <a href="https://www.linkedin.com/in/abhinav-singh-a6a5b3385?utm_source=share_via&utm_content=profile&utm_medium=member_android" className="hover:text-white transition-colors"><Linkedin size={24} /></a>
              <a href="mailto:abhinava2k@gmail.com" className="hover:text-white transition-colors"><Mail size={24} /></a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-[500px] w-full relative"
          >
            {/* 3D Hero Element placeholder, requires Three.js */}
            <Hero3D />
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="skills" className="py-20 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-black/50">
        <TechStack />
      </section>

      {/* Experience Timeline */}
      <section id="experience" className="py-20 relative z-10">
        <Experience />
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative z-10 border-t border-white/5">
        <Contact />
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-gray-500 relative z-10">
        <p>© 2026 CodingAdda. Built with ultra-modern tech stack.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
