import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Code2, Play, Send, CheckCircle2, XCircle, ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axiosClient from '../utils/axiosClient';
import Editor from '@monaco-editor/react';
import Navbar from '../components/Navbar';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const Battle = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('lobby'); // lobby, queuing, battle, finished
  const [matchData, setMatchData] = useState(null);
  const [problem, setProblem] = useState(null);
  
  // Battle state
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState('Solving...');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [winnerId, setWinnerId] = useState(null);

  const editorRef = useRef(null);

  // Initialize Socket Connection
  useEffect(() => {
    if (!user) return;
    
    // Connect to backend socket
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      withCredentials: true
    });
    
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("matchFound", async (data) => {
      setMatchData(data);
      // Fetch the assigned problem
      try {
        const response = await axiosClient.get(`/problem/problemById/${data.problemId}`);
        setProblem(response.data);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
        setCode(initialCode);
        setGameState('battle');
      } catch (error) {
        console.error("Failed to load battle problem:", error);
      }
    });

    socket.on("opponentTyping", () => {
      setOpponentStatus('Typing...');
      // Reset to solving after 2s of no typing event
      setTimeout(() => setOpponentStatus('Solving...'), 2000);
    });

    socket.on("opponentSubmission", (data) => {
      if (data.userId !== user._id) {
        setOpponentStatus(data.status === 'wrong' ? 'Wrong Answer!' : 'Running tests...');
        setTimeout(() => setOpponentStatus('Solving...'), 4000);
      }
    });

    socket.on("matchEnded", (data) => {
      setWinnerId(data.winner);
      setGameState('finished');
    });

    socket.on("opponentDisconnected", (data) => {
      setWinnerId(user._id);
      setGameState('finished');
    });

    return () => {
      socket.off("matchFound");
      socket.off("opponentTyping");
      socket.off("opponentSubmission");
      socket.off("matchEnded");
      socket.off("opponentDisconnected");
    };
  }, [socket, selectedLanguage, user]);

  // Timer Countdown
  useEffect(() => {
    if (gameState !== 'battle') return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const joinQueue = () => {
    if (!socket) return;
    setGameState('queuing');
    socket.emit('joinQueue', {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName
    });
  };

  const leaveQueue = () => {
    if (!socket) return;
    socket.emit('leaveQueue');
    setGameState('lobby');
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (socket && matchData) {
      socket.emit('typing', { roomId: matchData.roomId, userId: user._id });
    }
  };

  const handleEditorDidMount = (editor) => editorRef.current = editor;

  const handleSubmitCode = async () => {
    if (!problem || !matchData) return;
    setLoading(true);
    
    try {
      await axiosClient.post(`/submission/submit/${problem._id}`, {
        code: code,
        language: selectedLanguage,
        matchId: matchData.matchId,
        roomId: matchData.roomId
      });
      // The socket will broadcast the result and handle game over
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Swords size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Login Required</h1>
        <p className="text-gray-400 mb-6">You must be logged in to access the Battle Arena.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">Login Now</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-white font-sans overflow-hidden selection:bg-red-500/30">
      
      {/* Dynamic Header */}
      {gameState === 'lobby' || gameState === 'queuing' ? (
        <Navbar />
      ) : (
        <nav className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center">
                <Swords size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">Battle Arena</span>
            </div>
          </div>
          
          {gameState === 'battle' && matchData && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 font-bold uppercase">You</span>
                  <span className="text-sm font-medium text-blue-400">{user.firstName}</span>
                </div>
                <div className="text-2xl font-bold text-white px-2">VS</div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500 font-bold uppercase">Opponent</span>
                  <span className="text-sm font-medium text-red-400">
                    {matchData.players.find(p => p.userId !== user._id)?.name}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-none">{opponentStatus}</span>
                </div>
              </div>
              
              <div className="text-xl font-mono font-bold text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                {formatTime(timeLeft)}
              </div>

              <button
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90 transition-opacity text-sm font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50"
                onClick={handleSubmitCode}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit & Win
              </button>
            </div>
          )}
        </nav>
      )}

      {/* Main Content Areas */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Lobby State */}
        {gameState === 'lobby' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] border border-red-500/20">
                <Swords size={48} className="text-red-500" />
              </div>
              <h1 className="text-5xl font-black mb-4 tracking-tight">1v1 Battle Arena</h1>
              <p className="text-gray-400 text-lg mb-8">
                Compete against other developers in real-time. Both players are given the same problem. The first to submit an accepted solution wins!
              </p>
              <button 
                onClick={joinQueue}
                className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-500 transition-colors shadow-[0_0_30px_rgba(220,38,38,0.5)]"
              >
                Find Match
              </button>
            </motion.div>
          </div>
        )}

        {/* Queuing State */}
        {gameState === 'queuing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#050505]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-[#111] border border-red-500/30 p-12 rounded-3xl text-center shadow-[0_0_100px_rgba(239,68,68,0.15)]"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <SearchIcon />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Searching for Opponent...</h2>
              <p className="text-gray-400 mb-8">Estimated wait time: less than a minute</p>
              <button 
                onClick={leaveQueue}
                className="text-gray-500 hover:text-white transition-colors"
              >
                Cancel Search
              </button>
            </motion.div>
          </div>
        )}

        {/* Finished State Modal Overlay */}
        {gameState === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={`p-10 rounded-3xl text-center border max-w-md w-full ${winnerId === user._id ? 'bg-green-900/20 border-green-500/50 shadow-[0_0_100px_rgba(34,197,94,0.2)]' : 'bg-red-900/20 border-red-500/50 shadow-[0_0_100px_rgba(239,68,68,0.2)]'}`}
            >
              {winnerId === user._id ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500">
                    <Trophy size={40} className="text-green-400" />
                  </div>
                  <h2 className="text-4xl font-black text-green-400 mb-2">VICTORY</h2>
                  <p className="text-gray-300 mb-8">You solved the problem first!</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500">
                    <XCircle size={40} className="text-red-400" />
                  </div>
                  <h2 className="text-4xl font-black text-red-400 mb-2">DEFEAT</h2>
                  <p className="text-gray-300 mb-8">
                    {winnerId ? "Your opponent solved it first." : "Time ran out!"}
                  </p>
                </>
              )}
              <button 
                onClick={() => { setGameState('lobby'); setMatchData(null); }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/20"
              >
                Return to Lobby
              </button>
            </motion.div>
          </div>
        )}

        {/* Battle Arena */}
        {(gameState === 'battle' || gameState === 'finished') && problem && (
          <div className="flex w-full h-full">
            {/* Left Panel: Problem Description */}
            <div className="w-1/2 border-r border-white/10 bg-[#0a0a0a]/50 p-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white leading-tight">{problem.title}</h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-red-400/20 text-red-400 bg-red-400/10">
                  Battle Mode
                </span>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed mb-6">
                <div className="whitespace-pre-wrap">{problem.description}</div>
              </div>
              <div className="space-y-4">
                {problem.visibleTestCases.map((example, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <h4 className="font-semibold text-white mb-3 text-sm">Example {index + 1}:</h4>
                    <div className="space-y-2 text-sm font-mono text-gray-300">
                      <div className="flex"><span className="text-gray-500 w-24 shrink-0">Input:</span> <span>{example.input}</span></div>
                      <div className="flex"><span className="text-gray-500 w-24 shrink-0">Output:</span> <span className="text-white">{example.output}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="w-1/2 flex flex-col bg-[#050505]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0a0a0a]/50">
                <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Code2 size={16} /> Solution Editor
                </div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-300 focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="flex-1 relative pt-2">
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
                    padding: { top: 16 }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted search icon for cleanliness
const SearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default Battle;
