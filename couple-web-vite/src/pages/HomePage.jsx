/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Heart, Rocket, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeConstants';
import SeasonalOverlay from "../components/SeasonalOverlay";

const SINGLE_PHOTO = "/Photo on 16-7-2568 BE at 09.35.jpg";

// ✅ ปรับปรุงให้รองรับมือถือ (ลดจำนวนชิ้นส่วนถ้าจอเล็ก)
const generateMosaicPieces = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const rows = isMobile ? 5 : 10; 
  const cols = isMobile ? 5 : 10; 
  const pieces = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const targetX = (c * (100 / cols));
      const targetY = (r * (100 / rows));
      
      pieces.push({
        id: `piece-${r}-${c}`,
        targetX: targetX, 
        targetY: targetY,
        width: (100 / cols) + 0.1,
        height: (100 / rows) + 0.1,
        bgPosX: c === 0 ? 0 : (c * 100) / (cols - 1),
        bgPosY: r === 0 ? 0 : (r * 100) / (rows - 1),
        midX: targetX + (Math.cos(r + c) * 25),
        midY: targetY + (Math.sin(r + c) * 25),
        delay: (r * 0.05) + (c * 0.03),
        bgSizeX: cols * 100.1, // ✅ ปรับขนาดพื้นหลังตามจำนวนชิ้นส่วนจริง
        bgSizeY: rows * 100.1
      });
    }
  }
  return pieces;
};

