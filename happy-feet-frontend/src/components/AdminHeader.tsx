import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/index.ts';
import { logout } from '../redux/authSlice.ts';
import { Bell, LogOut, User, Menu, ChevronDown, Settings } from 'lucide-react';

interface AdminHeaderProps {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ setIsSidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 text-slate-800 shadow-xs">
      <div className="px-4 md:px-8 py-4 flex justify-between items-center">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl md:hidden transition-all"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase">Happy Feet Enterprise</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-xl hover:bg-slate-50">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-slate-100"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase mt-1">{user?.role}</p>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                <User size={14} />
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden z-50 text-slate-700">
                <button 
                  onClick={() => { setShowDropdown(false); navigate('/dashboard'); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 font-semibold transition-colors"
                >
                  <Settings size={14} /> Control Panel
                </button>
                <button 
                  onClick={() => { dispatch(logout()); navigate('/', { replace: true }); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold border-t border-slate-100 transition-colors"
                >
                  <LogOut size={14} /> Close Session
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};