import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Calendar, Send, History, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const username = localStorage.getItem('username');
  const avatarUrl = localStorage.getItem('avatar_url');

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่? ❤️")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Heart size={18} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={18} /> },
    { name: 'Request', path: '/create', icon: <Send size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
  ];

  // ไม่แสดง Navbar ในหน้า Login และ Register
  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="bg-white sticky top-0 z-[100] border-b border-rose-100 px-4 py-2">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* ส่วนที่ 1: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-rose-500 p-1.5 rounded-xl shadow-md group-hover:rotate-12 transition-transform">
            <Heart className="text-white" fill="white" size={18} />
          </div>
          <span className="text-xl font-black text-rose-600 italic tracking-tighter uppercase">LOVER REQ</span>
        </Link>

        {/* ส่วนที่ 2: เมนูตรงกลาง (แสดงเฉพาะเมื่อ Login แล้ว) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {username && navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`p-2 rounded-xl transition-all ${location.pathname === item.path ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400'}`}
            >
              {item.icon}
            </Link>
          ))}

          {/* ส่วนที่ 3: สถานะผู้ใช้ */}
          {username ? (
            /* ✅ แสดงเมื่อล็อกอินแล้ว เหมือนรูปอันเก่า */
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
              <Link to="/profile" className="flex items-center gap-2 group">
                <img 
                  src={avatarUrl && avatarUrl !== 'null' ? avatarUrl : `https://ui-avatars.com/api/?name=${username}&background=random`} 
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover group-hover:border-rose-300 transition-all"
                  alt="Avatar"
                />
                <span className="text-xs font-black text-slate-700 uppercase hidden md:block">{username}</span>
              </Link>
              <button onClick={handleLogout} className="text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            /* ✅ แสดงปุ่มเข้าสู่ระบบเมื่อยังไม่ได้ล็อกอิน */
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="bg-rose-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-sm flex items-center gap-1">
                <LogIn size={14} /> เข้าสู่ระบบ
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;