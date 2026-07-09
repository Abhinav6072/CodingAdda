import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, AlertCircle, Loader2, ArrowLeft, UploadCloud, Trash2, Search, Film } from 'lucide-react';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete the video for this problem?')) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      // Not deleting the whole problem, just visual feedback could be improved if backend updates video status
      alert('Video deleted successfully if it existed.');
      // Re-fetch to update state if needed, or assume success
    } catch (err) {
      alert('Failed to delete video: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredProblems = problems.filter(problem => 
    problem.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 pb-20">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </NavLink>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Film size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Video Management</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-10 relative z-10">
        
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Editorials & Media</h1>
              <p className="text-gray-400 text-sm">Upload or remove video solutions for coding problems.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                <p>Loading problems...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="py-4 px-4 font-medium">#</th>
                    <th className="py-4 px-4 font-medium w-1/3">Problem Title</th>
                    <th className="py-4 px-4 font-medium">Difficulty</th>
                    <th className="py-4 px-4 font-medium">Tags</th>
                    <th className="py-4 px-4 font-medium text-right">Video Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredProblems.map((problem, index) => (
                      <motion.tr 
                        key={problem._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-4 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-4 px-4 font-medium text-gray-200">{problem.title}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            problem.difficulty.toLowerCase() === 'easy' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                            problem.difficulty.toLowerCase() === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                            'text-red-400 bg-red-400/10 border-red-400/20'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-blue-400/20 text-blue-400 bg-blue-400/10">
                            {problem.tags}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <NavLink 
                              to={`/admin/upload/${problem._id}`}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
                              title="Upload Video"
                            >
                              <UploadCloud size={14} /> Upload
                            </NavLink>
                            <button 
                              onClick={() => handleDelete(problem._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
                              title="Delete Video"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredProblems.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-500">
                        No problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminVideo;