import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ArrowLeft, Play, Send, Bot, FileText, CheckCircle2, History, XCircle, MessageSquare } from 'lucide-react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import Discussions from '../components/Discussions';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const langObj = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]);
      if (langObj) setCode(langObj.initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => editorRef.current = editor;

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveRightTab('testcase');
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
    } catch (error) {
      setRunResult({ success: false, error: 'Internal server error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveRightTab('result');
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
    } catch (error) {
      setSubmitResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#050505]">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  const leftTabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'editorial', label: 'Editorial', icon: Play },
    { id: 'solutions', label: 'Solutions', icon: Code2 },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'submissions', label: 'Submissions', icon: History },
    { id: 'chatAI', label: 'ChatAI', icon: Bot }
  ];

  const rightTabs = [
    { id: 'code', label: 'Code' },
    { id: 'testcase', label: 'Testcase' },
    { id: 'result', label: 'Result' }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-gray-300 font-sans overflow-hidden selection:bg-primary/30">
      
      {/* Top Navbar */}
      <nav className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/problems')} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <Code2 size={12} className="text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">CodingAdda Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
            onClick={handleRun}
            disabled={loading}
          >
            <Play size={14} className={loading ? 'animate-pulse' : ''} />
            Run
          </button>
          <button
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-[0_0_15px_rgba(var(--p),0.3)] disabled:opacity-50"
            onClick={handleSubmitCode}
            disabled={loading}
          >
            <Send size={14} className={loading ? 'animate-pulse' : ''} />
            Submit
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 flex flex-col border-r border-white/10 bg-[#0a0a0a]/50">
          <div className="flex px-2 pt-2 border-b border-white/10 gap-1 overflow-x-auto custom-scrollbar">
            {leftTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                    activeLeftTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {activeLeftTab === tab.id && (
                    <motion.div layoutId="leftTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(var(--p),0.8)]" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              {problem && (
                <motion.div
                  key={activeLeftTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeLeftTab === 'description' && (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-bold text-white leading-tight">{problem.title}</h1>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-blue-400/20 text-blue-400 bg-blue-400/10">
                            {problem.tags}
                          </span>
                        </div>
                      </div>

                      <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed">
                        <div className="whitespace-pre-wrap">{problem.description}</div>
                      </div>

                      <div className="space-y-4 pt-4">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <h4 className="font-semibold text-white mb-3 text-sm">Example {index + 1}:</h4>
                            <div className="space-y-2 text-sm font-mono text-gray-300">
                              <div className="flex"><span className="text-gray-500 w-24 shrink-0">Input:</span> <span>{example.input}</span></div>
                              <div className="flex"><span className="text-gray-500 w-24 shrink-0">Output:</span> <span className="text-white">{example.output}</span></div>
                              {example.explanation && (
                                <div className="flex mt-2 pt-2 border-t border-white/5">
                                  <span className="text-gray-500 w-24 shrink-0">Explanation:</span> 
                                  <span className="font-sans">{example.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeLeftTab === 'editorial' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white">Video Editorial</h2>
                      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden p-4">
                        <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                      </div>
                    </div>
                  )}

                  {activeLeftTab === 'solutions' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white">Reference Solutions</h2>
                      <div className="space-y-4">
                        {problem.referenceSolution?.map((solution, index) => (
                          <div key={index} className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-300">{solution?.language} Solution</span>
                            </div>
                            <div className="p-4 overflow-x-auto custom-scrollbar">
                              <pre className="text-sm font-mono text-blue-300">
                                <code>{solution?.completeCode}</code>
                              </pre>
                            </div>
                          </div>
                        )) || <p className="text-gray-500">Solutions will be available after solving the problem.</p>}
                      </div>
                    </div>
                  )}

                  {activeLeftTab === 'discussions' && (
                    <div className="h-full">
                      <Discussions problemId={problemId} />
                    </div>
                  )}

                  {activeLeftTab === 'submissions' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white">My Submissions</h2>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <SubmissionHistory problemId={problemId} />
                      </div>
                    </div>
                  )}

                  {activeLeftTab === 'chatAI' && (
                    <div className="h-full flex flex-col space-y-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Bot className="text-primary" /> AI Assistant
                      </h2>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1">
                        <ChatAi problem={problem} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between px-2 pt-2 border-b border-white/10 bg-[#0a0a0a]/50">
            <div className="flex gap-1">
              {rightTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeRightTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                  }`}
                >
                  {tab.label}
                  {activeRightTab === tab.id && (
                    <motion.div layoutId="rightTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary shadow-[0_0_8px_rgba(var(--s),0.8)]" />
                  )}
                </button>
              ))}
            </div>
            {activeRightTab === 'code' && (
              <div className="pb-1 pr-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-300 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            {loading && activeRightTab !== 'code' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                  <p className="text-sm font-medium text-primary animate-pulse">Evaluating Code...</p>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeRightTab === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 relative pt-2"
                >
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                      fontLigatures: true,
                      renderLineHighlight: 'all',
                      padding: { top: 16 }
                    }}
                  />
                </motion.div>
              )}

              {activeRightTab === 'testcase' && (
                <motion.div
                  key="testcase"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-6 overflow-y-auto custom-scrollbar"
                >
                  {runResult ? (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-xl border flex items-start gap-3 ${runResult.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {runResult.success ? <CheckCircle2 className="shrink-0" /> : <XCircle className="shrink-0" />}
                        <div>
                          <h3 className="font-bold text-lg">{runResult.success ? 'All Test Cases Passed' : 'Execution Error or Failed Test'}</h3>
                          <div className="flex gap-4 mt-2 text-sm opacity-80">
                            <span>Runtime: {runResult.runtime}s</span>
                            <span>Memory: {runResult.memory}KB</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {runResult.testCases?.map((tc, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-300 mb-3 flex items-center justify-between">
                              Test Case {i + 1}
                              <span className={tc.status_id === 3 ? 'text-green-400' : 'text-red-400'}>
                                {tc.status_id === 3 ? 'Passed' : 'Failed'}
                              </span>
                            </h4>
                            <div className="space-y-3 font-mono text-sm">
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Input</div>
                                <div className="bg-black/40 p-2 rounded border border-white/5 text-gray-300">{tc.stdin}</div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Expected Output</div>
                                <div className="bg-black/40 p-2 rounded border border-white/5 text-gray-300">{tc.expected_output}</div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Your Output</div>
                                <div className={`p-2 rounded border ${tc.status_id === 3 ? 'bg-green-500/5 border-green-500/20 text-green-300' : 'bg-red-500/5 border-red-500/20 text-red-300'}`}>
                                  {tc.stdout || tc.compile_output || 'No output'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <Play size={48} className="mb-4 opacity-20" />
                      <p>Click "Run" to execute your code against sample test cases.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeRightTab === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-6 overflow-y-auto custom-scrollbar"
                >
                  {submitResult ? (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border flex flex-col items-center text-center ${submitResult.accepted ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        {submitResult.accepted ? (
                          <>
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                              <CheckCircle2 size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-400 mb-2">Accepted!</h2>
                            <p className="text-green-400/80 mb-6">Your solution passed all test cases.</p>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                              <XCircle size={32} className="text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-red-400 mb-2">Failed</h2>
                            <p className="text-red-400/80 mb-6">{submitResult.error || "Wrong Answer"}</p>
                          </>
                        )}
                        
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 mb-1">Test Cases</div>
                            <div className="font-mono text-lg text-gray-200">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
                          </div>
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 mb-1">Runtime</div>
                            <div className="font-mono text-lg text-gray-200">{submitResult.runtime}s</div>
                          </div>
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 mb-1">Memory</div>
                            <div className="font-mono text-lg text-gray-200">{submitResult.memory}KB</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <Send size={48} className="mb-4 opacity-20" />
                      <p>Click "Submit" to evaluate your solution against all test cases.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;