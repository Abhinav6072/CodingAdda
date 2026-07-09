import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

export default function Contact() {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData);

    try {
      await axiosClient.post('/contact/submit', data);
      setLoading(false);
      setSuccess(true);
      if(formRef.current) formRef.current.reset();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setLoading(false);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Let's Connect</h2>
        <p className="text-gray-400">Have a project in mind? Drop me a message.</p>
      </div>

      <motion.form 
        ref={formRef}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Name</label>
          <input 
            type="text" 
            name="name"
            required
            placeholder="John Doe"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Email</label>
          <input 
            type="email" 
            name="email"
            required
            placeholder="john@example.com"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Message</label>
          <textarea 
            name="message"
            required
            rows="4"
            placeholder="How can I help you?"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={loading || success}
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : success ? (
            <><CheckCircle size={20} /> Sent Successfully</>
          ) : (
            <><Send size={20} /> Send Message</>
          )}
        </button>
      </motion.form>
    </div>
  );
}
