import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Camera, Send, Image as ImageIcon, Heart, Loader2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const MomentPage = () => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newMoment, setNewMoment] = useState({ url: '', caption: '' });
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]); // ✅ เพิ่มเลือกแฟน
    const [visibleTo, setVisibleTo] = useState([]);

    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    const fetchData = useCallback(async () => {
        try {
            const [momentRes, userRes] = await Promise.all([
                axios.get(`${API_URL}/api/moment/get`),
                axios.get(`${API_URL}/api/users`)
            ]);
            setMoments(momentRes.data || []);
            setUsers(userRes.data.filter(u => u.id !== userId)); // แสดงเฉพาะแฟน
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [API_URL, userId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleImageUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;
            setUploading(true);
            const fileName = `moment-${userId}-${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
            setNewMoment(prev => ({ ...prev, url: data.publicUrl }));
        } catch (error) { alert('อัปโหลดรูปไม่สำเร็จ: ' + error.message); } 
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        if (!newMoment.url) return alert("เลือกรูปก่อนนะ ✨");
        if (visibleTo.length === 0) return alert("เลือกคนที่จะแจ้งเตือนก่อนครับ");
        try {
            await axios.post(`${API_URL}/api/moment/save`, {
                user_id: userId,
                image_url: newMoment.url,
                caption: newMoment.caption,
                visible_to: visibleTo // ✅ ส่งรายชื่อแฟน
            });
            setNewMoment({ url: '', caption: '' });
            setShowForm(false);
            fetchData();
        } catch (err) { 
            console.error("Save moment error:", err);
            alert("บันทึกไม่สำเร็จ"); }
    };

    return (
        <div className="min-h-screen bg-white p-6 pb-24">
            <div className="max-w-md mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-700 italic uppercase italic">Moments</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เก็บความทรงจำวันละรูป ✨</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="p-3 bg-slate-900 text-white rounded-2xl active:scale-90 transition-all">
                        {showForm ? <X size={20}/> : <Camera size={20} />}
                    </button>
                </header>

                {showForm && (
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-4 shadow-xl">
                        <div className="relative aspect-video bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                            {newMoment.url ? <img src={newMoment.url} className="w-full h-full object-cover" /> :
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    {uploading ? <Loader2 className="animate-spin text-slate-400" /> : <ImageIcon className="text-slate-300" size={32} />}
                                    <span className="text-[10px] font-black text-slate-400 uppercase">คลิกเพื่อเลือกรูปภาพ</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>}
                        </div>

                        <textarea className="w-full p-4 bg-white rounded-2xl text-xs font-bold focus:border-slate-900 h-20 outline-none" placeholder="วันนี้ทำอะไรมาบ้าง..." value={newMoment.caption} onChange={e => setNewMoment({...newMoment, caption: e.target.value})} />
                        
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase italic ml-2">แจ้งเตือนถึงใคร? (แฟน)</p>
                            <div className="flex flex-wrap gap-2">
                                {users.map(u => (
                                    <button key={u.id} onClick={() => setVisibleTo(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                        className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${visibleTo.includes(u.id) ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                                        @{u.username}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={uploading || !newMoment.url} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-md">บันทึก Moment ✨</button>
                    </div>
                )}

                <div className="space-y-8">
                    {loading ? <div className="text-center py-10 text-slate-300 animate-pulse uppercase text-[10px] font-black">กำลังโหลดอัลบั้ม...</div> :
                    moments.map((m) => (
                        <div key={m.id} className="group space-y-3">
                            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border-4 border-white shadow-xl">
                                <img src={m.image_url} alt="moment" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-white/80 px-3 py-1 rounded-full text-[9px] font-black text-slate-700 italic">{new Date(m.created_at).toLocaleDateString('th-TH')}</div>
                            </div>
                            <div className="px-2 flex items-start justify-between">
                                <p className="text-sm font-bold text-slate-600 italic">"{m.caption}"</p>
                                <Heart size={16} className="text-rose-400 fill-rose-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default MomentPage;