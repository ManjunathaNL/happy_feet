import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/index.ts';
import { RouteAccess } from '../redux/authSlice.ts';
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  Settings,      // Mapped to Route Settings
  Package,       // Mapped to Brand Management
  Layers,        // Mapped to Category Management
  Boxes,         // Mapped to Product Catalog
  Warehouse,     // Mapped to Inventory Tracker
  KeyRound,      // Mapped to Access Mappings
  ShieldAlert,
  X 
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, routes } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Matches backend database seed strings exactly to avoid component render blocks
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'dashboard': 
        return LayoutDashboard;
      case 'user management': 
        return Users;
      case 'role management': 
        return FolderTree;
      case 'route settings': 
        return Settings;
      case 'product catalog': 
        return Boxes;
      case 'inventory tracker': 
        return Warehouse;
      case 'access mappings': 
        return KeyRound;
      default: 
        return ShieldAlert; // Wildcard fallback prevents breaking if unexpected entries appear
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className="fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-50 md:relative md:translate-x-0 w-64 border-r border-black/10 flex flex-col h-screen overflow-hidden bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)]">
        
        {/* Brand Banner */}
        <div className="flex items-center justify-between h-20 border-b border-white/10 px-6 shrink-0">
          <h2 className="text-xl font-black tracking-widest">HAPPY FEET</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden opacity-70 hover:opacity-100 p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Admin Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <nav className="space-y-1">
            {routes && routes.map((item: RouteAccess, idx: number) => {
              const IconComponent = getIcon(item.name);
              const calculatedPath = item.path;
              
              return (
                <NavLink
                  key={idx}
                  to={calculatedPath}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 group ${
                      isActive 
                        ? 'bg-white text-slate-900 shadow-md' 
                        : 'opacity-75 hover:bg-white/10 hover:opacity-100'
                    }`
                  }
                >
                  <IconComponent 
                    size={16} 
                    className={`${location.pathname === calculatedPath ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} 
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Identity Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.name}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};