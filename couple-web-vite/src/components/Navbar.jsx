import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios'; // ✅ เพิ่ม axios เพื่อดึงข้อมูลสด
import { Home, Calendar, Send, History, LogOut, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../ThemeConstants';

const Navbar = () => {
  const location = useLocation();
  const { currentTheme, nextTheme, prevTheme } = useTheme();
  const userId = localStorage.getItem('user_id');
  
  const [userData, setUserData] = useState({
    username: localStorage.getItem('username'),
    avatarUrl: localStorage.getItem('avatar_url')
  });

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

  // ✅ ดักจับการเปลี่ยนแปลงและซิงค์ข้อมูลจาก Database
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`);
        if (Array.isArray(res.data)) {
          const me = res.data.find(u => u.id === userId);
          if (me) {
            setUserData({ username: me.username, avatarUrl: me.avatar_url });
            localStorage.setItem('username', me.username);
            localStorage.setItem('avatar_url', me.avatar_url);
          }
        }
      } catch (err) { console.error("Navbar Sync Error:", err); }
    };

    if (userId) syncProfile();

    const handleStorageChange = () => {
      setUserData({
        username: localStorage.getItem('username'),
        avatarUrl: localStorage.getItem('avatar_url')
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location, userId, API_URL]);

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่? ❤️")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} /> }, 
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={18} /> },
    { name: 'Request', path: '/create', icon: <Send size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
  ];

  const themeColors = {
    home: 'border-rose-100 text-rose-600 bg-rose-50',
    newyear: 'border-yellow-200 text-yellow-600 bg-yellow-50',
    chinese: 'border-red-200 text-red-600 bg-red-50',
    christmas: 'border-emerald-200 text-emerald-600 bg-emerald-50',
    summer: 'border-orange-200 text-orange-600 bg-orange-50',
    winter: 'border-blue-200 text-blue-600 bg-blue-50',
    rainy: 'border-slate-200 text-slate-600 bg-slate-50',
    day: 'border-sky-200 text-sky-600 bg-sky-50',
    night: 'border-indigo-200 text-indigo-600 bg-indigo-50',
  };

  const activeColor = themeColors[currentTheme.id] || themeColors.home;

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <>
      <nav className={`bg-white sticky top-0 z-[100] border-b ${activeColor.split(' ')[0]} px-4 py-2 transition-colors duration-1000`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl shadow-md overflow-hidden group-hover:rotate-12 transition-transform">
              <img src="/com2.jpg" alt="Couple Icon" className="w-full h-full object-cover" />
            </div>
            <span className={`text-xl font-black italic tracking-tighter uppercase transition-colors duration-1000 ${activeColor.split(' ')[1]}`}>
              LOVER
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {userData.username && navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`p-2 rounded-xl transition-all ${location.pathname === item.path ? activeColor : 'text-slate-300 hover:text-rose-400'}`}
              >
                {item.icon}
              </Link>
            ))}

            {userData.username ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
                <Link to="/profile" className="flex items-center gap-2 group">
                  {/* ✅ แก้ไขจุดนี้: แสดงผลรูปจริงจาก Database หรือ UI Avatar */}
                  <img 
                    src={userData.avatarUrl && userData.avatarUrl !== 'null' && userData.avatarUrl !== 'NULL' && userData.avatarUrl !== '' 
                      ? userData.avatarUrl 
                      : `https://ui-avatars.com/api/?name=${userData.username}&background=random`} 
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover group-hover:border-rose-300 transition-all bg-slate-50"
                    alt="Avatar"
                    key={userData.avatarUrl} 
                  />
                  <span className="text-xs font-black text-slate-700 uppercase hidden md:block">{userData.username}</span>
                </Link>
                <button onClick={handleLogout} className="text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="bg-rose-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-sm flex items-center gap-1">
                  <LogIn size={14} /> เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="fixed bottom-6 left-6 z-[999] flex flex-col items-center gap-2">
        <button onClick={prevTheme} className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg border border-rose-100 text-rose-500 hover:scale-110 active:scale-90 transition-all">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-center gap-2">
        <button onClick={nextTheme} className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg border border-rose-100 text-rose-500 hover:scale-110 active:scale-90 transition-all">
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[998] pointer-events-none">
          <span className="bg-white/40 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Season: {currentTheme.name}
          </span>
      </div>
    </>
  );
};

export default Navbar;