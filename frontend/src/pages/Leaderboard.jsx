import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/profile/leaderboard');
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-yellow-500"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 pb-20">
      <Navbar />
      
      {/* Background glow */}
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-orange-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] mb-6">
            <Trophy className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Global Leaderboard</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Compete with the best developers across the globe. Solve problems, build your streak, and climb the ranks.</p>
        </motion.div>

        {/* Top 3 Podium */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-16 px-4">
          {/* Rank 2 */}
          {users[1] && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full md:w-1/3 max-w-[250px] mx-auto md:mx-0 flex flex-col items-center">
              <div className="bg-gradient-to-b from-gray-300/20 to-transparent border border-gray-300/30 p-6 rounded-t-3xl w-full text-center relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-300 rounded-b-full"></div>
                <div className="w-16 h-16 rounded-full bg-gray-300/20 flex items-center justify-center mx-auto mb-4 border border-gray-300/50">
                  <span className="text-2xl font-bold text-gray-200">#2</span>
                </div>
                <h3 className="font-bold text-lg text-white mb-1 truncate w-full">{users[1].firstName} {users[1].lastName}</h3>
                <div className="text-gray-400 flex items-center justify-center gap-1"><Star size={14} className="text-gray-400 fill-gray-400" /> {users[1].points || 0} pts</div>
              </div>
            </motion.div>
          )}

          {/* Rank 1 */}
          {users[0] && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full md:w-1/3 max-w-[280px] mx-auto md:mx-0 flex flex-col items-center z-10 md:-translate-y-8">
              <div className="bg-gradient-to-b from-yellow-500/20 to-transparent border border-yellow-500/40 p-8 rounded-t-3xl w-full text-center relative overflow-hidden backdrop-blur-xl shadow-[0_-20px_40px_rgba(234,179,8,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-yellow-400 rounded-b-full shadow-[0_0_10px_rgba(250,204,21,1)]"></div>
                <div className="absolute top-2 right-2 text-yellow-500/30"><Trophy size={48} /></div>
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] relative">
                  <Medal className="absolute -bottom-2 text-yellow-400 drop-shadow-md" size={24} />
                  <span className="text-3xl font-bold text-yellow-400">#1</span>
                </div>
                <h3 className="font-bold text-xl text-white mb-1 truncate w-full">{users[0].firstName} {users[0].lastName}</h3>
                <div className="text-yellow-500 font-bold flex items-center justify-center gap-1"><Star size={16} className="fill-yellow-500" /> {users[0].points || 0} pts</div>
              </div>
            </motion.div>
          )}

          {/* Rank 3 */}
          {users[2] && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full md:w-1/3 max-w-[250px] mx-auto md:mx-0 flex flex-col items-center">
              <div className="bg-gradient-to-b from-orange-700/20 to-transparent border border-orange-700/30 p-6 rounded-t-3xl w-full text-center relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-orange-700 rounded-b-full"></div>
                <div className="w-16 h-16 rounded-full bg-orange-700/20 flex items-center justify-center mx-auto mb-4 border border-orange-700/50">
                  <span className="text-2xl font-bold text-orange-400">#3</span>
                </div>
                <h3 className="font-bold text-lg text-white mb-1 truncate w-full">{users[2].firstName} {users[2].lastName}</h3>
                <div className="text-orange-400 flex items-center justify-center gap-1"><Star size={14} className="fill-orange-400" /> {users[2].points || 0} pts</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* The Rest of the Ranks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                  <th className="py-4 px-6 font-medium w-20">Rank</th>
                  <th className="py-4 px-6 font-medium">Developer</th>
                  <th className="py-4 px-6 font-medium text-center">Current Streak</th>
                  <th className="py-4 px-6 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(3).map((user, index) => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 text-gray-500 font-medium">#{index + 4}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                          {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                        </div>
                        <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full text-xs font-medium">
                        🔥 {user.currentStreak || 0}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-yellow-500">
                      {user.points || 0}
                    </td>
                  </tr>
                ))}
                {users.length <= 3 && (
                  <tr><td colSpan="4" className="py-12 text-center text-gray-500">More players needed to fill the leaderboard!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
