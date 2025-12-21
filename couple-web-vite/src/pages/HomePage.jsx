import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Heart, Rocket, ClipboardList } from 'lucide-react';

// ✅ 1. ย้ายมาไว้นอก HomePage เพื่อแก้ Error: Cannot create components during render
const PhotoCard = ({ src, rotate }) => (
  <div className={`w-24 h-24 md:w-32 md:h-32 bg-white p-2 shadow-lg rounded-lg transition-all duration-500 hover:rotate-0 hover:scale-110 cursor-pointer ${rotate} border border-rose-100`}>
    <img src={src} className="w-full h-full object-cover rounded" alt="Memories" />
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [specialEvents, setSpecialEvents] = useState([]);
  const userId = localStorage.getItem('user_id');
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://lover-backend.onrender.com';

  // ดึงรายการสำคัญจาก Backend
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/highlights?user_id=${userId}`);
        setSpecialEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching highlights:", err);
      }
    };
    if (userId) fetchHighlights();
  }, [userId, API_URL]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-rose-50 p-4 relative overflow-hidden flex items-center justify-center">
      
      {/* ✨ ฝั่งซ้าย: รูปภาพความทรงจำ */}
      <div className="hidden lg:flex flex-col gap-8 absolute left-12 top-1/4">
        {/* ✅ เรียกใช้งานได้ปกติแล้ว */}
        <PhotoCard src="/Photo on 16-7-2568 BE at 09.35.jpg" rotate="-rotate-12" />
        <PhotoCard src="/Photo on 16-7-2568 BE at 09.35.jpg" rotate="rotate-6" />
        <PhotoCard src="/Photo on 16-7-2568 BE at 09.35.jpg" rotate="-rotate-3" />
      </div>

      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-8 items-center justify-center">
        
        {/* ส่วนกลาง: Welcome Space */}
        <div className="flex-1 w-full flex justify-center order-2 lg:order-1">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-rose-200 border border-rose-100 max-w-lg w-full text-center relative z-10">
            <div className="text-7xl mb-6 animate-pulse select-none">💖</div>
            
            <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
              Welcome to <span className="text-rose-500">Our Space</span>
            </h1>
            
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              ยินดีต้อนรับสู่พื้นที่ส่วนตัวของเราสองคนนะ<br/>
              อยากขออนุญาตไปไหน หรืออยากตรวจรายการที่ค้างไว้<br/>
              เลือกกดเมนูด้านล่างนี้ได้เลย!
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => navigate('/create')}
                className="bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 hover:shadow-rose-300 transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
              >
                สร้างคำขอใหม่ ✨ <Rocket size={20}/>
              </button>
              
              <button 
                onClick={() => navigate('/history')} 
                className="bg-slate-50 text-slate-600 font-black py-4 rounded-2xl border-2 border-slate-100 hover:bg-white hover:border-rose-200 hover:text-rose-500 transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
              >
                ดูรายการคำขอทั้งหมด <ClipboardList size={20}/>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-50">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
                Design with Love for us
              </p>
            </div>
          </div>
        </div>

        {/* ✨ ฝั่งขวา: รายการสำคัญ */}
        <div className="w-full lg:w-80 space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-rose-100">
            <h3 className="text-rose-500 font-black flex items-center gap-2 mb-4 text-lg">
              <Star size={20} fill="currentColor" className="text-yellow-400"/> รายการสำคัญ
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {specialEvents.length > 0 ? specialEvents.map((ev) => (
                <div key={ev.id} className="p-4 bg-rose-50 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-colors">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{ev.title}</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(ev.event_date)}</p>
                  {ev.description && <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{ev.description}</p>}
                </div>
              )) : (
                <div className="py-8 text-center">
                  <Heart size={24} className="mx-auto text-rose-200 mb-2" />
                  <p className="text-xs font-bold text-slate-400">ยังไม่มีวันสำคัญจดไว้เลย</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-6 pt-2">
            <PhotoCard src="/Photo on 16-7-2568 BE at 09.35.jpg" rotate="rotate-12" />
            <PhotoCard src="/Photo on 16-7-2568 BE at 09.35.jpg" rotate="-rotate-6" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;