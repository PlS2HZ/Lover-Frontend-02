import React from 'react';
// ✅ ลบ useLocation ออกจากรายการ import
import { Link, useNavigate } from 'react-router-dom'; 
import { Heart, LogIn, UserPlus, LogOut, User } from 'lucide-react';

const Navbar = () => {
    // ✅ ลบบรรทัด const location = useLocation(); ออกไปเลยครับ
    const navigate = useNavigate();
    
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const avatarUrl = localStorage.getItem('avatar_url');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-rose-100 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-rose-600 font-black italic uppercase tracking-tighter text-xl">
                    <Heart fill="currentColor" size={24} />
                    Lover Req
                </Link>

                <div className="flex items-center gap-4">
                    {userId ? (
                        <div className="flex items-center gap-3 bg-rose-50 px-3 py-1.5 rounded-2xl border border-rose-100">
                            <Link to="/profile" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-rose-200">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="m-auto mt-1.5 text-rose-400" />
                                    )}
                                </div>
                                <span className="text-xs font-black text-rose-600 uppercase">{username}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-600 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        /* ✅ ปุ่มที่จะโชว์ให้ Guest เห็นเพื่อให้กด Login ได้ */
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="flex items-center gap-1 bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md shadow-rose-200">
                                <LogIn size={14} /> เข้าสู่ระบบ
                            </Link>
                            {/* <Link to="/register" className="flex items-center gap-1 border-2 border-rose-100 text-rose-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
                                <UserPlus size={14} /> สมัคร
                            </Link> */}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;