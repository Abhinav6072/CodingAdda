import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, BrainCircuit, Activity, Medal, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, heatmapRes] = await Promise.all([
        axiosClient.get('/profile/stats'),
        axiosClient.get('/profile/heatmap')
      ]);
      setStats(statsRes.data);
      setHeatmap(heatmapRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper for heatmap
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = heatmap.find(h => h.date === dateStr);
      days.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-yellow-500"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BrainCircuit className="text-yellow-500" size={40} /> My Dashboard
          </h1>
          <p className="text-gray-400">Track your progress, view your streaks, and keep leveling up.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Streak */}
          <div className="space-y-8 lg:col-span-1">
            {/* Gamification Stats */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Trophy className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Points</p>
                  <h2 className="text-3xl font-bold text-white">{stats?.points || 0}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Flame className="text-orange-500 mb-2" size={24} />
                  <span className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Day Streak</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Medal className="text-yellow-500 mb-2" size={24} />
                  <span className="text-2xl font-bold text-white">{stats?.maxStreak || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Max Streak</span>
                </div>
              </div>
            </motion.div>

            {/* Problem Breakdown */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="text-blue-500" size={20} />
                <h3 className="text-lg font-bold">Problems Solved</h3>
              </div>
              
              <div className="flex items-center justify-center mb-6 relative">
                <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white block">{stats?.totalSolved || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-green-400 font-medium">Easy</span>
                  <span className="font-bold">{stats?.breakdown?.easy || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-yellow-400 font-medium">Medium</span>
                  <span className="font-bold">{stats?.breakdown?.medium || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-red-400 font-medium">Hard</span>
                  <span className="font-bold">{stats?.breakdown?.hard || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Heatmap & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Activity className="text-green-500" size={20} />
                  <h3 className="text-lg font-bold">Activity Heatmap (Last 90 Days)</h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {getDaysArray().map((day, i) => {
                  let bgColor = 'bg-white/5';
                  if (day.count > 0 && day.count < 3) bgColor = 'bg-green-900/60';
                  else if (day.count >= 3 && day.count < 5) bgColor = 'bg-green-600/80';
                  else if (day.count >= 5) bgColor = 'bg-green-400';

                  return (
                    <div 
                      key={i} 
                      className={`w-4 h-4 rounded-sm ${bgColor} transition-colors hover:ring-2 hover:ring-white/50 cursor-pointer`}
                      title={`${day.date}: ${day.count} submissions`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-6 text-xs text-gray-500 justify-end">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-white/5"></div>
                <div className="w-3 h-3 rounded-sm bg-green-900/60"></div>
                <div className="w-3 h-3 rounded-sm bg-green-600/80"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                <span>More</span>
              </div>
            </motion.div>

            {/* Badges / Rewards Section */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                <Star className="text-yellow-500" size={20} />
                <h3 className="text-lg font-bold">Earned Badges</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${stats?.totalSolved >= 1 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/5 border-yellow-500/30' : 'bg-white/5 border-white/10 opacity-50 grayscale'}`}>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3 text-2xl">🌟</div>
                  <span className="font-bold text-sm">First Blood</span>
                  <span className="text-xs text-gray-400 mt-1">Solve 1 problem</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${stats?.currentStreak >= 7 ? 'bg-gradient-to-br from-orange-500/20 to-red-500/5 border-orange-500/30' : 'bg-white/5 border-white/10 opacity-50 grayscale'}`}>
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 text-2xl">🔥</div>
                  <span className="font-bold text-sm">On Fire</span>
                  <span className="text-xs text-gray-400 mt-1">7 day streak</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${stats?.points >= 500 ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/5 border-purple-500/30' : 'bg-white/5 border-white/10 opacity-50 grayscale'}`}>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 text-2xl">💎</div>
                  <span className="font-bold text-sm">High Roller</span>
                  <span className="text-xs text-gray-400 mt-1">Earn 500 points</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${stats?.breakdown?.hard >= 10 ? 'bg-gradient-to-br from-red-500/20 to-rose-500/5 border-red-500/30' : 'bg-white/5 border-white/10 opacity-50 grayscale'}`}>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3 text-2xl">💀</div>
                  <span className="font-bold text-sm">Hardcore</span>
                  <span className="text-xs text-gray-400 mt-1">10 Hard problems</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
