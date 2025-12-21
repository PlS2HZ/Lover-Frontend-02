/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Heart, Rocket, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeConstants';
import SeasonalOverlay from "../components/SeasonalOverlay";

const SINGLE_PHOTO = "/Photo on 16-7-2568 BE at 09.35.jpg";

// ✅ คอมโพเนนต์หน่วย Countdown ขนาดเล็กสำหรับฝั่งขวา
const CountdownUnit = ({ value, unit }) => (
  <div className="bg-white/80 py-1 rounded-lg border border-rose-50 text-center shadow-sm">
    <p className="text-[11px] font-black text-rose-500 leading-tight">{value}</p>
    <p className="text-[7px] font-bold text-slate-300 uppercase leading-none">{unit}</p>
  </div>
);

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
        bgSizeX: cols * 100.1, 
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
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date()); // ✅ สำหรับ Countdown สด
  const [isExploding, setIsExploding] = useState(false);
  const [showFixedPhotos, setShowFixedPhotos] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const mosaicPieces = useMemo(() => generateMosaicPieces(), []);
  const userId = localStorage.getItem('user_id');
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

  // ✅ อัปเดตเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ ฟังก์ชันคำนวณเวลาถอยหลังที่แก้ไขแล้ว (รองรับการคำนวณรอบถัดไปอัตโนมัติ)
  const getDetailedCountdown = (eventDate, repeatType) => {
    const now = currentTime; 
    let target = new Date(eventDate);

    // ✨ ตรรกะการคำนวณรอบถัดไป (Next Occurrence)
    if (repeatType === 'yearly') {
        // ปรับเป้าหมายเป็นปีปัจจุบัน
        target.setFullYear(now.getFullYear());
        // ถ้าปีนี้ผ่านวันนั้นไปแล้ว ให้ดีดไปปีหน้า
        if (target < now) {
            target.setFullYear(now.getFullYear() + 1);
        }
    } else if (repeatType === 'monthly') {
        // ปรับเป้าหมายเป็นปีและเดือนปัจจุบัน
        target.setFullYear(now.getFullYear());
        target.setMonth(now.getMonth());
        // ถ้าเดือนนี้ผ่านวันนั้นไปแล้ว ให้ดีดไปเดือนหน้า
        if (target < now) {
            target.setMonth(now.getMonth() + 1);
        }
    }

    const diff = target - now;

    // กรณีไม่มีการตั้งซ้ำและเวลาผ่านไปแล้ว
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
    };
  };

  useEffect(() => {
    const explosionStatus = localStorage.getItem('isExploded');
    const explosionTime = localStorage.getItem('explosionTimestamp');
    const totalDuration = 5000;

    if (explosionStatus === 'true' && explosionTime) {
      const now = Date.now();
      const diff = now - parseInt(explosionTime);
      
      if (diff < totalDuration) {
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
        const showTimer = setTimeout(() => setShowFixedPhotos(true), 0);
        localStorage.removeItem('isExploded');
        localStorage.removeItem('explosionTimestamp');
        return () => clearTimeout(showTimer);
      }
    }
  }, []);

  // ✅ ดึงข้อมูล Events ทั้งหมดเพื่อแสดงวันพิเศษ
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events?user_id=${userId}`);
        setEvents(res.data || []);
      } catch (err) { console.error("Error fetching events:", err); }
    };
    if (userId) fetchEvents();
  }, [userId, API_URL]);

  const handleExplosion = () => {
    setIsExploding(true);
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
    <div className={`min-h-screen ${bgStyles[currentTheme.id]} p-4 md:p-8 relative overflow-hidden flex items-center justify-center transition-colors duration-1000`}>
      
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

      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 md:gap-12 items-center justify-center z-10">
        
        <div className="hidden lg:flex flex-col gap-6 absolute left-4 xl:left-10 top-1/4 z-20">
          {showFixedPhotos && (
            <>
              <FixedPhoto src={SINGLE_PHOTO} rotate={-12} isVisible={showFixedPhotos} />
              <FixedPhoto src={SINGLE_PHOTO} rotate={8} isVisible={showFixedPhotos} />
              <FixedPhoto src={SINGLE_PHOTO} rotate={-5} isVisible={showFixedPhotos} />
            </>
          )}
        </div>

        <div className="flex-1 w-full max-w-lg order-2 lg:order-1">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-rose-100 w-full text-center relative overflow-hidden">
            <div className="text-4xl md:text-5xl mb-4 animate-bounce select-none">💖</div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-6 uppercase tracking-tighter italic">Our Space</h1>
            
            <div className="relative group mb-6 md:mb-8 rounded-2xl overflow-hidden aspect-video bg-slate-50 flex items-center justify-center border-4 border-rose-50 shadow-inner">
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
              <button onClick={() => navigate('/create')} className="bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 text-base md:text-lg">
                ขออนุญาต ✨ <Rocket size={20}/>
              </button>
              <button onClick={() => navigate('/history')} className="bg-slate-50 text-slate-600 font-black py-4 rounded-2xl border-2 border-slate-100 hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">
                ดูประวัติคำขอ <ClipboardList size={20}/>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-xl border-2 border-rose-100 relative min-h-[260px] flex flex-col">
            <h3 className="text-rose-500 font-black flex items-center gap-2 mb-4 text-base md:text-lg italic uppercase">
              <Star size={20} fill="currentColor" className="text-yellow-400"/> Important
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[300px]">
              {events.filter(ev => ev.category_type === 'special').length > 0 ? (
                events.filter(ev => ev.category_type === 'special').map((ev) => {
                  // ✅ ส่ง ev.repeat_type เข้าไปคำนวณด้วย
                  const timeLeft = getDetailedCountdown(ev.event_date, ev.repeat_type);
                  return (
                    <div key={ev.id} className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 group transition-all hover:bg-rose-100/30 shadow-sm">
                      <p className="text-[11px] font-black text-slate-700 truncate w-full mb-2 uppercase tracking-tight">{ev.title}</p>
                      
                      <div className="grid grid-cols-4 gap-1">
                        <CountdownUnit value={timeLeft.days} unit="D" />
                        <CountdownUnit value={timeLeft.hours} unit="H" />
                        <CountdownUnit value={timeLeft.minutes} unit="M" />
                        <CountdownUnit value={timeLeft.seconds} unit="S" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center py-10 text-center opacity-30 italic text-[10px] font-bold text-slate-400">
                  ไม่มีวันพิเศษจดไว้เลย ❤️
                </div>
              )}
            </div>

            {!isExploding && !showFixedPhotos && (
              <motion.div 
                onClick={handleExplosion}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="absolute -bottom-3 -right-3 w-12 h-12 bg-rose-500 rounded-2xl cursor-pointer flex items-center justify-center shadow-2xl z-50 animate-pulse border-4 border-white"
              >
                <div className="grid grid-cols-2 gap-1">
                  {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 bg-white rounded-sm" />)}
                </div>
              </motion.div>
            )}
          </div>

          {showFixedPhotos && (
            <div className="flex justify-center lg:justify-end gap-4 pt-2 px-2">
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