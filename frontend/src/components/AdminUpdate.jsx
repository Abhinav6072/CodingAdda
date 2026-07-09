import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, AlertCircle, Loader2, ArrowLeft, Search, Database, TerminalSquare, Info, Beaker, FileCode2, Send, Plus, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input required'),
      output: z.string().min(1, 'Output required'),
      explanation: z.string().min(1, 'Explanation required')
    })
  ).min(1, 'At least one visible case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input required'),
      output: z.string().min(1, 'Output required')
    })
  ).min(1, 'At least one hidden case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Reference code required')
    })
  ).length(3, 'All three languages required')
});


// Sub-component for the Update Form
const UpdateForm = ({ problem, onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map backend format to frontend format if necessary
  const formatData = (prob) => ({
    title: prob.title,
    description: prob.description,
    difficulty: prob.difficulty.toLowerCase(),
    tags: prob.tags,
    visibleTestCases: prob.visibleTestCases || [],
    hiddenTestCases: prob.hiddenTestCases || [],
    startCode: prob.startCode || [
      { language: 'C++', initialCode: '' },
      { language: 'Java', initialCode: '' },
      { language: 'JavaScript', initialCode: '' }
    ],
    referenceSolution: prob.referenceSolution || [
      { language: 'C++', completeCode: '' },
      { language: 'Java', completeCode: '' },
      { language: 'JavaScript', completeCode: '' }
    ]
  });

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: formatData(problem)
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.put(`/problem/update/${problem._id}`, data);
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      setIsSubmitting(false);
      alert(`Error updating: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit2 className="text-yellow-500" /> Editing: {problem.title}
          </h2>
          <p className="text-gray-400 text-sm mt-1">Make changes to the problem and save.</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10">
          Cancel Edit
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <Info className="text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Basic Information</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Problem Title</label>
              <input {...register('title')} className={`w-full bg-black/40 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description (Markdown)</label>
              <textarea {...register('description')} className={`w-full bg-black/40 border ${errors.description ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors min-h-[160px] custom-scrollbar`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                <select {...register('difficulty')} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 appearance-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Tag</label>
                <select {...register('tags')} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 appearance-none">
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Test Cases */}
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <Beaker className="text-secondary" />
            <h2 className="text-xl font-bold text-white">Test Cases</h2>
          </div>
          
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-200">Visible Test Cases</h3>
              <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10"><Plus size={16} /> Add Case</button>
            </div>
            <div className="space-y-4">
              {visibleFields.map((field, index) => (
                <div key={field.id} className="bg-black/40 border border-white/5 rounded-xl p-4 relative group">
                  <button type="button" onClick={() => removeVisible(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400"><X size={18} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <div><label className="text-xs text-gray-500 mb-1 block">Input</label><input {...register(`visibleTestCases.${index}.input`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Output</label><input {...register(`visibleTestCases.${index}.output`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Explanation</label><textarea {...register(`visibleTestCases.${index}.explanation`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 h-16" /></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-200">Hidden Test Cases</h3>
              <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10"><Plus size={16} /> Add Case</button>
            </div>
            <div className="space-y-4">
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="bg-black/40 border border-white/5 rounded-xl p-4 relative flex gap-4 pr-12 items-start">
                  <button type="button" onClick={() => removeHidden(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400"><X size={18} /></button>
                  <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">Input</label><textarea {...register(`hiddenTestCases.${index}.input`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-gray-300 h-16" /></div>
                  <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">Expected Output</label><textarea {...register(`hiddenTestCases.${index}.output`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-gray-300 h-16" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Templates */}
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <FileCode2 className="text-blue-500" />
            <h2 className="text-xl font-bold text-white">Code Templates & Solutions</h2>
          </div>
          <div className="space-y-8">
            {[0, 1, 2].map((index) => {
              const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
              return (
                <div key={index} className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="bg-white/5 px-4 py-3 border-b border-white/5"><h3 className="font-semibold text-gray-200">{langName} Setup</h3></div>
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-500 mb-2 block">Initial Code</label><textarea {...register(`startCode.${index}.initialCode`)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-sm text-blue-300 h-48 custom-scrollbar" spellCheck="false" /></div>
                    <div><label className="text-xs font-medium text-gray-500 mb-2 block">Reference Solution</label><textarea {...register(`referenceSolution.${index}.completeCode`)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-sm text-emerald-300 h-48 custom-scrollbar" spellCheck="false" /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 transition-all hover:scale-[1.02]">
          {isSubmitting ? <><Loader2 className="animate-spin" size={24} /> Saving Updates...</> : <><Send size={20} /> Update Problem</>}
        </button>
      </form>
    </motion.div>
  );
};


// Main Component
const AdminUpdate = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProblem, setEditingProblem] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/problem/problemById/${id}`);
      setEditingProblem(data);
    } catch (err) {
      alert("Failed to load problem details");
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem => 
    problem.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 pb-20">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </NavLink>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Edit2 size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Update Records</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-10 relative z-10">
        <AnimatePresence mode="wait">
          {!editingProblem ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Select Problem</h1>
                  <p className="text-gray-400 text-sm">Choose a problem to edit its details and test cases.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" />
                </div>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6"><AlertCircle size={20} /> {error}</div>}

              <div className="overflow-x-auto custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Loader2 size={32} className="animate-spin text-yellow-500 mb-4" /><p>Loading records...</p></div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-sm">
                        <th className="py-4 px-4 font-medium">#</th>
                        <th className="py-4 px-4 font-medium w-1/2">Problem Title</th>
                        <th className="py-4 px-4 font-medium">Difficulty</th>
                        <th className="py-4 px-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProblems.map((problem, index) => (
                        <tr key={problem._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 px-4 text-gray-500">{index + 1}</td>
                          <td className="py-4 px-4 font-medium text-gray-200">{problem.title}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${problem.difficulty.toLowerCase() === 'easy' ? 'text-green-400 bg-green-400/10 border-green-400/20' : problem.difficulty.toLowerCase() === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button onClick={() => handleEditClick(problem._id)} className="px-4 py-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors inline-flex items-center gap-2 border border-transparent hover:border-yellow-500/20 opacity-0 group-hover:opacity-100">
                              <Edit2 size={16} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProblems.length === 0 && (<tr><td colSpan="4" className="py-12 text-center text-gray-500">No problems found.</td></tr>)}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          ) : (
            <UpdateForm 
              key="form"
              problem={editingProblem} 
              onCancel={() => setEditingProblem(null)} 
              onSuccess={() => {
                alert("Problem updated successfully!");
                setEditingProblem(null);
                fetchProblems(); // refresh list
              }} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminUpdate;
