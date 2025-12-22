import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Users, 
  Bot, 
  ChevronLeft, 
  Zap, 
  Target, 
  ShieldCheck,
  PlayCircle
} from 'lucide-react';

const PlayMindGame = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [level, setLevel] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    useEffect(() => {
        const fetchLevelInfo = async () => {
            const { data } = await supabase
                .from('heart_games')
                .select('*, host:users!heart_games_host_id_fkey(username)')
                .eq('id', id)
                .single();
            if (data) setLevel(data);
        };
        fetchLevelInfo();
    }, [id]);

    // ใน PlayMindGame.jsx ส่วน handleSelectMode
const handleSelectMode = async (mode) => {
    setLoading(true);
    try {
        if (mode === 'bot') {
            // ✅ สร้าง Session ใหม่สำหรับบอทผ่าน Backend
            const res = await fetch(`${API_URL}/api/game/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: id,
                    guesser_id: user.id,
                    use_bot: true
                })
            });
            const session = await res.json();
            if (res.ok) {
                // ย้ายไปหน้าแชทโดยใช้ Session ID
                navigate(`/game-session/${session.id}?mode=bot`);
            }
        } else {
            // ✅ โหมดคน: ใช้ระบบส่งคำเชิญเดิม
            const res = await fetch(`${API_URL}/api/game/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: id,
                    guesser_id: user.id,
                    host_id: level.host_id
                })
            });
            if (res.ok) {
                alert(`🚀 ส่งคำเชิญไปแล้ว! รอแฟนรับคำท้าที่หน้า Lobby นะครับ`);
                navigate('/mind-game');
            }
        }
    } catch (err) {
        console.error("Mode selection error:", err);
    } finally {
        setLoading(false);
    }
};

    if (!level) return <div className="p-20 text-center font-black italic text-slate-400">LOADING LEVEL...</div>;

    return (
        <div className="min-h-screen bg-[#fafafa] p-6 flex flex-col items-center">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/mind-game')}
                className="self-start mb-8 flex items-center gap-2 text-slate-400 font-black italic uppercase text-xs hover:text-pink-500 transition-colors"
            >
                <ChevronLeft size={16} /> Back to Lobby
            </button>

            {/* Level Card Summary */}
            <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target size={120} />
                </div>
                <div className="relative z-10">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic mb-4 inline-block">
                        Mission Briefing
                    </span>
                    <h1 className="text-3xl font-black italic uppercase leading-none mb-2">
                        ท้าทายโจทย์ของ <br />
                        <span className="text-rose-500">{level.host?.username}</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs italic uppercase tracking-widest">
                        วิเคราะห์คำในใจ และทำเวลาให้ดีที่สุด
                    </p>
                </div>
            </div>

            <h2 className="text-slate-800 font-black italic uppercase text-sm mb-6 tracking-[0.3em]">เลือกโหมดการเล่น</h2>

            <div className="grid w-full max-w-md gap-6">
                {/* Mode: Play with Human */}
                <button 
                    onClick={() => handleSelectMode('human')}
                    disabled={loading}
                    className="group relative bg-white border-2 border-slate-100 p-6 rounded-[2rem] shadow-xl hover:border-rose-400 transition-all active:scale-95 text-left"
                >
                    <div className="flex items-center gap-5">
                        <div className="bg-rose-50 p-4 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <Users size={32} />
                        </div>
                        <div>
                            <h3 className="font-black italic text-slate-800 uppercase text-lg">เล่นกับเจ้าของโจทย์</h3>
                            <p className="text-xs font-bold text-slate-400 italic">ส่งคำเชิญและรอแฟนมาตอบ ใช่/ไม่ใช่</p>
                        </div>
                    </div>
                    <Zap className="absolute top-4 right-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                </button>

                {/* Mode: Play with Gemini Bot */}
                <button 
                    onClick={() => handleSelectMode('bot')}
                    disabled={loading}
                    className="group relative bg-white border-2 border-slate-100 p-6 rounded-[2rem] shadow-xl hover:border-purple-400 transition-all active:scale-95 text-left"
                >
                    <div className="flex items-center gap-5">
                        <div className="bg-purple-50 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Bot size={32} />
                        </div>
                        <div>
                            <h3 className="font-black italic text-slate-800 uppercase text-lg">ท้าทาย Gemini AI</h3>
                            <p className="text-xs font-bold text-slate-400 italic">ให้บอทช่วยตอบแทนแฟน เล่นได้ทันที!</p>
                        </div>
                    </div>
                    <ShieldCheck className="absolute top-4 right-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                </button>
            </div>

            <div className="mt-12 flex items-center gap-2 text-slate-300 font-bold italic text-[10px] uppercase">
                <PlayCircle size={14} /> 
                คะแนนจะถูกบันทึกใน Leaderboard ของด่านนี้
            </div>
        </div>
    );
};

export default PlayMindGame;