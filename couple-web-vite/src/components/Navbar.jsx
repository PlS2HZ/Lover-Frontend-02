import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar as CalendarIcon, 
  PlusCircle, 
  History, 
  LogOut 
} from 'lucide-react';

const Navbar = () => {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItemClass = (path) => `flex flex-col items-center gap-1 transition-all ${
    location.pathname === path ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500'
  }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md p-3 md:p-4 sticky top-0 z-50 border-b border-rose-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* ชื่อแอป: ย่อขนาดในมือถือ */}
        <Link to="/" className="text-lg md:text-2xl font-black text-rose-500 italic uppercase tracking-tighter flex items-center gap-1">
          Lover<span className="text-slate-300 md:text-slate-300">Req</span>
          <span className="text-[10px] font-normal not-italic text-slate-300 hidden md:inline ml-1">0507</span>
        </Link>

        {/* เมนู: ปรับระยะห่างให้พอดีกับจอทุกขนาด */}
        <div className="flex items-center gap-3 md:gap-6 font-bold uppercase tracking-widest">
          <Link to="/" className={navItemClass('/')}>
            <Home size={18} className="md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[9px] font-black">HOME</span>
          </Link>

          {username ? (
            <>
              <button onClick={() => navigate('/calendar')} className={navItemClass('/calendar')}>
                <CalendarIcon size={18} className="md:w-5 md:h-5" />
                <span className="text-[8px] md:text-[9px] font-black">CALENDAR</span>
              </button>

              <Link to="/create" className={navItemClass('/create')}>
                <PlusCircle size={18} className="md:w-5 md:h-5" />
                <span className="text-[8px] md:text-[9px] font-black">REQUEST</span>
              </Link>

              <Link to="/history" className={navItemClass('/history')}>
                <History size={18} className="md:w-5 md:h-5" />
                <span className="text-[8px] md:text-[9px] font-black">HISTORY</span>
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="ml-1 md:ml-2 bg-rose-50 text-rose-500 p-2 md:px-4 md:py-2 rounded-lg md:rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="text-[10px] hidden md:block">LOGOUT</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all text-[10px] md:text-[11px]">
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;