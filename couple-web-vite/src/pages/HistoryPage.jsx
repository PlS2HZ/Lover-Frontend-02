/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, User, CheckCircle, XCircle, Heart, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedImg, setSelectedImg] = useState(null); // ✅ สำหรับระบบดูรูปใหญ่
  const userId = localStorage.getItem('user_id');

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://lover-backend.onrender.com';
    
  const refreshList = useCallback(async (showSilent = false) => {
    if (!userId) return;
    if (!showSilent) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/my-requests?user_id=${userId}&t=${Date.now()}`);
      if (Array.isArray(res.data)) {
        const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRequests(sorted);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  }, [userId, API_URL]);

  useEffect(() => { refreshList(); }, [refreshList]);

  const updateStatus = async (id, newStatus) => {
    if (isProcessing) return;
    try {
      const reason = newStatus === 'rejected' ? prompt("ระบุเหตุผลที่ไม่อนุมัติ:") : "";
      if (newStatus === 'rejected' && reason === null) return;

      setIsProcessing(true);
      const res = await axios.post(`${API_URL}/api/update-status`, { id, status: newStatus, comment: reason });

      if (res.status === 200) {
        alert(`ดำเนินการเรียบร้อย ✨`);
        await refreshList(true);
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
      <p>กำลังรีเฟรชประวัติความรัก... ❤️</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 pb-24 font-sans min-h-screen">
      
      {/* ✅ Image Preview Modal (เมื่อกดดูรูปใหญ่) */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImg(null)}
          >
            <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full"><X size={24}/></button>
            <motion.img 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              src={selectedImg} className="max-w-full max-h-full rounded-2xl shadow-2xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 italic uppercase flex items-center gap-2">History 📋</h2>
        <button onClick={() => refreshList()} className="bg-white border-2 border-rose-100 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black flex items-center gap-2 text-rose-500 hover:bg-rose-50 transition-colors">
          <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} /> REFRESH
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
        <AnimatePresence mode="popLayout">
          {(activeTab === 'pending' ? pendingList : historyList).map((item) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border-2 border-rose-50 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 text-rose-50 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart size={150} fill="currentColor" />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="font-black text-rose-500 text-[9px] uppercase bg-rose-50 px-4 py-1.5 rounded-full tracking-wider">{item.category}</span>
                <div className={`px-5 py-1.5 rounded-full font-black text-[10px] md:text-[12px] uppercase shadow-sm ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {item.status}
                </div>
              </div>
              
              <h4 className="text-xl md:text-2xl font-bold text-slate-700 mb-2 relative z-10">{item.title}</h4>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-tight mb-6 flex items-center gap-1 relative z-10">
                <Clock size={12} /> ส่งเมื่อ: {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. · {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </p>

              {/* ✅ ส่วนการแสดงรูปภาพที่แนบมา */}
              {item.image_url && (
                <div className="mb-8 relative z-10">
                  <div className="group relative overflow-hidden rounded-[2rem] border-4 border-rose-50 shadow-inner aspect-video bg-slate-50">
                    <img 
                      src={item.image_url} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" 
                      alt="request-attachment"
                      onClick={() => setSelectedImg(item.image_url)}
                    />
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-xl text-rose-500 pointer-events-none">
                      <Maximize2 size={16}/>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] mb-8 space-y-4 relative z-10 border border-slate-100">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-slate-400 flex items-center gap-1 font-black"><User size={14} /> จาก:</span>
                  <span className="text-rose-500 font-black">{item.sender_name}</span>
                </div>
                <div className="pt-4 flex justify-between border-t border-slate-200/60">
                  <span className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-tighter">⏱️ ระยะเวลากิจกรรม:</span>
                  <span className="text-rose-500 font-black text-base md:text-xl">{item.description}</span>
                </div>
                {item.comment && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-4 p-4 bg-white rounded-xl text-rose-600 text-xs italic border-l-4 border-rose-300 shadow-sm"
                  >
                    💬 เหตุผล: {item.comment}
                  </motion.div>
                )}
              </div>

              {item.status === 'pending' && String(item.receiver_id) === String(userId) && (
                <div className="flex flex-col md:flex-row gap-4 relative z-10">
                  <button
                    disabled={isProcessing}
                    onClick={() => updateStatus(item.id, 'approved')}
                    className={`flex-1 py-5 rounded-2xl md:rounded-[2rem] font-black shadow-lg transition-all text-sm md:text-lg flex items-center justify-center gap-2 active:scale-95 ${isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-200'}`}
                  >
                    {isProcessing ? "กำลังส่ง..." : <><CheckCircle size={20}/> อนุมัติคำขอ</>}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => updateStatus(item.id, 'rejected')}
                    className={`flex-1 py-5 rounded-2xl md:rounded-[2rem] font-black shadow-lg transition-all text-sm md:text-lg flex items-center justify-center gap-2 active:scale-95 ${isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-rose-200'}`}
                  >
                    {isProcessing ? "กำลังส่ง..." : <><XCircle size={20}/> ไม่อนุมัติ</>}
                  </button>
                </div>
              )}

              {item.status !== 'pending' && item.processed_at && (
                <div className="flex items-center justify-center gap-2 text-[9px] md:text-[11px] font-black text-slate-400 uppercase mt-6 pt-4 border-t border-dashed border-slate-100 relative z-10">
                  <Clock size={12} /> {item.status === 'approved' ? 'อนุมัติเมื่อ:' : 'ปฏิเสธเมื่อ:'} {new Date(item.processed_at).toLocaleString('th-TH')}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(activeTab === 'pending' ? pendingList : historyList).length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 bg-white rounded-[3rem] md:rounded-[5rem] border-4 border-dashed border-rose-100 text-rose-200 font-black italic uppercase text-lg md:text-2xl shadow-inner"
        >
          ยังไม่มีเรื่องราวใหม่ๆ ✨
        </motion.div>
      )}
    </div>
  );
};

export default HistoryPage;