const FixedPhoto = ({ src, rotate, isVisible }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0, x: 200, y: 200 }}
    animate={isVisible ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: rotate } : {}}
    whileHover={{ scale: 1.1, rotate: 0 }}
    className="w-20 h-20 md:w-32 md:h-32 bg-white p-1.5 shadow-xl rounded-lg border border-rose-100 cursor-pointer z-30"
  >
    <img src={src} className="w-full h-full object-cover rounded" alt="Memory" />
  </motion.div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [specialEvents, setSpecialEvents] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [showFixedPhotos, setShowFixedPhotos] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const mosaicPieces = useMemo(() => generateMosaicPieces(), []);
  const userId = localStorage.getItem('user_id');
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

  // ✅ แก้ไขการจำสถานะการระเบิด ให้ถูกต้องตามกฎของ React Compiler
  useEffect(() => {
    const explosionStatus = localStorage.getItem('isExploded');
    const explosionTime = localStorage.getItem('explosionTimestamp');
    const totalDuration = 40000;

    if (explosionStatus === 'true' && explosionTime) {
      const now = Date.now();
      const diff = now - parseInt(explosionTime);
      
      if (diff < totalDuration) {
        // ✅ วิธีแก้: ใช้ setTimeout เพื่อผลักการเปลี่ยนสถานะไปอยู่นอกจังหวะ Rendering
        const initTimer = setTimeout(() => {
          setIsExploding(true);
        }, 0);

        const remaining = totalDuration - diff;
        const mainTimer = setTimeout(() => {
          setIsExploding(false);
          setShowFixedPhotos(true);
          localStorage.removeItem('isExploded');
          localStorage.removeItem('explosionTimestamp');
        }, remaining);

        return () => {
          clearTimeout(initTimer);
          clearTimeout(mainTimer);
        };
      } else {
        // ถ้าครบเวลาแล้ว ให้แสดงรูปประจำที่ทันที (แต่ยังต้องดีเลย์นิดนึงเพื่อเลี่ยง Error เดิม)
        const showTimer = setTimeout(() => setShowFixedPhotos(true), 0);
        localStorage.removeItem('isExploded');
        localStorage.removeItem('explosionTimestamp');
        return () => clearTimeout(showTimer);
      }
    }
  }, []);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/highlights?user_id=${userId}`);
        setSpecialEvents(res.data || []);
      } catch (err) { console.error("Error fetching highlights:", err); }
    };
    if (userId) fetchHighlights();
  }, [userId, API_URL]);

  const handleExplosion = () => {
    setIsExploding(true);
    // ✅ บันทึกลง LocalStorage
    localStorage.setItem('isExploded', 'true');
    localStorage.setItem('explosionTimestamp', Date.now().toString());

    setTimeout(() => {
      setIsExploding(false);
      setShowFixedPhotos(true);
      localStorage.removeItem('isExploded');
      localStorage.removeItem('explosionTimestamp');
    }, 5000); 
  };

  const bgStyles = {
    home: "bg-rose-50", newyear: "bg-yellow-50", chinese: "bg-red-50", christmas: "bg-emerald-50",
    summer: "bg-orange-50", winter: "bg-blue-50", rainy: "bg-slate-100", day: "bg-sky-50", night: "bg-slate-900"
  };

  return (
    <div className={`min-h-screen ${bgStyles[currentTheme.id]} p-4 relative overflow-hidden flex items-center justify-center transition-colors duration-1000`}>
      
      <SeasonalOverlay themeId={currentTheme.id} />

      <AnimatePresence>
        {isExploding && mosaicPieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, left: "90%", top: "80%" }}
            animate={{ 
              opacity: [1, 1, 1, 0], 
              scale: [0, 1.1, 1, 1, 0], 
              left: ["90%", `${p.midX}%`, `${p.targetX}%`, `${p.targetX}%`, `${p.targetX}%`], 
              top: ["80%", `${p.midY}%`, `${p.targetY}%`, `${p.targetY}%`, `${p.targetY}%`],
            }}
            transition={{ 
              duration: 40, 
              ease: "circOut",
              times: [0, 0.03, 0.08, 0.95, 1], 
              delay: p.delay 
            }}
            style={{ 
              width: `${p.width}vw`, 
              height: `${p.height}vh`,
              position: 'fixed',
              zIndex: 9999,
              pointerEvents: 'none',
              backgroundImage: `url("${SINGLE_PHOTO}")`,
              backgroundSize: `${p.bgSizeX}% ${p.bgSizeY}%`, 
              backgroundPosition: `${p.bgPosX}% ${p.bgPosY}%`,
              backgroundRepeat: 'no-repeat',
              border: 'none', 
              outline: 'none',
            }}
          />
        ))}
      </AnimatePresence>

      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        <div className="hidden lg:flex flex-col gap-6 absolute left-10 top-1/4 z-20">
          {showFixedPhotos && (
            <>
              <FixedPhoto src={SINGLE_PHOTO} rotate={-12} isVisible={showFixedPhotos} />
              <FixedPhoto src={SINGLE_PHOTO} rotate={8} isVisible={showFixedPhotos} />
              <FixedPhoto src={SINGLE_PHOTO} rotate={-5} isVisible={showFixedPhotos} />
            </>
          )}
        </div>

        <div className="flex-1 w-full flex justify-center order-2 lg:order-1">
          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border border-rose-100 max-w-lg w-full text-center relative overflow-hidden">
            <div className="text-5xl mb-4 animate-bounce select-none">💖</div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Our Space</h1>
            
            <div className="relative group mb-8 rounded-2xl overflow-hidden aspect-video bg-slate-50 flex items-center justify-center border-4 border-rose-50 shadow-inner">
              <AnimatePresence mode='wait'>
                <motion.img 
                  key={currentImgIndex}
                  src={SINGLE_PHOTO}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/create')} className="bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                ขออนุญาต ✨ <Rocket size={20}/>
              </button>
              <button onClick={() => navigate('/history')} className="bg-slate-50 text-slate-600 font-black py-4 rounded-2xl border-2 border-slate-100 hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2">
                ดูประวัติคำขอ <ClipboardList size={20}/>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-rose-100 relative min-h-[250px]">
            <h3 className="text-rose-500 font-black flex items-center gap-2 mb-4 text-lg">
              <Star size={20} fill="currentColor" className="text-yellow-400"/> รายการสำคัญ
            </h3>
            
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {specialEvents.length > 0 ? specialEvents.map((ev) => (
                <div key={ev.id} className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{ev.title}</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(ev.event_date).toLocaleDateString('th-TH')}</p>
                </div>
              )) : (
                <div className="py-10 text-center opacity-30 italic text-xs font-bold text-slate-400">ยังไม่มีวันสำคัญจดไว้เลย</div>
              )}
            </div>

            {!isExploding && !showFixedPhotos && (
              <motion.div 
                onClick={handleExplosion}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="absolute -bottom-4 -right-4 w-14 h-14 bg-rose-500 rounded-2xl cursor-pointer flex items-center justify-center shadow-2xl z-50 animate-pulse border-4 border-white"
              >
                <div className="grid grid-cols-2 gap-1">
                  {[1,2,3,4].map(i => <div key={i} className="w-2.5 h-2.5 bg-white rounded-sm" />)}
                </div>
              </motion.div>
            )}
          </div>

          {showFixedPhotos && (
            <div className="flex justify-center gap-4 pt-2">
              <FixedPhoto src={SINGLE_PHOTO} rotate={12} isVisible={showFixedPhotos} />
              <FixedPhoto src={SINGLE_PHOTO} rotate={-8} isVisible={showFixedPhotos} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;