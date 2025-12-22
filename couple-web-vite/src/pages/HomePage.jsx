/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Heart, Rocket, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeConstants';
import SeasonalOverlay from "../components/SeasonalOverlay";
import PWAHandler from '../components/PWAHandler';

// ✅ 1. ข้อมูลรูปภาพ Slideshow แยกตามอุปกรณ์
const PHOTO_DATA = [
  { pc: "/com1.jpg", mobile: "/mb1.jpg", caption: "วันแรกที่เราเจอกัน ❤️" },
  { pc: "/com2.jpg", mobile: "/mb2.jpg", caption: "ทริปทะเลแสนหวาน 🌊" },
  { pc: "/com3.jpg", mobile: "/mb3.jpg", caption: "ดินเนอร์สุดพิเศษของเรา ✨" },
  { pc: "/com4.jpg", mobile: "/mb4.jpg", caption: "การผจญภัยที่ไม่มีวันลืม 🏞️" },
  { pc: "/com5.jpg", mobile: "/mb5.jpg", caption: "ช่วงเวลาที่แสนอบอุ่นด้วยกัน 🥰" }
];

// ✅ 2. รูปภาพแสดงประจำที่ 5 รูปหลังระเบิดเสร็จ
const FIXED_PHOTOS = [
  "/mb6.jpg", "/mb7.jpg", "/mb9.jpg", "/mb10.jpg", "/mb11.jpg"
];

const CountdownUnit = ({ value, unit }) => (
  <div className="bg-white/80 py-1 rounded-lg border border-rose-50 text-center shadow-sm">
    <p className="text-[11px] font-black text-rose-500 leading-tight">{value}</p>
    <p className="text-[7px] font-bold text-slate-300 uppercase leading-none">{unit}</p>
  </div>
);

