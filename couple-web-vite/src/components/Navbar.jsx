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
    <nav className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-rose-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-rose-500 italic uppercase tracking-tighter flex items-center gap-2">
          LoverRequest <span className="text-sm font-normal not-italic text-slate-300">0507</span>
        </Link>

        <div className="flex items-center gap-6 font-bold uppercase tracking-widest">
          {/* HOME */}
          <Link to="/" className={navItemClass('/')}>
            <Home size={20} />
            <span className="text-[9px] font-black">HOME</span>
          </Link>

          {username ? (
            <>
              {/* CALENDAR */}
              <button onClick={() => navigate('/calendar')} className={navItemClass('/calendar')}>
                <CalendarIcon size={20} />
                <span className="text-[9px] font-black">CALENDAR</span>
              </button>

              {/* REQUEST */}
              <Link to="/create" className={navItemClass('/create')}>
                <PlusCircle size={20} />
                <span className="text-[9px] font-black">REQUEST</span>
              </Link>

              {/* HISTORY */}
              <Link to="/history" className={navItemClass('/history')}>
                <History size={20} />
                <span className="text-[9px] font-black">HISTORY</span>
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="ml-2 bg-rose-50 text-rose-500 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="text-[10px] hidden md:block">LOGOUT ({username})</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all text-[11px]">
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;