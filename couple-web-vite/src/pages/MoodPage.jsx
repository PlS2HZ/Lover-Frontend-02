import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Send, Clock, Trash2 } from 'lucide-react';

const moods = [
    { emoji: '😊', label: 'มีความสุข', color: 16773120 }, // สีเหลือง
    { emoji: '🥰', label: 'คลั่งรัก', color: 16738740 }, // สีชมพู
    { emoji: '😴', label: 'ง่วงนอน', color: 3447003 },  // สีน้ำเงิน
    { emoji: '😤', label: 'เหนื่อยจัง', color: 15158332 }, // สีแดง
    { emoji: '😋', label: 'หิวมาก', color: 16753920 },   // สีส้ม
    { emoji: '😔', label: 'ซึมเศร้า', color: 9807270 },   // สีเทา
];

const MoodPage = () => {
    // ✅ ระบบ Auto-Select แฟนด้วย Mapping ID
    const MY_ID = "d8eb372a-d196-44fc-a73b-1809f27e0a56";
    const LOVER_ID = "f384c03a-55bb-4d5f-b3f5-4f2052a9d00e";
    const loverMapping = { [MY_ID]: LOVER_ID, [LOVER_ID]: MY_ID };

    const [selectedMood, setSelectedMood] = useState(moods[0]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [moodHistory, setMoodHistory] = useState([]);
    
    const userId = localStorage.getItem('user_id');
    const [visibleTo] = useState(loverMapping[userId] ? [loverMapping[userId]] : []);
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    const fetchMoodHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/get-moods`);
            setMoodHistory(res.data || []);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    useEffect(() => { fetchMoodHistory(); }, []);

    const handleSave = async () => {
        if (!note.trim()) return alert("ระบุความรู้สึกนิดนึงนะ ✨");
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/save-mood`, {
                user_id: userId,
                mood_emoji: selectedMood.emoji,
                mood_text: note,
                visible_to: visibleTo
            });
            alert('ส่งความรู้สึกให้แฟนแล้ว! ❤️');
            setNote('');
            fetchMoodHistory();
        } catch (err) { 
            console.error("Save Error:", err);
            alert('บันทึกไม่สำเร็จ'); } 
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("ลบความทรงจำนี้ใช่ไหม?")) return;
        try {
            await axios.delete(`${API_URL}/api/mood/delete?id=${id}`);
            fetchMoodHistory();
        } catch (err) { 
            console.error("Delete Error:", err);
            alert("ลบไม่สำเร็จ"); }
    };

    return (
        <div className="min-h-screen bg-rose-50/30 p-6 pb-24 font-bold">
            <div className="max-w-md mx-auto space-y-6">
                <header className="text-center">
                    <h1 className="text-3xl font-black text-slate-700 italic uppercase">Our Daily Mood</h1>
                    <p className="text-[10px] text-rose-400 uppercase tracking-widest">วันนี้รู้สึกอย่างไรบ้าง?</p>
                </header>

                <div className="grid grid-cols-3 gap-3">
                    {moods.map((m) => (
                        <button key={m.label} onClick={() => setSelectedMood(m)}
                            className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 ${selectedMood.label === m.label ? 'bg-white border-rose-400 shadow-xl' : 'bg-white/50 border-transparent text-slate-400'}`}>
                            <span className="text-4xl">{m.emoji}</span>
                            <span className="text-[9px] font-black uppercase">{m.label}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border-2 border-rose-100/50">
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="บอกความรู้สึกให้แฟนรู้หน่อย..."
                        className="w-full h-24 text-sm text-slate-600 focus:outline-none resize-none bg-transparent font-bold" />
                </div>

                <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase italic flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                    {loading ? 'กำลังส่ง...' : <><Heart size={18} fill="currentColor"/> บันทึกอารมณ์ ✨</>}
                </button>

                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 ml-2"><Clock size={14}/> ประวัติความรู้สึก</h3>
                    <div className="space-y-3">
                        {moodHistory.map((item, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-[2rem] border-2 border-white flex items-center gap-4 shadow-sm relative group">
                                <div className="text-3xl bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner">{item.mood_emoji}</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 italic">{new Date(item.created_at).toLocaleString('th-TH')}</p>
                                    <p className="text-xs text-slate-600 font-bold">{item.mood_text}</p>
                                </div>
                                {item.user_id === userId && (
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-300 hover:text-rose-500"><Trash2 size={16}/></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MoodPage;