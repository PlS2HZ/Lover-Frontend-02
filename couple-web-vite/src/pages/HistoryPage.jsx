import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const HistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const userId = localStorage.getItem('user_id');
  const API_URL = "https://lover-backend.onrender.com";

  const refreshList = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/my-requests?user_id=${userId}&t=${Date.now()}`);
      if (Array.isArray(res.data)) {
        // เรียงลำดับจากใหม่ไปเก่าโดยใช้ ID หรือเวลา
        const sortedData = res.data.sort((a, b) => b.id.localeCompare(a.id));
        setRequests(sortedData);
      }
    } catch (error) { console.error("Fetch Error:", error); } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { refreshList(); }, [refreshList]);

  const updateStatus = async (id, newStatus) => {
    try {
        const reason = newStatus === 'rejected' ? prompt("ระบุเหตุผลที่ไม่ส่งอนุมัติ:") : "";
        if (newStatus === 'rejected' && reason === null) return;

        await axios.post(`${API_URL}/api/update-status`, {
            id: id,
            status: newStatus,
            comment: reason
        });

        // ✨ แก้ไขจุดที่ 1: อัปเดต State ทันทีเพื่อให้ Filter ทำงานและย้าย Tab เอง
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === id 
                ? { ...req, status: newStatus, comment: reason, processed_at: new Date().toISOString() } 
                : req
            )
        );

        alert("ดำเนินการสำเร็จแล้ว ✨");
    } catch (err) {
        console.error("updateStatus Error:", err);
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  // ✨ แก้ไขจุดที่ 2: ปรับเงื่อนไขการกรองให้แม่นยำขึ้น
  const pendingList = requests.filter(r => r.status === 'pending' && String(r.receiver_id) === String(userId));
  const historyList = requests.filter(r => r.status !== 'pending' || (r.status === 'pending' && String(r.sender_id) === String(userId)));

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4 text-rose-400 font-black italic">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-rose-500"></div>
      <p>กำลังเปิดระบบ โปรดรอสักครู่... ❤️</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 pb-24">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-3xl font-black text-slate-800 italic uppercase">History 📋</h2>
        <button onClick={refreshList} className="bg-white border-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl hover:border-rose-200 text-[9px] md:text-[10px] font-black flex items-center gap-2">
            <RefreshCw size={12} /> REFRESH
        </button>
      </div>

      <div className="flex gap-2 md:gap-4 mb-6 md:mb-10 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-50">
        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-3 md:py-5 rounded-xl md:rounded-[2rem] text-xs md:text-sm font-black transition-all ${activeTab === 'pending' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>
          รออนุมัติ ({pendingList.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 md:py-5 rounded-xl md:rounded-[2rem] text-xs md:text-sm font-black transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}>
          ประวัติ ({historyList.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {(activeTab === 'pending' ? pendingList : historyList).map((item) => (
          <div key={item.id} className={`bg-white p-5 md:p-8 rounded-3xl md:rounded-[3rem] shadow-sm border-2 ${item.status === 'approved' ? 'border-emerald-100' : item.status === 'rejected' ? 'border-rose-100' : 'border-slate-50'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-black text-rose-500 text-[9px] uppercase bg-rose-50 px-3 py-1 rounded-full">{item.category}</span>
              <span className={`px-4 py-1 rounded-full font-black text-[9px] uppercase ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {item.status}
              </span>
            </div>
            
            <h4 className="text-lg md:text-2xl font-bold text-slate-700 mb-4">{item.title}</h4>
            
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] mb-6 text-[10px] md:text-[11px] font-bold text-slate-500 space-y-2 md:space-y-3">
              <p className="flex justify-between"><span>👤 ผู้ส่ง:</span> <span className="text-rose-500">{item.sender_name}</span></p>
              <p className="flex justify-between"><span>📩 ส่งถึง:</span> <span className="text-slate-400">{item.receiver_name}</span></p>
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <p className="flex justify-between font-medium"><span>📅 เริ่ม:</span> <span className="text-slate-800">{item.remark?.split('|')[0].replace('T', ' ')}</span></p>
                <p className="flex justify-between font-medium"><span>🏁 จบ:</span> <span className="text-slate-800">{item.remark?.split('|')[1]?.replace('T', ' ')}</span></p>
              </div>
              <p className="flex justify-between border-t border-slate-200 pt-2 text-rose-500 text-xs md:text-sm font-black">
                <span>⏱️ ระยะเวลา:</span> <span>{item.description}</span>
              </p>
              {item.comment && (
                <div className="mt-2 p-2 bg-rose-50 rounded-lg text-rose-600 italic border-l-2 border-rose-300">
                  💬 คอมเมนต์: {item.comment}
                </div>
              )}
            </div>

            {item.status === 'pending' && String(item.receiver_id) === String(userId) && (
              <div className="flex gap-3 md:gap-4">
                <button onClick={() => updateStatus(item.id, 'approved')} className="flex-1 bg-emerald-500 text-white py-3 md:py-5 rounded-2xl md:rounded-3xl font-black shadow-md hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> อนุมัติ 👍
                </button>
                <button onClick={() => updateStatus(item.id, 'rejected')} className="flex-1 bg-rose-500 text-white py-3 md:py-5 rounded-2xl md:rounded-3xl font-black shadow-md hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <XCircle size={18} /> ไม่อนุมัติ 👎
                </button>
              </div>
            )}
            
            {item.processed_at && (
              <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase text-center mt-4">ดำเนินการเมื่อ: {new Date(item.processed_at).toLocaleString('th-TH')}</p>
            )}
          </div>
        ))}
      </div>
      {(activeTab === 'pending' ? pendingList : historyList).length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-4 border-dashed border-slate-50 text-slate-300 font-black italic uppercase">
            No {activeTab === 'pending' ? 'Pending' : 'History'} Items
          </div>
      )}
    </div>
  );
};

export default HistoryPage;