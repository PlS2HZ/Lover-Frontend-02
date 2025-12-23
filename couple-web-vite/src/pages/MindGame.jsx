import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  PlusCircle, 
  Gamepad2, 
  Lock, 
  Play, 
  Trophy, 
  Clock, 
  User,
  ChevronRight,
  Heart // ✅ เพิ่ม Heart เข้ามาสำหรับแสดงในกล่องคำเชิญ
} from 'lucide-react';

const MindGame = () => { // ✅ รับ props user เข้ามาใช้งาน
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]); // ✅ เพิ่ม State สำหรับเก็บคำเชิญ
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  // ✅ กำหนด API_URL ให้ถูกต้อง
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

  // ✅ ดึงข้อมูลคำเชิญที่ค้างอยู่ (Pending Invitations)
  // ใน MindGame.jsx
useEffect(() => {
    const fetchInvites = async () => {
        const currentUserId = localStorage.getItem('user_id'); // ✅ ดึงใหม่ทุกครั้งเพื่อความชัวร์
        if (!currentUserId) return;

        try {
            const res = await fetch(`${API_URL}/api/game/invitations?user_id=${currentUserId}`);
            const data = await res.json();
            console.log("📨 รายการคำเชิญที่ได้รับ:", data); // ✅ เพิ่ม Log ไว้เช็คใน Console
            setInvites(data || []);
        } catch (err) {
            console.error("❌ Fetch invites error:", err);
        }
    };

    fetchInvites();
    const interval = setInterval(fetchInvites, 5000); // ✅ เช็คทุก 5 วินาทีให้ไวขึ้น
    return () => clearInterval(interval);
}, [API_URL]);

  useEffect(() => {
    fetchLevels();
    
    // Subscribe Real-time เมื่อมีการสร้างโจทย์ใหม่
    const channel = supabase.channel('lobby-updates')
      .on('postgres_changes', { event: '*', table: 'heart_games' }, fetchLevels)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('heart_games')
        .select(`
          *,
          host:users!heart_games_host_id_fkey(username)
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLevels(data || []);
    } catch (err) {
      console.error("Fetch levels error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdfd] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-rose-100 p-6 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter flex items-center gap-2">
              <Gamepad2 className="text-purple-500" size={32} />
              Mind Game
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              คลังโจทย์ทายใจสุดพรีเมียม
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/create-level')}
            className="group flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl font-bold text-xs uppercase italic transition-all hover:bg-rose-500 active:scale-95 shadow-lg shadow-slate-200"
          >
            <PlusCircle size={18} />
            สร้างด่าน
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 mt-4">
        
        {/* ✅ กล่องแจ้งเตือนคำเชิญ (Invitation Box) - ย้ายมาไว้นอกลูป map */}
        {/* ✅ กล่องแจ้งเตือนคำเชิญ */}
{invites.length > 0 && (
  <div className="max-w-2xl mx-auto px-4 mt-6">
    <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 rounded-[2.5rem] text-white shadow-xl mb-6 animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/20 p-3 rounded-2xl">
          <Heart className="animate-pulse" fill="white" size={24} />
        </div>
        <div>
          <h3 className="font-black italic uppercase text-lg leading-tight">มีคนท้าคุณ!</h3>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">แฟนกำลังรอคำตอบอยู่ในเกม</p>
        </div>
      </div>
      <div className="space-y-2">
        {invites.map(inv => (
          <button 
            key={inv.id}
            onClick={() => navigate(`/game-session/${inv.sessions?.id}?mode=human`)} // ✅ วาร์ปเข้า Session
            className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black uppercase italic text-xs hover:bg-rose-50 transition-all flex justify-between px-6 items-center shadow-md active:scale-95"
          >
            <span>รับคำท้าของ {inv.host?.username}</span>
            <ChevronRight size={18} className="text-rose-500" />
          </button>
        ))}
      </div>
    </div>
  </div>
)}

{loading ? ( // ของเดิมที่มีอยู่แล้ว
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold italic text-sm">กำลังโหลดคลังโจทย์...</p>
          </div>
        ) : levels.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 size={40} className="text-slate-300" />
            </div>
            <h3 className="text-slate-500 font-black uppercase italic">ยังไม่มีโจทย์ในขณะนี้</h3>
            <p className="text-slate-400 text-xs font-bold mt-2">เริ่มสร้างโจทย์แรกเพื่อท้าทายแฟนของคุณ!</p>
          </div>
        ) : (
          levels.map((level, index) => {
            const isOwner = level.host_id === userId;
            const levelNumber = levels.length - index;

            return (
              <div 
                key={level.id}
                className={`relative bg-white rounded-[2rem] p-5 shadow-xl shadow-slate-100 border-2 transition-all hover:translate-x-1 ${
                  isOwner ? 'border-slate-100 opacity-80' : 'border-rose-50 hover:border-rose-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200">
                      <span className="text-[10px] font-black uppercase italic leading-none mb-1 text-rose-400">Lv.</span>
                      <span className="text-xl font-black leading-none">{levelNumber}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-rose-50 text-rose-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {isOwner ? 'ด่านของฉัน' : 'ท้าทาย'}
                        </span>
                        <span className="text-slate-300 text-[10px] font-bold flex items-center gap-1 uppercase">
                          <Clock size={10} /> {new Date(level.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-700 uppercase italic flex items-center gap-2">
                        โจทย์จาก: {level.host?.username || 'Unknown'}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase italic flex items-center gap-1 mt-1">
                        <Trophy size={12} className="text-amber-400" /> Best Time: --:--
                      </p>
                    </div>
                  </div>

                  {isOwner ? (
                    <div className="bg-slate-50 text-slate-300 p-4 rounded-2xl border border-slate-100" title="คุณไม่สามารถเล่นโจทย์ตัวเองได้">
                      <Lock size={20} />
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate(`/playmindgame/${level.id}`)}
                      className="bg-gradient-to-br from-rose-400 to-pink-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 hover:scale-110 active:scale-90 transition-all"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">?</div>
                   </div>
                   <span className="text-[9px] font-black text-slate-300 uppercase italic">คลิกเพื่อดูรายละเอียด</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Info */}
      <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            โจทย์จะถูกลบอัตโนมัติเมื่อครบ 30 วัน
          </p>
      </div>
    </div>
  );
};

export default MindGame;