import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowLeft, TerminalSquare, Info, Code2, Beaker, FileCode2, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

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

function AdminPanel() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      setIsSubmitting(false);
      navigate('/');
    } catch (error) {
      setIsSubmitting(false);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 pb-20">
      {/* Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </NavLink>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <TerminalSquare size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Create Problem</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-10 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
              <Info className="text-primary" />
              <h2 className="text-2xl font-bold text-white">Basic Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Problem Title</label>
                <input
                  {...register('title')}
                  className={`w-full bg-black/40 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors`}
                  placeholder="e.g. Two Sum"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description (Markdown)</label>
                <textarea
                  {...register('description')}
                  className={`w-full bg-black/40 border ${errors.description ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[160px] custom-scrollbar`}
                  placeholder="Describe the problem details..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Primary Tag</label>
                  <select
                    {...register('tags')}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Test Cases */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
              <Beaker className="text-secondary" />
              <h2 className="text-2xl font-bold text-white">Test Cases</h2>
            </div>
            
            {/* Visible Cases */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Visible Test Cases (Examples)</h3>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                >
                  <Plus size={16} /> Add Case
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {visibleFields.map((field, index) => (
                    <motion.div key={field.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-black/40 border border-white/5 rounded-xl p-4 relative group">
                      <button type="button" onClick={() => removeVisible(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors">
                        <X size={18} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Input</label>
                          <input {...register(`visibleTestCases.${index}.input`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-secondary" placeholder="e.g. nums = [2,7,11,15], target = 9" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Output</label>
                          <input {...register(`visibleTestCases.${index}.output`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-secondary" placeholder="e.g. [0,1]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Explanation</label>
                        <textarea {...register(`visibleTestCases.${index}.explanation`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-secondary h-16" placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]." />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {errors.visibleTestCases && <p className="text-red-400 text-sm">{errors.visibleTestCases.root?.message || "Ensure all visible testcase fields are filled."}</p>}
              </div>
            </div>

            {/* Hidden Cases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Hidden Test Cases (Evaluation)</h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                >
                  <Plus size={16} /> Add Case
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {hiddenFields.map((field, index) => (
                    <motion.div key={field.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-black/40 border border-white/5 rounded-xl p-4 relative flex gap-4 pr-12 items-start">
                      <button type="button" onClick={() => removeHidden(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors">
                        <X size={18} />
                      </button>
                      
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Input</label>
                        <textarea {...register(`hiddenTestCases.${index}.input`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-gray-300 focus:border-secondary h-16" placeholder="nums = [3,2,4], target = 6" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Expected Output</label>
                        <textarea {...register(`hiddenTestCases.${index}.output`)} className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-gray-300 focus:border-secondary h-16" placeholder="[1,2]" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {errors.hiddenTestCases && <p className="text-red-400 text-sm">Ensure all hidden testcase fields are filled.</p>}
              </div>
            </div>
          </motion.div>

          {/* Section 3: Templates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
              <FileCode2 className="text-blue-500" />
              <h2 className="text-2xl font-bold text-white">Code Templates & Solutions</h2>
            </div>

            <div className="space-y-8">
              {[0, 1, 2].map((index) => {
                const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                return (
                  <div key={index} className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                      <Code2 size={16} className="text-gray-400" />
                      <h3 className="font-semibold text-gray-200">{langName} Setup</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">Initial Code (Shown to User)</label>
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          className="w-full bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-sm text-blue-300 focus:border-blue-500/50 h-48 custom-scrollbar"
                          spellCheck="false"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">Reference Solution (Used for Judge0/Review)</label>
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          className="w-full bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-sm text-emerald-300 focus:border-emerald-500/50 h-48 custom-scrollbar"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(var(--p),0.4)] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={24} /> Deploying Problem...</>
            ) : (
              <><Send size={20} /> Create Problem</>
            )}
          </motion.button>

        </form>
      </div>
    </div>
  );
}

export default AdminPanel;