import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Send, History, LogOut, LogIn } from 'lucide-react';

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
    { name: 'Home', path: '/', icon: <Calendar size={18} /> }, // หรือใช้ไอคอนอื่นตามเหมาะสม
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={18} /> },
    { name: 'Request', path: '/create', icon: <Send size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
  ];

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="bg-white sticky top-0 z-[100] border-b border-rose-100 px-4 py-2">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* ✅ ส่วนที่ 1: เปลี่ยนชื่อเป็น Lover และเปลี่ยนไอคอนหัวใจเป็นรูปคู่รัก */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl shadow-md overflow-hidden group-hover:rotate-12 transition-transform">
            {/* 💖 ใส่ URL รูปคู่รักของคุณตรงนี้ครับ */}
            <img 
              src="/Photo on 16-7-2568 BE at 09.35.jpg" 
              alt="Couple Icon" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-black text-rose-600 italic tracking-tighter uppercase">LOVER</span>
        </Link>

        {/* ส่วนที่ 2 & 3: เมนูและสถานะผู้ใช้ (คงเดิม) */}
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

          {username ? (
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