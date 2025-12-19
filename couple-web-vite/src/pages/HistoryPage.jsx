import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const HistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const userId = localStorage.getItem('user_id');

  const refreshList = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://lover-backend.onrender.com/api/my-requests?user_id=${userId}&t=${Date.now()}`);
      if (Array.isArray(res.data)) {
        const sortedData = res.data.sort((a, b) => b.id.localeCompare(a.id));
        setRequests(sortedData);
      }
    } catch (error) { console.error("Fetch Error:", error); } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { refreshList(); }, [refreshList]);

  const updateStatus = async (id, status) => {
  let reason = "";
  if (status === 'rejected') {
    reason = prompt("ระบุเหตุผลที่ไม่ไม่อนุมัติ:"); // ถามเหตุผล
    if (reason === null) return; // กดยกเลิก ไม่ต้องทำต่อ
  }

  try {
    const res = await axios.post('https://lover-backend.onrender.com/api/update-status', { 
      id: id, 
      status: status,
      comment: reason // ส่งเหตุผลไปด้วย
    });
    
    if (res.status === 200) {
      alert(status === 'approved' ? 'อนุมัติเรียบร้อย! ✅' : 'ปฏิเสธคำขอแล้ว! ❌');
      await refreshList();
    }
  } catch {
    alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
  }
};

  const pendingList = requests.filter(r => r.status === 'pending' && r.receiver_id === userId);
  const historyList = requests.filter(r => r.status !== 'pending' || (r.status === 'pending' && r.sender_id === userId));

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4 text-rose-400 font-black italic">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-500"></div>
      <p>LOADING... ❤️</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 italic uppercase">Request Center 📋</h2>
        <button onClick={refreshList} className="bg-white border-2 px-4 py-2 rounded-2xl hover:border-rose-200 text-[10px] font-black">🔄 REFRESH</button>
      </div>

      <div className="flex gap-4 mb-10 bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-50">
        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-5 rounded-[2rem] font-black transition-all ${activeTab === 'pending' ? 'bg-rose-500 text-white shadow-xl' : 'text-slate-400'}`}>
          รายการรออนุมัติ ({pendingList.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-5 rounded-[2rem] font-black transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-400'}`}>
          ประวัติคำขอ ({historyList.length})
        </button>
      </div>

      <div className="space-y-6">
        {(activeTab === 'pending' ? pendingList : historyList).map((item) => (
          <div key={item.id} className={`bg-white p-8 rounded-[3rem] shadow-sm border-2 ${item.status === 'approved' ? 'border-emerald-100' : item.status === 'rejected' ? 'border-rose-100' : 'border-slate-50'}`}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-rose-500 text-[10px] uppercase bg-rose-50 px-4 py-1 rounded-full">{item.category}</span>
              <span className={`px-5 py-1 rounded-full font-black text-[10px] uppercase ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {item.status}
              </span>
            </div>
            <h4 className="text-2xl font-bold text-slate-700 mb-4">{item.title}</h4>
            <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 text-[11px] font-bold text-slate-500 space-y-3">
              <p className="flex justify-between"><span>👤 ผู้ส่ง:</span> <span className="text-rose-500">{item.sender_name}</span></p>
              <p className="flex justify-between"><span>📩 ส่งถึง:</span> <span className="text-slate-400">{item.receiver_name}</span></p>
              <p className="flex justify-between border-t border-slate-200 pt-2"><span>📅 เริ่ม:</span> <span className="text-slate-800">{item.remark?.split('|')[0].replace('T', ' ')}</span></p>
              <p className="flex justify-between"><span>🏁 จบ:</span> <span className="text-slate-800">{item.remark?.split('|')[1]?.replace('T', ' ')}</span></p>
              <p className="flex justify-between border-t border-slate-200 pt-2 text-rose-500"><span>⏱️ ระยะเวลา:</span> <span>{item.description}</span></p>
            </div>

            {item.status === 'pending' && item.receiver_id === userId && (
              <div className="flex gap-4 pt-2">
                <button onClick={() => updateStatus(item.id, 'approved')} className="flex-1 bg-emerald-500 text-white py-5 rounded-3xl font-black shadow-lg">อนุมัติ 👍</button>
                <button onClick={() => updateStatus(item.id, 'rejected')} className="flex-1 bg-rose-500 text-white py-5 rounded-3xl font-black shadow-lg">ไม่อนุมัติ 👎</button>
              </div>
            )}
            
            {item.processed_at && (
              <p className="text-[9px] font-black text-slate-300 uppercase text-center mt-4">ดำเนินการเมื่อ: {new Date(item.processed_at).toLocaleString('th-TH')}</p>
            )}
          </div>
        ))}
        {(activeTab === 'pending' ? pendingList : historyList).length === 0 && (
          <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-50 text-slate-300 font-black italic uppercase">
            No {activeTab === 'pending' ? 'Pending' : 'History'} Items
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;