import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { Heart, Bell, Trash2, Users, RefreshCw } from 'lucide-react';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibleTo: [],
        repeatType: 'none' // 'none', 'daily', 'monthly', 'yearly'
    });

    const userId = localStorage.getItem('user_id');
    const API_URL = "https://lover-backend.onrender.com";

    useEffect(() => {
        const initPage = async () => {
            setIsLoading(true);
            try { await Promise.all([fetchEvents(), fetchUsers()]); }
            catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        if (userId) initPage();
    }, [userId]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/events?user_id=${userId}`);
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users`);
            setUsers(Array.isArray(res.data) ? res.data.filter(u => u.id !== userId) : []);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                event_date: date.toISOString(),
                title: formData.title,
                description: formData.description,
                created_by: userId,
                visible_to: formData.visibleTo,
                repeat_type: formData.repeatType
            };
            await axios.post(`${API_URL}/api/events/create`, payload);
            alert("บันทึกวันสำคัญเรียบร้อย! ❤️");
            setFormData({ title: '', description: '', visibleTo: [], repeatType: 'none' });
            fetchEvents();
        } catch (err) { 
            console.error("Calender Error:", err)
            alert("เกิดข้อผิดพลาด"); }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm("ลบใช่ไหม?")) return;
        try {
            await axios.delete(`${API_URL}/api/events/delete?id=${id}`);
            fetchEvents();
        } catch (err) {
            console.error("Calender Error:", err)
            ;alert("ลบไม่สำเร็จ"); }
    };

    // แก้ไขฟังก์ชันเช็ควันในปฏิทินให้รองรับการวนซ้ำ
    const tileContent = ({ date, view }) => {
        if (view === 'month' && events.length > 0) {
            const hasEvent = events.some(ev => {
                const evDate = new Date(ev.event_date);
                if (ev.repeat_type === 'yearly') {
                    return evDate.getDate() === date.getDate() && evDate.getMonth() === date.getMonth();
                }
                if (ev.repeat_type === 'monthly') {
                    return evDate.getDate() === date.getDate();
                }
                if (ev.repeat_type === 'daily') return true;
                return evDate.toDateString() === date.toDateString();
            });
            return hasEvent ? <div className="h-1.5 w-1.5 bg-rose-400 rounded-full mx-auto mt-1"></div> : null;
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-rose-50 text-rose-500 font-bold animate-pulse text-xl">ระบบกำลังเตรียมปฏิทิน... ❤️</div>;
    }

    return (
        <div className="min-h-screen bg-rose-50 p-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-black text-rose-600 flex items-center gap-2 italic uppercase tracking-tighter">
                    <Heart fill="currentColor" /> Calendar
                </h1>

                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-rose-100">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Bell className="text-rose-400" /> เพิ่มวันพิเศษ
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl" placeholder="หัวข้อ" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                        <input className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl" placeholder="คำอวยพร/คำอธิบาย" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-slate-400 flex items-center gap-1"><RefreshCw size={14}/> ตั้งค่าการแจ้งเตือนวนซ้ำ</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    {val: 'none', label: 'ครั้งเดียว'},
                                    {val: 'daily', label: 'ทุกวัน'},
                                    {val: 'monthly', label: 'ทุกเดือน'},
                                    {val: 'yearly', label: 'ทุกปี'}
                                ].map(opt => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setFormData({...formData, repeatType: opt.val})}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.repeatType === opt.val ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-400 flex items-center gap-1"><Users size={16}/> ใครมองเห็นได้บ้าง?</label>
                            <div className="flex flex-wrap gap-2">
                                {users.map(u => (
                                    <button key={u.id} type="button" onClick={() => {
                                        const current = formData.visibleTo;
                                        const next = current.includes(u.id) ? current.filter(id => id !== u.id) : [...current, u.id];
                                        setFormData({...formData, visibleTo: next});
                                    }} className={`px-3 py-1 rounded-full text-[10px] font-bold ${formData.visibleTo.includes(u.id) ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{u.username}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-rose-500 text-white font-black py-3 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 uppercase tracking-widest text-sm">บันทึกวันพิเศษ ✨</button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-rose-100">
                        <Calendar onChange={setDate} value={date} tileContent={tileContent} className="border-none w-full" />
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        <h3 className="font-bold text-slate-600 sticky top-0 bg-rose-50 py-1">รายการวันที่ {date.toLocaleDateString('th-TH')}</h3>
                        {events.filter(ev => {
                            const evDate = new Date(ev.event_date);
                            if (ev.repeat_type === 'yearly') return evDate.getDate() === date.getDate() && evDate.getMonth() === date.getMonth();
                            if (ev.repeat_type === 'monthly') return evDate.getDate() === date.getDate();
                            if (ev.repeat_type === 'daily') return true;
                            return evDate.toDateString() === date.toDateString();
                        }).length > 0 ? (
                            events.filter(ev => {
                                const evDate = new Date(ev.event_date);
                                if (ev.repeat_type === 'yearly') return evDate.getDate() === date.getDate() && evDate.getMonth() === date.getMonth();
                                if (ev.repeat_type === 'monthly') return evDate.getDate() === date.getDate();
                                if (ev.repeat_type === 'daily') return true;
                                return evDate.toDateString() === date.toDateString();
                            }).map(event => (
                                <div key={event.id} className="bg-white p-4 rounded-2xl border-l-4 border-rose-400 shadow-sm flex justify-between items-center group">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-rose-600">{event.title}</p>
                                            {event.repeat_type !== 'none' && <span className="text-[9px] bg-rose-50 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase">{event.repeat_type}</span>}
                                        </div>
                                        <p className="text-xs text-slate-500">{event.description}</p>
                                    </div>
                                    {event.created_by === userId && (
                                        <button onClick={() => deleteEvent(event.id)} className="text-slate-200 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-300 italic text-sm font-medium italic">ไม่มีนัดหมายในวันนี้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;