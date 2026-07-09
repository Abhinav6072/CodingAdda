import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, LogOut, Shield, CheckCircle2, Circle, Search, Filter } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import CommandPalette from '../components/CommandPalette';
import Navbar from '../components/Navbar';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

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

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty.toLowerCase() === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags.toLowerCase() === filters.tag;
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const statusMatch = filters.status === 'all' || (filters.status === 'solved' && isSolved) || (filters.status === 'unsolved' && !isSolved);
    const searchMatch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 pb-20">
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />
      
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4"
          >
            Problem Set
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Master Data Structures & Algorithms. Solve challenges, analyze solutions, and elevate your coding skills to the next level.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 backdrop-blur-sm flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl">
              <Filter size={16} className="text-gray-400" />
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="bg-transparent border-none text-sm text-gray-300 focus:outline-none appearance-none cursor-pointer pr-4"
              >
                <option value="all" className="bg-[#111]">Status</option>
                <option value="solved" className="bg-[#111]">Solved</option>
                <option value="unsolved" className="bg-[#111]">Unsolved</option>
              </select>
            </div>

            <select 
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="all" className="bg-[#111]">Difficulty</option>
              <option value="easy" className="bg-[#111]">Easy</option>
              <option value="medium" className="bg-[#111]">Medium</option>
              <option value="hard" className="bg-[#111]">Hard</option>
            </select>

            <select 
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="all" className="bg-[#111]">Tags</option>
              <option value="array" className="bg-[#111]">Array</option>
              <option value="linkedList" className="bg-[#111]">Linked List</option>
              <option value="graph" className="bg-[#111]">Graph</option>
              <option value="dp" className="bg-[#111]">DP</option>
            </select>
          </div>
        </motion.div>

        {/* Problems Grid / List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredProblems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-gray-500"
              >
                No problems found matching your criteria.
              </motion.div>
            ) : (
              filteredProblems.map((problem, index) => {
                const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                
                return (
                  <motion.div 
                    key={problem._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className="block p-5 bg-white/[0.02] border border-white/5 hover:border-primary/50 hover:bg-white/[0.05] rounded-2xl transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 mt-1 sm:mt-0">
                            {isSolved ? (
                              <CheckCircle2 size={24} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            ) : (
                              <Circle size={24} className="text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors">
                              {problem.title}
                            </h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-400/20 text-blue-400 bg-blue-400/10">
                                {problem.tags}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="hidden sm:flex items-center text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
                          Solve Problem &rarr;
                        </div>
                      </div>
                    </NavLink>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Homepage;