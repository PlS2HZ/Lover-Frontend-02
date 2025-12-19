import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { Heart, Bell, Trash2, Users, Calendar as LucideCalendar } from 'lucide-react';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true); // เพิ่มสถานะการโหลด
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibleTo: []
    });

    const userId = localStorage.getItem('user_id');
    // *** สำคัญมาก: ตรวจสอบ URL ตรงนี้ให้ตรงกับหน้า Dashboard ของ Render ของคุณ ***
    const API_URL = "https://lover-backend.onrender.com";

    useEffect(() => {
        // สร้างฟังก์ชันรวมเพื่อจัดการลำดับการโหลด
        const initPage = async () => {
            setIsLoading(true);
            try {
                // เรียกพร้อมกันเพื่อความเร็ว
                await Promise.all([fetchEvents(), fetchUsers()]);
            } catch (err) {
                console.error("Initialization Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            initPage();
        }
    }, [userId]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/events?user_id=${userId}`);
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (err) { 
            console.error("Fetch Events Error:", err);
            // ถ้า Render หลับ ให้รอ 5 วินาทีแล้วลองใหม่
            setTimeout(fetchEvents, 5000); 
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users`);
            const allUsers = Array.isArray(res.data) ? res.data : [];
            setUsers(allUsers.filter(u => u.id !== userId));
        } catch (err) { 
            console.error("Fetch Users Error:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                event_date: date.toISOString(),
                title: formData.title,
                description: formData.description,
                created_by: userId,
                visible_to: formData.visibleTo
            };
            await axios.post(`${API_URL}/api/events/create`, payload);
            alert("บันทึกวันสำคัญเรียบร้อย! ❤️");
            setFormData({ title: '', description: '', visibleTo: [] });
            fetchEvents();
        } catch (err) { 
            console.error("Calendar Error:", err);
            alert("เกิดข้อผิดพลาดในการบันทึก"); }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm("ต้องการลบวันสำคัญนี้ใช่หรือไม่?")) return;
        try {
            await axios.delete(`${API_URL}/api/events/delete?id=${id}`);
            fetchEvents();
        } catch (err) { 
            console.error("Calendar Error:", err);
            alert("ลบไม่สำเร็จ"); }
    };

    // ฟังก์ชันตรวจสอบว่าวันไหนมีกิจกรรม เพื่อใส่จุดสีชมพูในปฏิทิน
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const hasEvent = events.some(event => 
                new Date(event.event_date).toDateString() === date.toDateString()
            );
            return hasEvent ? <div className="h-1.5 w-1.5 bg-rose-400 rounded-full mx-auto mt-1"></div> : null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-rose-500 font-bold">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
                <p className="animate-pulse">ระบบปฏิทินกำลังตื่น... รอแป๊บน้าาา ❤️</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rose-50 p-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-black text-rose-600 flex items-center gap-2">
                    <Heart fill="currentColor" /> CALENDAR OF LOVE
                </h1>

                {/* ส่วนฟอร์มเพิ่มวันสำคัญ */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-rose-100">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Bell className="text-rose-400" /> เพิ่มวันพิเศษ
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-rose-300 outline-none"
                            placeholder="หัวข้อ (เช่น วันครบรอบ)"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                        <input 
                            className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-rose-300 outline-none"
                            placeholder="คำอวยพร/คำอธิบาย"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-500 flex items-center gap-1">
                                <Users size={16}/> ใครมองเห็นได้บ้าง?
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {users.map(user => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.visibleTo;
                                            const next = current.includes(user.id) 
                                                ? current.filter(id => id !== user.id)
                                                : [...current, user.id];
                                            setFormData({...formData, visibleTo: next});
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                            formData.visibleTo.includes(user.id) 
                                            ? 'bg-rose-500 text-white' 
                                            : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {user.username}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-rose-500 text-white font-black py-3 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">
                                บันทึกวันพิเศษ ✨
                            </button>
                        </div>
                    </form>
                </div>

                {/* ส่วนปฏิทินและรายการ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-rose-100">
                        <Calendar 
                            onChange={setDate} 
                            value={date}
                            tileContent={tileContent}
                            className="border-none w-full"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-600">รายการในวันที่ {date.toLocaleDateString('th-TH')}</h3>
                        {events.filter(e => new Date(e.event_date).toDateString() === date.toDateString()).length > 0 ? (
                            events.filter(e => new Date(e.event_date).toDateString() === date.toDateString()).map(event => (
                                <div key={event.id} className="bg-white p-4 rounded-2xl border-l-4 border-rose-400 shadow-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-rose-600">{event.title}</p>
                                        <p className="text-sm text-slate-500">{event.description}</p>
                                    </div>
                                    {event.created_by === userId && (
                                        <button onClick={() => deleteEvent(event.id)} className="text-slate-300 hover:text-rose-500 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 italic text-center py-10">ยังไม่มีนัดหมายในวันนี้...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;