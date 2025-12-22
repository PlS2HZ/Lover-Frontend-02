import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Heart, ArrowLeft, Save } from 'lucide-react';

const CreateLevel = () => { // ❌ เอา { user } ออก เพราะเราจะดึงจาก localStorage แทนเพื่อความชัวร์
    const [secretWord, setSecretWord] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // ✅ ดึง userId โดยตรงจาก localStorage
    const userId = localStorage.getItem('user_id');

    const handleCreate = async () => {
        if (!secretWord || !userId) { // ✅ เช็คทั้งคำลับและ userId
            alert("กรุณาใส่คำลับก่อนบันทึกนะ");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('heart_games')
                .insert([{
                    host_id: userId, // ✅ ใช้ userId ที่ดึงมา
                    secret_word: secretWord,
                    is_template: true
                }]);
            
            if (error) throw error;
            alert("สร้างด่านใหม่สำเร็จ! 🎉");
            navigate('/mind-game'); // ✅ ย้อนกลับไปหน้า Lobby
        } catch (err) {
            console.error("Create Level Error:", err);
            alert("เกิดข้อผิดพลาดในการสร้างด่าน: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <button onClick={() => navigate('/mind-game')} className="flex items-center gap-2 text-slate-400 font-bold mb-8">
                <ArrowLeft size={20} /> กลับไป Lobby
            </button>
            
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-2 border-pink-50 text-center">
                <Heart className="mx-auto text-pink-500 mb-4 animate-pulse" size={48} fill="currentColor" />
                <h1 className="text-2xl font-black italic uppercase text-slate-800 mb-2">สร้างโจทย์ใหม่</h1>
                <p className="text-xs font-bold text-slate-400 uppercase italic mb-8">คำในใจที่อยากให้แฟนทายคืออะไร?</p>

                <input 
                    type="text"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-pink-500 focus:outline-none mb-6 text-center font-bold text-lg"
                    placeholder="เช่น... รถมอเตอร์ไซค์"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                />

                <button 
                    onClick={handleCreate}
                    disabled={loading || !secretWord}
                    className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black italic uppercase flex items-center justify-center gap-2 hover:bg-rose-500 transition-all disabled:opacity-50"
                >
                    <Save size={20} /> {loading ? "กำลังบันทึก..." : "บันทึกด่าน"}
                </button>
            </div>
        </div>
    );
};

export default CreateLevel;