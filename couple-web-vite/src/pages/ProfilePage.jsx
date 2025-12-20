import React, { useState } from 'react';
import { Camera, User, Mail, Save } from 'lucide-react';

const ProfilePage = () => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [email] = useState(localStorage.getItem('email') || '');
    const [avatar, setAvatar] = useState(localStorage.getItem('user_avatar') || 'https://via.placeholder.com/150');

    const handleSave = () => {
        localStorage.setItem('username', username);
        localStorage.setItem('user_avatar', avatar);
        alert("อัปเดตโปรไฟล์เรียบร้อย! ✨");
    };

    // ✨ เพิ่มฟังก์ชันเพื่อให้ setAvatar ได้ใช้งาน (จำลองการเปลี่ยนรูป)
    const handleAvatarChange = () => {
        const newAvatar = prompt("กรุณาใส่ URL รูปโปรไฟล์ใหม่ของคุณ:", avatar);
        if (newAvatar) {
            setAvatar(newAvatar);
        }
    };

    return (
        <div className="min-h-screen bg-rose-50 p-6 flex justify-center items-start pt-20">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border-2 border-rose-100">
                <div className="bg-rose-500 h-24 relative"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6 flex justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        {/* 📸 เรียกใช้ handleAvatarChange เมื่อคลิกปุ่มกล้อง */}
                        <button 
                            onClick={handleAvatarChange}
                            className="absolute bottom-0 right-1/2 translate-x-12 bg-white p-2 rounded-full shadow-md border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider"><User size={14}/> Username</label>
                            <input className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-600" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider"><Mail size={14}/> Email (เปลี่ยนไม่ได้)</label>
                            <input className="w-full p-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-slate-400" value={email} disabled />
                        </div>
                        <button onClick={handleSave} className="w-full bg-rose-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-rose-200 flex items-center justify-center gap-2 hover:bg-rose-600 transition-all">
                            <Save size={18}/> บันทึกการเปลี่ยนแปลง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;