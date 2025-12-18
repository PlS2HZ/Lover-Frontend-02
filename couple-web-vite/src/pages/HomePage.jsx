import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* การ์ดต้อนรับหลัก */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-rose-200 border border-rose-100 max-w-lg w-full">
        
        {/* หัวใจเต้นเบาๆ */}
        <div className="text-7xl mb-6 animate-pulse select-none">💖</div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
          Welcome to <span className="text-rose-500">Our Space</span>
        </h1>
        
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          ยินดีต้อนรับสู่พื้นที่ส่วนตัวของเราสองคนนะ <br />
          อยากขออนุญาตไปไหน หรืออยากตรวจรายการที่ค้างไว้ <br />
          เลือกกดเมนูด้านล่างนี้ได้เลย!
        </p>
        
        {/* กลุ่มปุ่มนำทางไปยังหน้าที่แยกใหม่ */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/create')}
            className="bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 hover:shadow-rose-300 transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
          >
            สร้างคำขอใหม่ ✨ 🚀
          </button>
          
          <button 
            onClick={() => navigate('/history')} 
            className="bg-slate-50 text-slate-600 font-black py-4 rounded-2xl border-2 border-slate-100 hover:bg-white hover:border-rose-200 hover:text-rose-500 transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
          >
            ดูรายการคำขอทั้งหมด 📋
          </button>
        </div>

        {/* ข้อความตกแต่งท้ายการ์ด */}
        <div className="mt-10 pt-6 border-t border-slate-50">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
            Design with Love for us
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;