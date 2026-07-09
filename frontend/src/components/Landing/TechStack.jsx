import React from 'react';
import { motion } from 'framer-motion';

const technologies = [
  { name: 'React', color: 'text-blue-400' },
  { name: 'Node.js', color: 'text-green-500' },
  { name: 'Express', color: 'text-gray-300' },
  { name: 'MongoDB', color: 'text-green-600' },
  { name: 'Redis', color: 'text-red-500' },
  { name: 'Tailwind CSS', color: 'text-cyan-400' },
  { name: 'Redux', color: 'text-purple-500' },
  { name: 'Docker', color: 'text-blue-500' },
];

export default function TechStack() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Tech Arsenal</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Built with cutting-edge technologies for maximum performance and scalability.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {technologies.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className={`text-xl font-semibold ${tech.color}`}>{tech.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
