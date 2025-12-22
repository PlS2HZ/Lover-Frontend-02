import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Send, Clock, User } from 'lucide-react';

const moods = [
    { emoji: '😊', label: 'มีความสุข' }, { emoji: '🥰', label: 'คลั่งรัก' },
    { emoji: '😴', label: 'ง่วงนอน' }, { emoji: '😤', label: 'เหนื่อยจัง' },
    { emoji: '😋', label: 'หิวมาก' }, { emoji: '😔', label: 'ซึมเศร้า' },
];

const MoodPage = () => {
    const [selectedMood, setSelectedMood] = useState('😊');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [moodHistory, setMoodHistory] = useState([]);
    const [users, setUsers] = useState([]); // ✅ เพิ่มเลือกแฟน
    const [visibleTo, setVisibleTo] = useState([]); 
    
    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moodRes, userRes] = await Promise.all([
                    axios.get(`${API_URL}/api/get-moods`),
                    axios.get(`${API_URL}/api/users`)
                ]);
                setMoodHistory(moodRes.data || []);
                setUsers(userRes.data.filter(u => u.id !== userId)); // แสดงเฉพาะแฟน
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [userId, API_URL]);

    const handleSave = async () => {
        if (!note.trim()) return alert("ระบุความรู้สึกนิดนึงนะ ✨");
        if (visibleTo.length === 0) return alert("เลือกคนที่จะแจ้งเตือน (แฟน) ก่อนครับ");
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/save-mood`, {
                user_id: userId,
                mood_emoji: selectedMood,
                mood_text: note,
                visible_to: visibleTo // ✅ ส่งรายชื่อแฟน
            });
            alert('ส่งความรู้สึกให้แฟนแล้ว! ❤️');
            setNote('');
            const res = await axios.get(`${API_URL}/api/get-moods`);
            setMoodHistory(res.data || []);
        } catch (err) { 
            console.error("Save mood error:", err);
            alert('บันทึกไม่สำเร็จ'); } 
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-rose-50/30 p-6 pb-24">
            <div className="max-w-md mx-auto space-y-6">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-700 italic uppercase italic">Our Daily Mood</h1>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-100/50 py-1 px-4 rounded-full inline-block">วันนี้เป็นอย่างไรบ้าง?</p>
                </header>

                <div className="grid grid-cols-3 gap-3">
                    {moods.map((m) => (
                        <button key={m.label} onClick={() => setSelectedMood(m.emoji)}
                            className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 ${selectedMood === m.emoji ? 'bg-white border-rose-400 shadow-xl' : 'bg-white/50 border-transparent text-slate-400'}`}>
                            <span className="text-4xl">{m.emoji}</span>
                            <span className="text-[9px] font-black uppercase">{m.label}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border-2 border-rose-100/50">
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="บอกความรู้สึกให้แฟนรู้หน่อย..."
                        className="w-full h-24 text-sm font-bold text-slate-600 focus:outline-none resize-none bg-transparent" />
                </div>

                {/* ✅ ส่วนเลือกแฟน */}
                <div className="space-y-2 px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase italic">แจ้งเตือนถึงใคร? (แฟน)</p>
                    <div className="flex flex-wrap gap-2">
                        {users.map(u => (
                            <button key={u.id} onClick={() => setVisibleTo(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${visibleTo.includes(u.id) ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                                @{u.username}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase italic flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                    {loading ? 'กำลังบันทึก...' : <><Heart size={18} fill="currentColor"/> บันทึกอารมณ์ ✨</>}
                </button>

                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 ml-2"><Clock size={14}/> ประวัติความรู้สึก</h3>
                    <div className="space-y-3">
                        {moodHistory.slice(0, 7).map((item, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-[2rem] border-2 border-white flex items-center gap-4 shadow-sm">
                                <div className="text-3xl bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner">{item.mood_emoji}</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 italic">{new Date(item.created_at).toLocaleDateString('th-TH', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</p>
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