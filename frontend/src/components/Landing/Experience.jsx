import React from 'react';
import { motion } from 'framer-motion';

const experiences = [
  {
    title: 'Senior Web Developer',
    company: 'Tech Innovators Inc.',
    period: '2024 - Present',
    description: 'Leading the frontend architecture and building scalable, high-performance web applications using React and Next.js.'
  },
  {
    title: 'Full Stack Engineer',
    company: 'Startup Hub',
    period: '2022 - 2024',
    description: 'Developed full-stack solutions with MERN stack, implemented complex authentication flows and real-time features.'
  },
  {
    title: 'Frontend Intern',
    company: 'Creative Agency',
    period: '2021 - 2022',
    description: 'Assisted in building responsive landing pages and interactive UI components with modern CSS frameworks.'
  }
];

export default function Experience() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Journey</h2>
        <p className="text-gray-400">My professional experience and education.</p>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
        {experiences.map((exp, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/50 bg-black text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h3 className="font-bold text-xl text-white">{exp.title}</h3>
                <span className="text-sm font-medium text-primary">{exp.period}</span>
              </div>
              <h4 className="text-gray-300 font-medium mb-4">{exp.company}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{exp.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