// ✅ 3. ปรับปรุงฟังก์ชัน generateMosaicPieces (แก้รอยต่อพิกเซล)
// ปรับปรุงฟังก์ชันเช็คประเภทอุปกรณ์และขนาดชิ้นพิกเซล
const generateMosaicPieces = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const rows = isMobile ? 8 : (isTablet ? 9 : 10); 
  const cols = isMobile ? 6 : (isTablet ? 8 : 10); 
  
  const mosaicPhoto = isMobile ? "/mb8.jpg" : "/com2.jpg";

  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const targetX = (c * (100 / cols));
      const targetY = (r * (100 / rows));
      pieces.push({
        id: `piece-${r}-${c}`, 
        targetX, targetY,
        width: `${100 / cols}%`, // ✅ ใช้ % เพื่อให้พอดีหน้าจอทุกขนาด
        height: `${100 / rows}%`,
        bgPosX: c === 0 ? 0 : (c * 100) / (cols - 1), 
        bgPosY: r === 0 ? 0 : (r * 100) / (rows - 1),
        midX: targetX + (Math.cos(r + c) * 20), 
        midY: targetY + (Math.sin(r + c) * 20),
        delay: (r * 0.04) + (c * 0.02), 
        bgSizeX: cols * 100, 
        bgSizeY: rows * 100,
        photo: mosaicPhoto 
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExploding, setIsExploding] = useState(false);
  const [showFixedPhotos, setShowFixedPhotos] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // ✅ แก้ไขปัญหา 'isMobileView' is not defined
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const mosaicPieces = useMemo(() => generateMosaicPieces(), []);
  const userId = localStorage.getItem('user_id');
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

// ✅ 1. เพิ่ม State สำหรับจัดการทิศทางการเลื่อน (ใส่ไว้ใน HomePage Component)
const [direction, setDirection] = useState(0); // 1 คือไปข้างหน้า, -1 คือย้อนกลับ

// ✅ 2. ปรับปรุงฟังก์ชันเลื่อนภาพ
const nextImage = () => {
  setDirection(1);
  setCurrentImgIndex((prev) => (prev + 1) % PHOTO_DATA.length);
};

const prevImage = () => {
  setDirection(-1);
  setCurrentImgIndex((prev) => (prev - 1 + PHOTO_DATA.length) % PHOTO_DATA.length);
};
  const getDetailedCountdown = (eventDate, repeatType) => {
    const now = currentTime; let target = new Date(eventDate);
    if (repeatType === 'yearly') {
        target.setFullYear(now.getFullYear());
        if (target < now) target.setFullYear(now.getFullYear() + 1);
    } else if (repeatType === 'monthly') {
        target.setFullYear(now.getFullYear()); target.setMonth(now.getMonth());
        if (target < now) target.setMonth(now.getMonth() + 1);
    }
    const diff = target - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)), hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60), seconds: Math.floor((diff / 1000) % 60)
    };
  };

  useEffect(() => {
    const explosionStatus = localStorage.getItem('isExploded');
    const explosionTime = localStorage.getItem('explosionTimestamp');
    if (explosionStatus === 'true' && explosionTime) {
      const diff = Date.now() - parseInt(explosionTime);
      if (diff < 5000) {
        const initTimer = setTimeout(() => setIsExploding(true), 0);
        const mainTimer = setTimeout(() => {
          setIsExploding(false); setShowFixedPhotos(true);
          localStorage.removeItem('isExploded'); localStorage.removeItem('explosionTimestamp');
        }, 5000 - diff);
        return () => { clearTimeout(initTimer); clearTimeout(mainTimer); };
      } else {
        const showTimer = setTimeout(() => {
          setShowFixedPhotos(true);
          localStorage.removeItem('isExploded'); localStorage.removeItem('explosionTimestamp');
        }, 0);
        return () => clearTimeout(showTimer);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events?user_id=${userId}`);
        setEvents(res.data || []);
      } catch (err) { console.error(err); }
    };
    if (userId) fetchEvents();
  }, [userId, API_URL]);

  const handleExplosion = () => {
    setIsExploding(true);
    localStorage.setItem('isExploded', 'true');
    localStorage.setItem('explosionTimestamp', Date.now().toString());
    setTimeout(() => {
      setIsExploding(false); setShowFixedPhotos(true);
      localStorage.removeItem('isExploded'); localStorage.removeItem('explosionTimestamp');
    }, 5000); 
  };

  const bgStyles = {
    home: "bg-rose-50", newyear: "bg-yellow-50", chinese: "bg-red-50", christmas: "bg-emerald-50",
    summer: "bg-orange-50", winter: "bg-blue-50", rainy: "bg-slate-100", day: "bg-sky-50", night: "bg-slate-900"
  };

  return (
    <div className={`min-h-screen ${bgStyles[currentTheme.id]} p-4 md:p-8 relative overflow-hidden flex items-center justify-center transition-colors duration-1000`}>
      <SeasonalOverlay themeId={currentTheme.id} />

      {/* ✅ จุดที่ 2: วาง Component ไว้ด้านบนสุดหรือจุดที่เหมาะสม */}
      {/* ผมแนะนำให้วางไว้บนสุดของเนื้อหา เพื่อให้แฟนกดได้ง่ายครับ */}
      {/* <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs">
          <PWAHandler />
      </div> */}

      <AnimatePresence>
        // ✅ 5. ปรับปรุงส่วน Explosion (Mosaic Animation)
{isExploding && (
  <div className="fixed inset-0 z-[9999] pointer-events-none"> {/* Container คลุมจอ */}
    {mosaicPieces.map((p) => (
      <motion.div
        key={p.id} 
        initial={{ opacity: 1, scale: 0, left: "90%", top: "80%" }}
        animate={{ 
          opacity: [1, 1, 1, 0], 
          scale: [0, 1, 1, 1, 0], 
          left: ["90%", `${p.midX}%`, `${p.targetX}%`, `${p.targetX}%`, `${p.targetX}%`], 
          top: ["80%", `${p.midY}%`, `${p.targetY}%`, `${p.targetY}%`, `${p.targetY}%`],
        }}
        transition={{ duration: 5, ease: "circOut", times: [0, 0.1, 0.2, 0.9, 1], delay: p.delay }}
        style={{ 
          width: p.width, 
          height: p.height, 
          position: 'absolute', // เปลี่ยนจาก fixed เป็น absolute ภายใน container
          backgroundImage: `url("${p.photo}")`, 
          backgroundSize: `${p.bgSizeX}% ${p.bgSizeY}%`, 
          backgroundPosition: `${p.bgPosX}% ${p.bgPosY}%`, 
          backgroundRepeat: 'no-repeat',
        }}
      />
    ))}
  </div>
)}
      </AnimatePresence>

      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 md:gap-12 items-center justify-center z-10">
        
        <div className="hidden lg:flex flex-col gap-6 absolute left-4 xl:left-10 top-1/4 z-20">
          {showFixedPhotos && (
            <>
              <FixedPhoto src={FIXED_PHOTOS[0]} rotate={-12} isVisible={showFixedPhotos} />
              <FixedPhoto src={FIXED_PHOTOS[1]} rotate={8} isVisible={showFixedPhotos} />
              <FixedPhoto src={FIXED_PHOTOS[2]} rotate={-5} isVisible={showFixedPhotos} />
            </>
          )}
        </div>

        <div className="flex-1 w-full max-w-lg order-2 lg:order-1">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-rose-100 w-full text-center relative overflow-hidden">
            <div className="text-4xl md:text-5xl mb-2 animate-bounce select-none">💖</div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-6 uppercase tracking-tighter italic">Our Space</h1>
<div className="relative group mb-4 rounded-[2rem] overflow-hidden aspect-square md:aspect-video bg-slate-50 flex items-center justify-center border-4 border-rose-50 shadow-inner">
  <AnimatePresence mode='popLayout' custom={direction}>
    <motion.img 
      key={currentImgIndex}
      custom={direction}
      src={isMobileView ? PHOTO_DATA[currentImgIndex].mobile : PHOTO_DATA[currentImgIndex].pc}
      // ✅ เลื่อนตามทิศทางที่กด
      initial={(d) => ({ opacity: 0, x: d > 0 ? 200 : -200 })} 
      animate={{ opacity: 1, x: 0 }} 
      exit={(d) => ({ opacity: 0, x: d > 0 ? -200 : 200 })}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      drag="x" 
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset }) => {
        if (offset.x > 50) prevImage();
        else if (offset.x < -50) nextImage();
      }}
      className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
    />
  </AnimatePresence>
  
  {/* ปุ่มเลื่อนซ้าย-ขวา */}
  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-md p-2 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
    <ChevronLeft size={24} />
  </button>
  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-md p-2 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
    <ChevronRight size={24} />
  </button>
</div>
            <motion.p key={`caption-${currentImgIndex}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 font-bold text-sm md:text-base mb-6 italic">{PHOTO_DATA[currentImgIndex].caption}</motion.p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/create')} className="bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 text-base md:text-lg">ขออนุญาต ✨ <Rocket size={20}/></button>
              <button onClick={() => navigate('/history')} className="bg-slate-50 text-slate-600 font-black py-4 rounded-2xl border-2 border-slate-100 hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">ดูประวัติคำขอ <ClipboardList size={20}/></button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-xl border-2 border-rose-100 relative min-h-[260px] flex flex-col">
            <h3 className="text-rose-500 font-black flex items-center gap-2 mb-4 text-base md:text-lg italic uppercase"><Star size={20} fill="currentColor" className="text-yellow-400"/> Important</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[300px]">
              {events.filter(ev => ev.category_type === 'special').length > 0 ? (
                events.filter(ev => ev.category_type === 'special').map((ev) => {
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
                <div className="flex-1 flex items-center justify-center py-10 text-center opacity-30 italic text-[10px] font-bold text-slate-400">ไม่มีวันพิเศษจดไว้เลย ❤️</div>
              )}
            </div>
            {!isExploding && !showFixedPhotos && (
              <motion.div onClick={handleExplosion} whileHover={{ scale: 1.2, rotate: 10 }} className="absolute -bottom-3 -right-3 w-12 h-12 bg-rose-500 rounded-2xl cursor-pointer flex items-center justify-center shadow-2xl z-50 animate-pulse border-4 border-white">
                <div className="grid grid-cols-2 gap-1">{[1,2,3,4].map(i => <div key={i} className="w-2 h-2 bg-white rounded-sm" />)}</div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-center lg:justify-end gap-4 pt-2 px-2">
            {showFixedPhotos && (
              <>
                <FixedPhoto src={FIXED_PHOTOS[3]} rotate={12} isVisible={showFixedPhotos} />
                <FixedPhoto src={FIXED_PHOTOS[4]} rotate={-8} isVisible={showFixedPhotos} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;