import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Send, Clock } from 'lucide-react';

const moods = [
    { emoji: '😊', label: 'มีความสุข' },
    { emoji: '🥰', label: 'คลั่งรัก' },
    { emoji: '😴', label: 'ง่วงนอน' },
    { emoji: '😤', label: 'เหนื่อยจัง' },
    { emoji: '😋', label: 'หิวมาก' },
    { emoji: '😔', label: 'ซึมเศร้า' },
];

const MoodPage = () => {
    const [selectedMood, setSelectedMood] = useState('😊');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [moodHistory, setMoodHistory] = useState([]); // ✅ เพิ่ม State เก็บประวัติ
    
    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    // ✅ ดึงประวัติอารมณ์เมื่อโหลดหน้า
    const fetchMoodHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/get-moods`);
            setMoodHistory(res.data || []);
        } catch (err) { console.error("Fetch Mood Error:", err); }
    };

    useEffect(() => { fetchMoodHistory(); }, []);

    const handleSave = async () => {
        if (!note.trim()) return alert("รบกวนระบุข้อความนิดนึงนะครับ ✨");
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/save-mood`, {
                user_id: userId,
                mood_emoji: selectedMood,
                mood_text: note
            });
            alert('บันทึกอารมณ์และส่งแจ้งเตือนหาแฟนแล้ว! ❤️');
            setNote('');
            fetchMoodHistory(); // ✅ อัปเดตรายการทันที
        } catch (err) { 
            console.error("Save Mood Error:", err);
            alert('บันทึกไม่สำเร็จ'); } 
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-rose-50/30 p-6 pb-24">
            <div className="max-w-md mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Our Daily Mood</h1>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-100/50 py-1 px-4 rounded-full inline-block">วันนี้คุณรู้สึกอย่างไรบ้าง?</p>
                </header>

                {/* ส่วนเลือก Emoji */}
                <div className="grid grid-cols-3 gap-3">
                    {moods.map((m) => (
                        <button key={m.label} onClick={() => setSelectedMood(m.emoji)}
                            className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 ${
                                selectedMood === m.emoji ? 'bg-white border-rose-400 shadow-xl shadow-rose-100 scale-105' : 'bg-white/50 border-transparent text-slate-400'
                            }`}>
                            <span className="text-4xl">{m.emoji}</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* ส่วนกรอกข้อความ */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border-2 border-rose-100/50">
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="บอกความรู้สึกให้แฟนรู้หน่อย..."
                        className="w-full h-24 text-sm font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none bg-transparent" />
                </div>

                <button onClick={handleSave} disabled={loading}
                    className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase italic flex items-center justify-center gap-3 shadow-xl shadow-rose-200 active:scale-95 transition-all disabled:bg-slate-300">
                    {loading ? 'กำลังส่งความหวาน...' : <><Heart size={18} fill="currentColor"/> บันทึกอารมณ์ ✨</>}
                </button>

                {/* ✅ ส่วนแสดงประวัติ (History) */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 ml-2">
                        <Clock size={14}/> ความรู้สึกที่ผ่านมา
                    </h3>
                    <div className="space-y-3">
                        {moodHistory.slice(0, 7).map((item, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-[2rem] border-2 border-white flex items-center gap-4 shadow-sm">
                                <div className="text-3xl bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner">{item.mood_emoji}</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase italic">
                                        {new Date(item.created_at).toLocaleDateString('th-TH', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs font-bold text-slate-600 line-clamp-1">{item.mood_text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoodPage;