import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Code2, LogOut, Shield, Search, LayoutDashboard, Trophy, Swords } from 'lucide-react';
import { logoutUser } from '../authSlice';
import { useState } from 'react';
import CommandPalette from './CommandPalette';

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">CodingAdda</span>
          </NavLink>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <Search size={14} />
              <span>Cmd + K</span>
            </button>

            <NavLink to="/battle" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:text-red-400 hover:bg-red-500/20 transition-all text-sm font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              <Swords size={14} /> 1v1 Battle
            </NavLink>

            <NavLink to="/leaderboard" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-yellow-500 hover:text-yellow-400 hover:bg-white/10 transition-all text-sm font-bold">
              <Trophy size={14} /> Leaderboard
            </NavLink>

            {user && (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar border border-white/10 bg-white/5 hover:bg-white/10">
                  <div className="w-9 rounded-full flex items-center justify-center font-bold text-yellow-500">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 p-2 shadow-2xl menu menu-sm dropdown-content bg-[#111] border border-white/10 rounded-xl w-52 z-50">
                  <li className="px-4 py-2 border-b border-white/10 mb-2">
                    <div className="text-sm opacity-50 text-gray-400">Signed in as</div>
                    <div className="font-bold text-white">{user?.firstName}</div>
                  </li>
                  <li>
                    <NavLink to="/dashboard" className="hover:bg-white/10 text-gray-300 hover:text-white rounded-lg">
                      <LayoutDashboard size={16} /> My Dashboard
                    </NavLink>
                  </li>
                  <li className="md:hidden">
                    <NavLink to="/leaderboard" className="hover:bg-white/10 text-yellow-500 rounded-lg">
                      <Trophy size={16} /> Leaderboard
                    </NavLink>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <NavLink to="/admin" className="hover:bg-white/10 text-gray-300 hover:text-white rounded-lg">
                        <Shield size={16} /> Admin Dashboard
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-lg mt-1">
                      <LogOut size={16} /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
