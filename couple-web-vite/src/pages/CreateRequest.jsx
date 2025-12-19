import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateRequest = () => {
  const myEmail = localStorage.getItem('email');
  const myUserId = localStorage.getItem('user_id');

  const [formData, setFormData] = useState({
    header: '',
    title: '',
    receiverEmail: '',
    time_start: '',
    time_end: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isWakeUp, setIsWakeUp] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://lover-backend.onrender.com/api/users');
        setUsers(res.data);
        setIsWakeUp(true);
      } catch (err) { 
        console.log("Fetch users error", err);
        setTimeout(fetchUsers, 5000);
      }
    };
    fetchUsers();
  }, []);

  const calculateDuration = () => {
    if (!formData.time_start || !formData.time_end) return "0 วัน 0 ชม. 0 นาที";
    const start = new Date(formData.time_start);
    const end = new Date(formData.time_end);
    const diff = end - start;

    if (diff <= 0) return "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    
    let res = "";
    if (days > 0) res += `${days} วัน `;
    if (hours > 0) res += `${hours} ชม. `;
    if (mins > 0) res += `${mins} นาที `;
    if (secs > 0) res += `${secs} วินาที`;
    return res || "0 วินาที";
  };

  const currentDuration = calculateDuration();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, receiverEmail: value });
    if (value.length > 1) {
      const matched = users.filter(u => u.email.toLowerCase().includes(value.toLowerCase()));
      setFilteredUsers(matched);
    } else { setFilteredUsers([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.time_end) <= new Date(formData.time_start)) {
      alert("กรุณาตรวจสอบเวลา เริ่ม-จบ ให้ถูกต้อง");
      return;
    }

    setIsSending(true);

    const payload = {
      header: formData.header,
      title: formData.title,
      duration: currentDuration,
      sender_id: myUserId,
      receiver_email: formData.receiverEmail,
      time_start: formData.time_start,
      time_end: formData.time_end
    };

    try {
      await axios.post('https://lover-backend.onrender.com/api/request', payload);
      alert('ส่งคำขอสำเร็จ! 🚀 แจ้งเตือนเข้า Discord เรียบร้อย');
      setFormData({ ...formData, title: '', receiverEmail: '', time_start: '', time_end: '' });
    } catch { 
      alert('ส่งไม่สำเร็จ! เซิร์ฟเวอร์อาจกำลังตื่น โปรดลองใหม่อีกครั้งใน 30 วินาที'); 
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6 border border-rose-50">
        <h2 className="text-2xl font-black text-rose-500 mb-6 uppercase italic text-center">Create New Request</h2>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">1. หัวข้อคำขอ</label>
          <input className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-rose-300 font-bold"
            value={formData.header} onChange={(e) => setFormData({...formData, header: e.target.value})} required />
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest">2. จาก ID (You)</label>
          <p className="font-bold text-rose-600">{myEmail}</p>
        </div>

        <div className="relative space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
            3. ถึงใคร { !isWakeUp && <span className="text-amber-500 animate-pulse">(ระบบกำลังตื่น...)</span> }
          </label>
          <input className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-rose-300 font-bold"
            placeholder="พิมพ์อีเมลผู้รับ..." value={formData.receiverEmail} onChange={handleEmailChange} required />
          {filteredUsers.length > 0 && (
            <div className="absolute z-10 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              {filteredUsers.map(u => (
                <div key={u.id} onClick={() => { setFormData({...formData, receiverEmail: u.email}); setFilteredUsers([]); }}
                  className="p-4 hover:bg-rose-50 cursor-pointer font-bold text-slate-600 border-b border-slate-50 last:border-0">
                  {u.email} <span className="text-[10px] text-slate-300 ml-2">({u.username})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">4. รายละเอียด</label>
          <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-rose-300 h-24"
            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">5. เริ่ม</label>
            <input type="datetime-local" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none" 
              value={formData.time_start} onChange={(e) => setFormData({...formData, time_start: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">6. จบ</label>
            <input type="datetime-local" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none" 
              value={formData.time_end} onChange={(e) => setFormData({...formData, time_end: e.target.value})} required />
          </div>
        </div>

        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7. ระยะเวลาที่คำนวณได้</label>
          <p className="font-black text-rose-500 text-lg">{currentDuration}</p>
        </div>

        {/* ✨ ปรับปรุงปุ่มแสดงสถานะการส่งให้เป็นตามที่ต้องการ */}
        {isSending ? (
            <button disabled className="w-full bg-slate-100 text-slate-400 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                กำลังส่งคำขอ โปรดรอสักครู่... ❤️
            </button>
        ) : (
            <button type="submit" className="w-full bg-rose-500 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all uppercase tracking-widest">
                ส่งคำขอให้แฟน ✨ 🚀
            </button>
        )}
      </form>
    </div>
  );
};

export default CreateRequest;