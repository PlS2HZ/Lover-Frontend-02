import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Clock, User, Tag } from 'lucide-react';

const CreateRequestPage = () => {
    // 1. ดึงข้อมูลจาก localStorage ให้ถูกต้อง
    const userEmail = localStorage.getItem('username') || localStorage.getItem('email') || 'ไม่พบข้อมูลผู้ใช้';
    const userId = localStorage.getItem('user_id');
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        header: 'เที่ยว', // ค่าเริ่มต้นสำหรับ Tag
        title: '',
        receiver_email: '',
        time_start: '',
        time_end: ''
    });

    // ✨ รายการ Tag หัวข้อคำขอ
    const categories = ['เที่ยว', 'ออกกำลังกาย', 'เล่นเกม', 'เล่นกีฬา', 'ดูหนัง', 'กินข้าว'];

    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:8080'
        : 'https://lover-backend.onrender.com';

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await axios.get(`${API_URL}/api/users`);
            setAllUsers(res.data);
        };
        fetchUsers();
    }, []);

    // ✨ ค้นหาผู้รับ: พิมพ์ 1 ตัวก็ขึ้น และค้นหาได้ทั้ง Email/Username
    const handleSearchUser = (val) => {
        setSearchTerm(val);
        if (val.length >= 1) { // เปลี่ยนจาก 2 เป็น 1 ตามต้องการ
            const filtered = allUsers.filter(u => 
                u.email.toLowerCase().includes(val.toLowerCase()) || 
                u.username.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, sender_id: userId };
            await axios.post(`${API_URL}/api/request`, payload);
            alert("ส่งคำขอสำเร็จ! 💖");
        } catch (err) { 
          console.log("CreateRequestPage handleSubmit ", err);
          alert("เกิดข้อผิดพลาด"); }
    };

    return (
        <div className="min-h-screen bg-rose-50 p-4">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border-2 border-rose-100 space-y-8">
                <h1 className="text-3xl font-black text-rose-600 text-center uppercase italic">Create Request</h1>

                {/* 1. หัวข้อคำขอ (Tags) */}
                <div className="space-y-3">
                    <label className="font-bold text-slate-600 flex items-center gap-2"><Tag size={18}/> 1. หัวข้อคำขอ</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button key={cat} type="button" onClick={() => setFormData({...formData, header: cat})}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.header === cat ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-rose-100'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. จากใคร (YOU) */}
                <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-100">
                    <p className="text-xs font-bold text-rose-400 uppercase">2. จาก ID (YOU)</p>
                    <p className="text-lg font-black text-rose-600">{userEmail}</p>
                </div>

                {/* 3. ถึงใคร (Search 1 character) */}
                <div className="space-y-3 relative">
                    <label className="font-bold text-slate-600 flex items-center gap-2"><User size={18}/> 3. ถึงใคร (Email หรือ Username)</label>
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" placeholder="พิมพ์ชื่อหรืออีเมล..." value={searchTerm} onChange={(e) => handleSearchUser(e.target.value)} />
                    {filteredUsers.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border-2 border-rose-100 rounded-2xl mt-1 shadow-xl overflow-hidden">
                            {filteredUsers.map(u => (
                                <div key={u.id} onClick={() => { setFormData({...formData, receiver_email: u.email}); setSearchTerm(u.username); setFilteredUsers([]); }}
                                    className="p-3 hover:bg-rose-50 cursor-pointer border-b border-rose-50 last:border-0">
                                    <p className="font-bold text-slate-700">{u.username}</p>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. รายละเอียด */}
                <div className="space-y-3">
                    <label className="font-bold text-slate-600">4. รายละเอียด</label>
                    <textarea className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-32" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>

                {/* 5 & 6 เวลาที่เริ่ม/สิ้นสุด */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-bold text-slate-600 flex items-center gap-2"><Clock size={16}/> 5. เวลาที่เริ่ม</label>
                        <input type="datetime-local" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={formData.time_start} onChange={(e) => setFormData({...formData, time_start: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="font-bold text-slate-600 flex items-center gap-2"><Clock size={16}/> 6. เวลาที่สิ้นสุด</label>
                        <input type="datetime-local" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={formData.time_end} onChange={(e) => setFormData({...formData, time_end: e.target.value})} />
                    </div>
                </div>

                <button type="submit" className="w-full bg-rose-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Send size={20}/> ส่งคำขอความรัก ✨
                </button>
            </form>
        </div>
    );
};

export default CreateRequestPage;