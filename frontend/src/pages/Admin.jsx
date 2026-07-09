import React from 'react';
import { Plus, Edit, Trash2, Video, Code2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { motion } from 'framer-motion';

function Admin() {
  const navigate = useNavigate();

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/20',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'from-yellow-500 to-orange-500',
      shadow: 'shadow-yellow-500/20',
      route: '/admin/update' // Note: Ensure this route exists or matches your router
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'from-red-500 to-rose-500',
      shadow: 'shadow-red-500/20',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Solutions',
      description: 'Upload And Delete Editorial Videos',
      icon: Video,
      color: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-blue-500/20',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden pb-20">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/problems')} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldAlert size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Admin Console</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-2xl"
          >
            <ShieldAlert size={40} className="text-primary drop-shadow-[0_0_15px_rgba(var(--p),0.5)]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4"
          >
            System Administration
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            Manage platform content, evaluate problems, and oversee the database securely.
          </motion.p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {adminOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${option.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative h-full bg-[#111]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-white/20 transition-colors flex flex-col items-center text-center">
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${option.color} flex items-center justify-center mb-6 shadow-lg ${option.shadow}`}>
                    <IconComponent size={28} className="text-white" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3">
                    {option.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-8 flex-1">
                    {option.description}
                  </p>
                  
                  <NavLink 
                    to={option.route}
                    className="w-full py-3 px-4 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 hover:border-white/20"
                  >
                    Enter Module
                  </NavLink>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Admin;