import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { Heart, Bell, Trash2, Users, RefreshCw, Clock, Filter } from 'lucide-react';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    
    // ✨ ระบบเลือกเวลาแบบละเอียด ชั่วโมง:นาที:วินาที (Default เป็น 00)
    const [timeHour, setTimeHour] = useState("00");
    const [timeMinute, setTimeMinute] = useState("00");
    const [timeSecond, setTimeSecond] = useState("00");
    
    const [viewMode, setViewMode] = useState('month'); 
    const [viewFilter, setViewFilter] = useState({ 
        month: new Date().getMonth(), 
        year: new Date().getFullYear() 
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibleTo: [],
        repeatType: 'none'
    });

    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:8080'
        : 'https://lover-backend.onrender.com';

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

    const filteredOverview = useMemo(() => {
        return events.filter(ev => {
            const evDate = new Date(ev.event_date);
            const evYear = evDate.getFullYear();
            const evMonth = evDate.getMonth();
            const isYearly = ev.repeat_type === 'yearly';
            const isMonthly = ev.repeat_type === 'monthly';
            const isDaily = ev.repeat_type === 'daily';

            if (viewMode === 'year') {
                return evYear === viewFilter.year || isYearly || isMonthly || isDaily;
            }
            const matchYear = evYear === viewFilter.year || isYearly;
            const matchMonth = evMonth === viewFilter.month || isMonthly || isDaily;
            return matchYear && matchMonth;
        });
    }, [events, viewFilter, viewMode]);

    const getDaysLeft = (eventDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(eventDate);
        target.setHours(0, 0, 0, 0);
        const yearlyTarget = new Date(target);
        yearlyTarget.setFullYear(today.getFullYear());
        if (yearlyTarget < today) yearlyTarget.setFullYear(today.getFullYear() + 1);
        const diff = yearlyTarget - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

   // ค้นหาฟังก์ชัน handleSubmit ใน CalendarPage.jsx แล้วเปลี่ยนตรงนี้:

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const combinedDate = new Date(date);
        combinedDate.setHours(parseInt(timeHour));
    combinedDate.setMinutes(parseInt(timeMinute));
    combinedDate.setSeconds(0); // ✅ บังคับเป็น 0 เพื่อให้ตรงกับเงื่อนไขใน Backend
    combinedDate.setMilliseconds(0); // ✅ บังคับมิลลิวินาทีเป็น 0

        const payload = {
            event_date: combinedDate.toISOString(), 
            title: formData.title,
            description: formData.description,
            created_by: userId,
            visible_to: formData.visibleTo,
            repeat_type: formData.repeatType,
            is_special: true // ✅ บังคับให้เป็นวันสำคัญเพื่อแสดงหน้า Home
        };

        // ส่งข้อมูลไปบันทึก
        await axios.post(`${API_URL}/api/events/create`, payload);
        
        // ✨ ส่งการแจ้งเตือนไป Discord ทันทีเมื่อบันทึกใหม่ (ถ้า Backend ยังไม่ทำส่วนนี้)
        // หรือพึ่งพา Backend Cron Job ก็ได้ แต่ Payload ต้องเป๊ะ
        
        alert(`🔔 บันทึกนัดหมายสำเร็จ! ระบบจะแจ้งเตือน Discord ในวันที่ ${combinedDate.toLocaleDateString('th-TH')} เวลา ${timeHour}:${timeMinute} น.`);
        
        setTimeHour("00"); setTimeMinute("00"); setTimeSecond("00");
        setFormData({ title: '', description: '', visibleTo: [], repeatType: 'none' });
        fetchEvents();
    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการบันทึก");
    }
};

    // ✨ 2. แก้ไขฟังก์ชันลบ (เพิ่มการส่ง Title ไปแจ้งเตือน Discord)
