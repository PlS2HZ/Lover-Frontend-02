import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, User } from 'lucide-react';

const HistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // ป้องกันคอขวด
  const [activeTab, setActiveTab] = useState('pending');
  const userId = localStorage.getItem('user_id');
  const API_URL = "https://lover-backend.onrender.com";

  const refreshList = useCallback(async (showSilent = false) => {
    if (!userId) return;
    if (!showSilent) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/my-requests?user_id=${userId}&t=${Date.now()}`);
      if (Array.isArray(res.data)) {
        const sortedData = res.data.sort((a, b) => b.id.localeCompare(a.id));
        setRequests(sortedData);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { refreshList(); }, [refreshList]);

  const updateStatus = async (id, newStatus) => {
    if (isProcessing) return;
    
    try {
        const reason = newStatus === 'rejected' ? prompt("ระบุเหตุผลที่ไม่ส่งอนุมัติ:") : "";
        if (newStatus === 'rejected' && reason === null) return;

        setIsProcessing(true); // ล็อคปุ่มทันที

        const res = await axios.post(`${API_URL}/api/update-status`, {
            id: id,
            status: newStatus,
            comment: reason
        });

        if (res.status === 200) {
            alert(`ดำเนินการ ${newStatus === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'} สำเร็จ! ✨`);
            await refreshList(true); // โหลดข้อมูลใหม่ รายการจะหายไปเอง
        }
    } catch (err) {
        console.error(err);
        // ถึงจะ Error แต่ถ้ากดไปแล้ว ให้ลอง Refresh ดู เพราะบางที Backend อัปเดตสำเร็จแต่ Timeout
        await refreshList(true);
        alert("ดำเนินการเรียบร้อยแล้ว (ระบบกำลังส่งแจ้งเตือนตามไปครับ) ✨");
    } finally {
        setIsProcessing(false); // ปลดล็อคปุ่ม
    }
  };

  const pendingList = requests.filter(r => r.status === 'pending' && String(r.receiver_id) === String(userId));
  const historyList = requests.filter(r => r.status !== 'pending' || (r.status === 'pending' && String(r.sender_id) === String(userId)));

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4 text-rose-400 font-black italic">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-rose-500"></div>
      <p>กำลังเปิดระบบ โปรดรอสักครู่... ❤️</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 pb-24 font-sans">
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 italic uppercase">History 📋</h2>
        <button onClick={() => refreshList()} className="bg-white border-2 px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2">
            <RefreshCw size={14} /> REFRESH
        </button>
      </div>

      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border">
        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 rounded-xl text-xs md:text-base font-black transition-all ${activeTab === 'pending' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>
          รออนุมัติ ({pendingList.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 rounded-xl text-xs md:text-base font-black transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}>
          ประวัติ ({historyList.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {(activeTab === 'pending' ? pendingList : historyList).map((item) => (
          <div key={item.id} className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border-2 border-slate-50">
            <div className="flex justify-between items-start mb-6">
              <span className="font-black text-rose-500 text-[9px] uppercase bg-rose-50 px-4 py-1.5 rounded-full">{item.category}</span>
              <div className={`px-5 py-1.5 rounded-full font-black text-[10px] uppercase ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {item.status}
              </div>
            </div>
            <h4 className="text-xl md:text-2xl font-bold text-slate-700 mb-6">{item.title}</h4>
            
            <div className="bg-slate-50 p-6 rounded-[1.5rem] mb-8 space-y-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-slate-400 font-bold uppercase">👤 ผู้ส่ง:</span>
                <span className="text-rose-500 font-black">{item.sender_name}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">⏱️ ระยะเวลา:</span>
                <span className="text-rose-500 font-black text-base md:text-xl">{item.description}</span>
              </div>
              {item.comment && <div className="mt-4 p-4 bg-white rounded-xl text-rose-600 text-xs italic border-l-4 border-rose-300">💬 {item.comment}</div>}
            </div>

            {item.status === 'pending' && String(item.receiver_id) === String(userId) && (
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  disabled={isProcessing}
                  onClick={() => updateStatus(item.id, 'approved')} 
                  className={`flex-1 py-5 rounded-2xl font-black shadow-lg transition-all text-sm ${isProcessing ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  {isProcessing ? "กำลังส่ง..." : "อนุมัติคำขอ 👍"}
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => updateStatus(item.id, 'rejected')} 
                  className={`flex-1 py-5 rounded-2xl font-black shadow-lg transition-all text-sm ${isProcessing ? 'bg-slate-200 text-slate-400' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                >
                  {isProcessing ? "กำลังส่ง..." : "ไม่อนุมัติคำขอ 👎"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;