import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-rose-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-rose-500 italic uppercase tracking-tighter">
          LoverRequest <span className="text-sm font-normal not-italic text-slate-300">0507</span>
        </Link>
        
        <div className="flex items-center gap-4 font-bold text-[11px] uppercase tracking-widest">
          <Link to="/" className="text-slate-400 hover:text-rose-500 transition-colors mr-2">Home</Link>
          
          {username ? (
            <>
            <button 
    onClick={() => navigate('/calendar')}
    className={`flex flex-col items-center gap-1 ${location.pathname === '/calendar' ? 'text-rose-500' : 'text-slate-400'}`}
>
    <Calendar size={24} />
    <span className="text-[10px] font-bold">CALENDAR</span>
</button>
              <Link to="/create" className="text-slate-400 hover:text-rose-500 transition-colors">Request</Link>
              <Link to="/history" className="text-slate-400 hover:text-rose-500 transition-colors">History</Link>
              <button onClick={handleLogout} className="ml-2 bg-rose-50 text-rose-500 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100">
                LOGOUT ({username})
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">
                Login
              </Link>
              {/* <Link to="/register" className="bg-rose-500 text-white px-5 py-2 rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">
                Register
              </Link> */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;