const deleteEvent = async (id, title) => {
    if (!window.confirm(`ต้องการลบกิจกรรม "${title}" ใช่หรือไม่?`)) return;
    try {
        // ส่ง ID และ Title ไปยัง Backend เพื่อให้ Backend ส่ง Discord แจ้งลบ
        await axios.delete(`${API_URL}/api/events/delete?id=${id}&title=${encodeURIComponent(title)}&user_id=${userId}`);
        
        setEvents(prev => prev.filter(ev => ev.id !== id));
        alert("ลบรายการสำเร็จ และแจ้งเตือนการลบไปที่ Discord แล้ว ✨");
    } catch (err) {
        console.log("Error deleting event:", err);
        alert("ลบไม่สำเร็จ");
    }
};

    const tileContent = ({ date, view }) => {
        if (view === 'month' && events.length > 0) {
            const hasEvent = events.some(ev => {
                const evDate = new Date(ev.event_date);
                if (ev.repeat_type === 'yearly') return evDate.getDate() === date.getDate() && evDate.getMonth() === date.getMonth();
                if (ev.repeat_type === 'monthly') return evDate.getDate() === date.getDate();
                if (ev.repeat_type === 'daily') return true;
                return evDate.toDateString() === date.toDateString();
            });
            return hasEvent ? <div className="h-1.5 w-1.5 bg-rose-400 rounded-full mx-auto mt-1"></div> : null;
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-rose-50 text-rose-500 font-bold animate-pulse uppercase italic tracking-tighter">Prepare Calendar... ❤️</div>;

    return (
        <div className="min-h-screen bg-rose-50 p-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-black text-rose-600 flex items-center gap-2 italic uppercase tracking-tighter">
                    <Heart fill="currentColor" /> Calendar
                </h1>

                {/* Form Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-rose-100">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Bell className="text-rose-400" /> เพิ่มวันพิเศษ
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl" placeholder="หัวข้อ" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        
                        {/* ✨ ระบบเลือกเวลาละเอียด ชม:น:ว */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Clock className="absolute left-2.5 top-3.5 text-slate-400" size={16} />
                                <select className="w-full p-3 pl-8 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold outline-none" value={timeHour} onChange={(e) => setTimeHour(e.target.value)}>
                                    {Array.from({length: 24}, (_, i) => {
                                        const h = i.toString().padStart(2, '0');
                                        return <option key={h} value={h}>{h} นาฬิกา</option>
                                    })}
                                </select>
                            </div>
                            <select className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold outline-none" value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)}>
                                {Array.from({length: 60}, (_, i) => {
                                    const m = i.toString().padStart(2, '0');
                                    return <option key={m} value={m}>{m} น.</option>
                                })}
                            </select>
                            <select className="flex-1 p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-xs font-bold text-rose-500 outline-none" value={timeSecond} onChange={(e) => setTimeSecond(e.target.value)}>
                                {Array.from({length: 60}, (_, i) => {
                                    const s = i.toString().padStart(2, '0');
                                    return <option key={s} value={s}>{s} วิ.</option>
                                })}
                            </select>
                        </div>

                        <input className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl col-span-1 md:col-span-2" placeholder="รายละเอียดเพิ่มเติม..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-400 flex items-center gap-1"><RefreshCw size={14} /> วนซ้ำการแจ้งเตือน</label>
                            <div className="flex flex-wrap gap-2">
                                {['none', 'daily', 'monthly', 'yearly'].map(type => (
                                    <button key={type} type="button" onClick={() => setFormData({ ...formData, repeatType: type })} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${formData.repeatType === type ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                        {type === 'none' ? 'ครั้งเดียว' : type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 flex items-center gap-1"><Users size={14} /> แชร์กับใคร?</label>
                            <div className="flex flex-wrap gap-2">
                                {users.map(u => (
                                    <button key={u.id} type="button" onClick={() => {
                                        const next = formData.visibleTo.includes(u.id) ? formData.visibleTo.filter(id => id !== u.id) : [...formData.visibleTo, u.id];
                                        setFormData({ ...formData, visibleTo: next });
                                    }} className={`px-3 py-1 rounded-full text-[10px] font-bold ${formData.visibleTo.includes(u.id) ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{u.username}</button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="bg-rose-500 text-white font-black py-3 rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all uppercase text-sm tracking-widest col-span-1 md:col-span-2">บันทึกนัดหมาย ✨</button>
                    </form>
                </div>

                {/* ภาพรวมวันสำคัญ */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-rose-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <Filter className="text-rose-400" size={20} /> ภาพรวมวันสำคัญ
                        </h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="bg-rose-50 p-1 rounded-xl flex gap-1 mr-2">
                                <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'month' ? 'bg-white text-rose-500 shadow-sm' : 'text-rose-300'}`}>Month</button>
                                <button onClick={() => setViewMode('year')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'year' ? 'bg-white text-rose-500 shadow-sm' : 'text-rose-300'}`}>Year</button>
                            </div>
                            {viewMode === 'month' && (
                                <select className="p-2 rounded-xl bg-rose-50 border-none text-xs font-bold text-rose-600 outline-none" value={viewFilter.month} onChange={(e) => setViewFilter({...viewFilter, month: parseInt(e.target.value)})}>
                                    {Array.from({length: 12}, (_, i) => (<option key={i} value={i}>{new Date(0, i).toLocaleString('th-TH', {month: 'long'})}</option>))}
                                </select>
                            )}
                            <select className="p-2 rounded-xl bg-rose-50 border-none text-xs font-bold text-rose-600 outline-none" value={viewFilter.year} onChange={(e) => setViewFilter({...viewFilter, year: parseInt(e.target.value)})}>
                                {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (<option key={y} value={y}>{y}</option>))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
                        {filteredOverview.length > 0 ? (
                            filteredOverview.sort((a, b) => new Date(a.event_date) - new Date(b.event_date)).map(ev => (
                                <div key={`ov-${ev.id}`} className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                                    <p className="font-black text-rose-600 text-sm truncate">{ev.title}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(ev.event_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                                        <span className="text-[9px] bg-white text-rose-400 px-2 py-0.5 rounded-full border border-rose-100 font-black uppercase">{ev.repeat_type}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center col-span-full py-10 text-slate-300 text-xs italic">ไม่มีรายการวันพิเศษ ❤️</p>
                        )}
                    </div>
                </div>

                {/* Calendar & List Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-rose-100 h-fit">
                        <Calendar onChange={setDate} value={date} tileContent={tileContent} className="border-none w-full" />
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                        {events.filter(ev => ev.repeat_type === 'yearly').map(ev => {
                            const days = getDaysLeft(ev.event_date);
                            if (days >= 0 && days <= 7) return (
                                <div key={`cd-${ev.id}`} className="bg-amber-50 border-2 border-amber-200 p-3 rounded-2xl animate-pulse">
                                    <p className="text-amber-600 text-[11px] font-black uppercase">🔥 อีก {days === 0 ? "วันนี้แล้ว!" : `${days} วัน`} : {ev.title}</p>
                                </div>
                            );
                            return null;
                        })}

                        <h3 className="font-bold text-slate-500 sticky top-0 bg-rose-50 py-1 text-sm border-b-2 border-rose-100">📅 รายการวันที่ {date.toLocaleDateString('th-TH')}</h3>
                        
                        {events.filter(ev => {
                            const d = new Date(ev.event_date);
                            if (ev.repeat_type === 'yearly') return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
                            if (ev.repeat_type === 'monthly') return d.getDate() === date.getDate();
                            if (ev.repeat_type === 'daily') return true;
                            return d.toDateString() === date.toDateString();
                        }).length > 0 ? (
                            events.filter(ev => {
                                const d = new Date(ev.event_date);
                                if (ev.repeat_type === 'yearly') return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
                                if (ev.repeat_type === 'monthly') return d.getDate() === date.getDate();
                                if (ev.repeat_type === 'daily') return true;
                                return d.toDateString() === date.toDateString();
                            }).map(event => (
                                <div key={event.id} className="bg-white p-4 rounded-2xl border-l-4 border-rose-400 shadow-sm flex justify-between items-center group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-rose-600">{event.title}</p>
                                            <span className="text-[10px] bg-rose-50 text-rose-400 px-2 py-0.5 rounded-md font-bold">
                                                {new Date(event.event_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">{event.description}</p>
                                    </div>
                                    {event.created_by === userId && (
                                        <button onClick={() => deleteEvent(event.id, event.title)} className="text-slate-200 hover:text-rose-500 p-2 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-300 italic text-xs">วันนี้ยังว่างอยู่... ❤️</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;