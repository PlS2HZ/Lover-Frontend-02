import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, User, FileText, Save, Loader2, Users, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient'; // ตรวจสอบว่าไฟล์นี้มีอยู่จริงใน src/

const ProfilePage = () => {
    const userId = localStorage.getItem('user_id');
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassModal, setShowPassModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [profileData, setProfileData] = useState({
        username: '',
        description: '',
        gender: 'อื่นๆ',
        avatar_url: ''
    });
    const [originalUsername, setOriginalUsername] = useState('');

    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'https://lover-backend.onrender.com';

    useEffect(() => { 
        if (userId) fetchProfile(); 
    }, [userId]);

    // ส่วนที่ต้องเช็คใน ProfilePage.jsx
const fetchProfile = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/users`);
        // ตรวจสอบว่าเป็น Array ก่อน Filter เพื่อป้องกัน Error
        if (Array.isArray(res.data)) {
            const currentUser = res.data.find(u => u.id === userId);
            if (currentUser) {
                setProfileData({
                    username: currentUser.username || '',
                    description: currentUser.description || '',
                    gender: currentUser.gender || 'อื่นๆ',
                    avatar_url: currentUser.avatar_url || ''
                });
                setOriginalUsername(currentUser.username);
                // อัปเดตข้อมูลในเครื่องเผื่อ Navbar ด้วย
                localStorage.setItem('avatar_url', currentUser.avatar_url || '');
            }
        }
    } catch (err) { 
        console.error("Error fetching profile:", err); 
    }
};

const handleAvatarUpload = async (e) => {
    try {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`; 

        // ตรวจสอบว่าเรียกใช้ Bucket ชื่อ 'profiles' ตรงกับใน Dashboard
        let { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
        
        setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }));
        // สำคัญ: ยังไม่ต้องอัปเดต localStorage จนกว่าจะกด 'บันทึก' สำเร็จ
        alert("อัปโหลดรูปภาพสำเร็จ! อย่าลืมกด 'บันทึกข้อมูลส่วนตัว' เพื่อยืนยัน ✨");
        
    } catch (error) {
        console.error('Error uploading avatar:', error.message);
        alert('อัปโหลดรูปไม่สำเร็จ: ' + error.message);
    } finally {
        setUploading(false);
    }
};

    const handleSaveProfile = async () => {
        // เงื่อนไข: ถ้ามีการแก้ไขชื่อผู้ใช้งาน ต้องถามรหัสผ่าน
        if (profileData.username !== originalUsername) {
            setShowPassModal(true);
            return;
        }
        executeSave();
    };

    const executeSave = async () => {
    setIsSaving(true);
    try {
        await axios.patch(`${API_URL}/api/users/update`, {
            id: userId,
            ...profileData,
            confirm_password: confirmPassword 
        });
        
        alert("บันทึกข้อมูลสำเร็จ! ❤️");
        
        // ✨ สำคัญ: เรียก fetchProfile ใหม่เพื่อดึงข้อมูลจริงจาก DB มาโชว์
        await fetchProfile(); 
        
        setShowPassModal(false);
        setConfirmPassword('');
    } catch (err) {
        alert(err.response?.data || "เกิดข้อผิดพลาดในการบันทึก");
    } finally { 
        setIsSaving(false); 
    }
};

    return (
        <div className="min-h-screen bg-rose-50 p-4 pt-10 pb-20 relative">
            {/* Modal ยืนยันรหัสผ่าน (จะปรากฏเมื่อเปลี่ยน Username) */}
            {showPassModal && (
                <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
                        <h3 className="font-black text-slate-700 flex items-center gap-2 text-lg">
                            <Lock size={22} className="text-rose-500"/> ยืนยันรหัสผ่าน
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            คุณกำลังจะเปลี่ยนชื่อผู้ใช้งานเป็น <span className="text-rose-500 font-bold">"{profileData.username}"</span> โปรดระบุรหัสผ่านเพื่อยืนยันความปลอดภัย
                        </p>
                        <input 
                            type="password" 
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-400 transition-all font-bold" 
                            placeholder="รหัสผ่านของคุณ" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                        />
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={() => { setShowPassModal(false); setProfileData(prev => ({...prev, username: originalUsername})); }} 
                                className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={executeSave} 
                                className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl border-2 border-rose-100 overflow-hidden">
                <div className="bg-rose-500 h-32 relative">
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                        <div className="relative group">
                            {/* แสดงรูปโปรไฟล์ ถ้าไม่มีให้ใช้ UI Avatars เป็นค่าเริ่มต้น */}
                            <img 
                                src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${profileData.username}&background=random`} 
                                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white" 
                                alt="Profile" 
                            />
                            <label className="absolute bottom-0 right-0 bg-rose-600 p-2.5 rounded-full text-white cursor-pointer hover:scale-110 shadow-md transition-transform border-2 border-white">
                                <Camera size={18} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload} 
                                    disabled={uploading} 
                                />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <Loader2 className="text-white animate-spin" size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-20 p-8 space-y-6">
                    {/* 2. ชื่อผู้ใช้งาน */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 ml-1">
                            <User size={12}/> 2.ชื่อผู้ใช้งาน (เปลี่ยนชื่อต้องใช้รหัสผ่าน)
                        </label>
                        <input 
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:border-rose-300 transition-all"
                            value={profileData.username} 
                            onChange={(e) => setProfileData({...profileData, username: e.target.value})} 
                        />
                    </div>

                    {/* 3. เพศ */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 ml-1">
                            <Users size={12}/> 3.เพศ
                        </label>
                        <div className="flex gap-2">
                            {['ชาย', 'หญิง', 'อื่นๆ'].map((g) => (
                                <button 
                                    key={g} 
                                    onClick={() => setProfileData({...profileData, gender: g})}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${profileData.gender === g ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. คำอธิบายเกี่ยวกับคุณ */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 ml-1">
                            <FileText size={12}/> 4.คำอธิบายเกี่ยวกับคุณ
                        </label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 h-28 resize-none outline-none focus:border-rose-300 transition-all"
                            placeholder="บอกความรู้สึกของคุณวันนี้..."
                            value={profileData.description} 
                            onChange={(e) => setProfileData({...profileData, description: e.target.value})} 
                        />
                    </div>

                    {/* ปุ่มบันทึกข้อมูล */}
                    <button 
                        onClick={handleSaveProfile} 
                        disabled={isSaving || uploading}
                        className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลส่วนตัว ✨"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;