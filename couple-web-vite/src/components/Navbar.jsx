import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Calendar, Send, History, LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const username = localStorage.getItem('username') || '';
  const avatarUrl = localStorage.getItem('avatar_url');

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่? ❤️")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Heart size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Request', path: '/create', icon: <Send size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
  ];

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-rose-100 shadow-sm px-4 py-2">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-rose-500 p-2 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
            <Heart className="text-white" fill="white" size={20} />
          </div>
          <span className="text-xl font-black text-rose-600 italic tracking-tighter hidden sm:block">LOVER REQ</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} className={`flex flex-col items-center p-2 rounded-xl transition-all ${location.pathname === item.path ? 'bg-rose-50 text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}>
              {item.icon}
              <span className="text-[10px] font-bold uppercase mt-1 hidden xs:block">{item.name}</span>
            </Link>
          ))}

          {username && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
              <Link to="/profile" className="flex items-center gap-2 group">
                <img 
                  src={avatarUrl && avatarUrl !== 'null' ? avatarUrl : `https://ui-avatars.com/api/?name=${username}&background=random`} 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover group-hover:border-rose-300 transition-all"
                  alt="Avatar"
                />
                <span className="text-sm font-black text-slate-700 uppercase hidden md:block">{username}</span>
              </Link>
              <button onClick={handleLogout} className="text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;