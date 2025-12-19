import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, RefreshCw, Clock, User, ArrowRight } from 'lucide-react';

const HistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const userId = localStorage.getItem('user_id');
  const API_URL = "https://lover-backend.onrender.com";

  const refreshList = useCallback(async (showSilent = false) => {
    if (!userId) return;
    if (!showSilent) setLoading(true);
    try {
      // เพิ่ม timestamp ป้องกัน cache เพื่อให้ข้อมูลเป็นปัจจุบันที่สุด
      const res = await axios.get(`${API_URL}/api/my-requests?user_id=${userId}&t=${Date.now()}`);
      if (Array.isArray(res.data)) {
        const sortedData = res.data.sort((a, b) => b.id.localeCompare(a.id));
        setRequests(sortedData);
      }
    } catch (error) { 
      console.error("Fetch Error:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [userId]);

  useEffect(() => { refreshList(); }, [refreshList]);

  const updateStatus = async (id, newStatus) => {
    try {
        const reason = newStatus === 'rejected' ? prompt("ระบุเหตุผลที่ไม่ส่งอนุมัติ:") : "";
        if (newStatus === 'rejected' && reason === null) return;

        // 1. ส่งคำขออัปเดต
        const res = await axios.post(`${API_URL}/api/update-status`, {
            id: id,
            status: newStatus,
            comment: reason
        });

        // 2. ✨ แก้ไขจุดสำคัญ: เช็คความสำเร็จแบบกว้างขึ้น และบังคับ Refresh
        if (res.status >= 200 && res.status < 300) {
            alert(`ดำเนินการ ${newStatus === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'} เรียบร้อยแล้ว ✨`);
            // โหลดข้อมูลใหม่ทันที รายการจะย้าย Tab เอง
            await refreshList(true); 
        }
    } catch (err) {
        console.error("updateStatus Error:", err);
        // หากเกิด Error แต่จริงๆ ใน DB อาจจะเปลี่ยนแล้ว ให้ลอง Refresh ดู
        alert("ระบบกำลังประมวลผล โปรดตรวจสอบในหน้าประวัติคำขอ");
        await refreshList(true);
    }
  };

  // กรองรายการ: รองรับทั้ง String และ Number
  const pendingList = requests.filter(r => r.status === 'pending' && String(r.receiver_id) === String(userId));
  const historyList = requests.filter(r => r.status !== 'pending' || (r.status === 'pending' && String(r.sender_id) === String(userId)));

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4 text-rose-400 font-black italic px-4 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-rose-500"></div>
      <p>กำลังเปิดระบบ โปรดรอสักครู่... ❤️</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 pb-24 font-sans">
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 italic uppercase flex items-center gap-3">
          History <span className="text-2xl md:text-3xl">📋</span>
        </h2>
        <button onClick={() => refreshList()} className="bg-white border-2 border-slate-100 shadow-sm px-4 py-2 rounded-2xl hover:border-rose-200 hover:text-rose-500 transition-all text-[10px] md:text-xs font-black flex items-center gap-2">
            <RefreshCw size={14} /> REFRESH
        </button>
      </div>

      {/* Responsive Tabs */}
      <div className="flex gap-2 md:gap-4 mb-8 md:mb-12 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-50">
        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 md:py-6 rounded-xl md:rounded-[2rem] text-xs md:text-base font-black transition-all ${activeTab === 'pending' ? 'bg-rose-500 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}>
          รออนุมัติ ({pendingList.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 md:py-6 rounded-xl md:rounded-[2rem] text-xs md:text-base font-black transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}>
          ประวัติ ({historyList.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {(activeTab === 'pending' ? pendingList : historyList).map((item) => (
          <div key={item.id} className={`group bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border-2 transition-all hover:shadow-md ${item.status === 'approved' ? 'border-emerald-50' : item.status === 'rejected' ? 'border-rose-50' : 'border-slate-50'}`}>
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <span className="font-black text-rose-500 text-[9px] md:text-[11px] uppercase bg-rose-50 px-4 py-1.5 rounded-full tracking-wider">{item.category}</span>
              <div className={`px-5 py-1.5 rounded-full font-black text-[10px] md:text-[12px] uppercase shadow-sm ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {item.status}
              </div>
            </div>
            
            <h4 className="text-xl md:text-3xl font-bold text-slate-700 mb-6 leading-tight">{item.title}</h4>
            
            <div className="bg-slate-50/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] mb-8 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between text-[11px] md:text-sm">
                <span className="text-slate-400 flex items-center gap-2"><User size={16}/> ผู้ส่ง:</span>
                <span className="text-rose-500 font-black">{item.sender_name}</span>
              </div>
              <div className="h-px bg-slate-100 w-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] md:text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold uppercase tracking-tighter">📅 เริ่มต้น</span>
                  <span className="text-slate-700 font-black block bg-white p-2 rounded-lg border border-slate-50">{item.remark?.split('|')[0].replace('T', ' ')}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold uppercase tracking-tighter">🏁 สิ้นสุด</span>
                  <span className="text-slate-700 font-black block bg-white p-2 rounded-lg border border-slate-50">{item.remark?.split('|')[1]?.replace('T', ' ')}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">⏱️ ระยะเวลาที่ขอ:</span>
                <span className="text-rose-500 font-black text-sm md:text-xl">{item.description}</span>
              </div>
              {item.comment && (
                <div className="mt-4 p-4 bg-white rounded-2xl text-rose-600 text-xs md:text-sm italic border-l-4 border-rose-300 shadow-sm flex gap-2">
                  <span className="not-italic">💬</span> {item.comment}
                </div>
              )}
            </div>

            {item.status === 'pending' && String(item.receiver_id) === String(userId) && (
              <div className="flex flex-col md:flex-row gap-4 pt-2">
                <button onClick={() => updateStatus(item.id, 'approved')} className="flex-1 bg-emerald-500 text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-lg flex items-center justify-center gap-2">
                   อนุมัติคำขอ 👍
                </button>
                <button onClick={() => updateStatus(item.id, 'rejected')} className="flex-1 bg-rose-500 text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black shadow-lg shadow-rose-100 hover:bg-rose-600 hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-lg flex items-center justify-center gap-2">
                   ไม่อนุมัติคำขอ 👎
                </button>
              </div>
            )}
            
            {item.processed_at && (
              <div className="flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black text-slate-300 uppercase mt-6">
                <Clock size={12}/> ดำเนินการเมื่อ: {new Date(item.processed_at).toLocaleString('th-TH')}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {(activeTab === 'pending' ? pendingList : historyList).length === 0 && (
          <div className="text-center py-24 md:py-40 bg-white rounded-[3rem] md:rounded-[5rem] border-4 border-dashed border-slate-50 text-slate-200 font-black italic uppercase text-lg md:text-2xl">
            ไม่มีรายการในส่วนนี้ ✨
          </div>
      )}
    </div>
  );
};

export default HistoryPage;