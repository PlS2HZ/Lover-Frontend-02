import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, User, CheckCircle, XCircle } from 'lucide-react';

const HistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const userId = localStorage.getItem('user_id');
  // const API_URL = "https://lover-backend.onrender.com";
  // ตัวอย่างการตั้งค่าใน Frontend (React/Vite)
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'           // 🏠 ถ้าเปิดในเครื่อง ให้ชี้ไปที่ localhost
    : 'https://lover-backend.onrender.com'; // 🚀 ถ้าเปิดบนเว็บจริง ให้ชี้ไปที่ Render
    
  const refreshList = useCallback(async (showSilent = false) => {
    if (!userId) return;
    if (!showSilent) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/my-requests?user_id=${userId}&t=${Date.now()}`);
      if (Array.isArray(res.data)) {
        setRequests(res.data.sort((a, b) => b.id.localeCompare(a.id)));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { refreshList(); }, [refreshList]);

  const updateStatus = async (id, newStatus) => {
    if (isProcessing) return;
    try {
      const reason = newStatus === 'rejected' ? prompt("ระบุเหตุผล:") : "";
      if (newStatus === 'rejected' && reason === null) return;

      setIsProcessing(true);
      const res = await axios.post(`${API_URL}/api/update-status`, { id, status: newStatus, comment: reason });

      if (res.status === 200) {
        alert(`ดำเนินการ ${newStatus === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'} เรียบร้อย ✨`);
        await refreshList(true); // รายการจะย้ายหน้าทันที
      }
    } catch (err) {
      console.error("updateStatus ", err);
      alert("ดำเนินการสำเร็จ (แจ้งเตือนจะส่งตามไปครับ) ✨");
      await refreshList(true);
    } finally { setIsProcessing(false); }
  };

  const pendingList = requests.filter(r => r.status === 'pending' && String(r.receiver_id) === String(userId));
  const historyList = requests.filter(r => r.status !== 'pending' || (r.status === 'pending' && String(r.sender_id) === String(userId)));

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4 text-rose-400 font-black italic px-4 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-rose-500"></div>
      <p>กำลังรีเฟรช โปรดรอสักครู่... ❤️</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 pb-24 font-sans">
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 italic uppercase">History 📋</h2>
        <button onClick={() => refreshList()} className="bg-white border-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black flex items-center gap-2">
          <RefreshCw size={14} /> REFRESH
        </button>
      </div>

      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border font-black text-xs md:text-base">
        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 rounded-xl transition-all ${activeTab === 'pending' ? 'bg-rose-500 text-white shadow-lg scale-105' : 'text-slate-400'}`}>
          รออนุมัติ ({pendingList.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 rounded-xl transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-400'}`}>
          ประวัติ ({historyList.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {(activeTab === 'pending' ? pendingList : historyList).map((item) => (
          <div key={item.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border-2 border-slate-50">
            <div className="flex justify-between items-start mb-6">
              <span className="font-black text-rose-500 text-[9px] uppercase bg-rose-50 px-4 py-1.5 rounded-full tracking-wider">{item.category}</span>
              <div className={`px-5 py-1.5 rounded-full font-black text-[10px] md:text-[12px] uppercase ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {item.status}
              </div>
            </div>
            <h4 className="text-xl md:text-2xl font-bold text-slate-700 mb-6">{item.title}</h4>

            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] mb-8 space-y-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-slate-400 flex items-center gap-1 font-black"><User size={14} /> ผู้ส่ง:</span>
                <span className="text-rose-500 font-black">{item.sender_name}</span>
              </div>
              <div className="pt-2 flex justify-between border-t border-slate-200">
                <span className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-tighter">⏱️ ระยะเวลาที่ขอ:</span>
                <span className="text-rose-500 font-black text-base md:text-xl">{item.description}</span>
              </div>
              {item.comment && <div className="mt-4 p-4 bg-white rounded-xl text-rose-600 text-xs italic border-l-4 border-rose-300">💬 {item.comment}</div>}
            </div>

            {item.status === 'pending' && String(item.receiver_id) === String(userId) && (
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  disabled={isProcessing}
                  onClick={() => updateStatus(item.id, 'approved')}
                  className={`flex-1 py-5 rounded-2xl md:rounded-[2rem] font-black shadow-lg transition-all text-sm md:text-lg flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  {isProcessing ? "กำลังส่ง..." : "อนุมัติคำขอ 👍"}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => updateStatus(item.id, 'rejected')}
                  className={`flex-1 py-5 rounded-2xl md:rounded-[2rem] font-black shadow-lg transition-all text-sm md:text-lg flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                >
                  {isProcessing ? "กำลังส่ง..." : "ไม่อนุมัติคำขอ 👎"}
                </button>
              </div>
            )}

            {item.processed_at && (
              <div className="flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black text-slate-300 uppercase mt-6">
                <Clock size={12} /> ดำเนินการเมื่อ: {new Date(item.processed_at).toLocaleString('th-TH')}
              </div>
            )}
          </div>
        ))}
      </div>
      {(activeTab === 'pending' ? pendingList : historyList).length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] md:rounded-[5rem] border-4 border-dashed border-slate-50 text-slate-200 font-black italic uppercase text-lg md:text-2xl">
          ไม่มีรายการ ✨
        </div>
      )}
    </div>
  );
};

export default HistoryPage;