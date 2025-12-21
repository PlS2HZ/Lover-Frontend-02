import React, { useEffect, useState } from 'react';
import axios from 'axios';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PWAHandler = () => {
  // ✅ เช็คทั้งว่า "ตกลงแล้ว" หรือ "กดปิดทิ้ง" ไปหรือยัง
  const [shouldHide, setShouldHide] = useState(() => {
    const subscribed = localStorage.getItem('pwa_subscribed') === 'true';
    const dismissed = localStorage.getItem('pwa_dismissed') === 'true';
    return subscribed || dismissed;
  });

  const userId = localStorage.getItem('user_id');
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://lover-backend.onrender.com';

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW Registered!'))
        .catch(err => console.error('SW Registration failed', err));
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('ไม่เป็นไรครับนาย ถ้าเปลี่ยนใจสามารถมากดเปิดใหม่ได้ที่การตั้งค่าเบราว์เซอร์นะ');
        handleDismiss(); // ถ้าเขาปฏิเสธ ก็ให้ปิดหน้าต่างนี้ไปเลย
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = "BOkbnuWUKrV8BKHA5UkNQAovhejO3ANCGjrY2M86OsYZ_WHRZSYUAaeKvh0g6qr1WjI5pZdZ1PwCelM6_ReNbF0"; 

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await axios.post(`${API_URL}/api/save-subscription`, {
        user_id: userId,
        subscription: subscription
      });

      localStorage.setItem('pwa_subscribed', 'true');
      setShouldHide(true);
      alert('ลงทะเบียนแจ้งเตือนสำเร็จแล้วครับ! ❤️');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  // ✅ ฟังก์ชันสำหรับกดปิดทิ้ง (ไม่เอาตอนนี้)
  const handleDismiss = () => {
    localStorage.setItem('pwa_dismissed', 'true');
    setShouldHide(true);
  };

  // ถ้าลงทะเบียนแล้ว หรือ กดปิดทิ้งไปแล้ว ไม่ต้องแสดงปุ่ม
  if (shouldHide) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-rose-100 text-center max-w-sm w-full relative animate-in fade-in zoom-in duration-300">
        
        {/* ✅ ปุ่มกากบาทมุมขวาบน */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 transition-colors"
        >
          ✕
        </button>

        <div className="text-5xl mb-4">🔔</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">เปิดแจ้งเตือน</h2>
        <p className="text-slate-500 text-sm mb-6 font-bold px-2">
          เพื่อไม่ให้พลาดทุกคำขอและความคิดถึงจากคนรัก กดเปิดแจ้งเตือนไว้เครื่องจะได้เด้งบอกนะ!
        </p>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleSubscribe}
            className="w-full bg-rose-500 text-white py-4 rounded-2xl text-lg font-black shadow-lg hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            ตกลง เปิดแจ้งเตือน ✨
          </button>
          
          <button 
            onClick={handleDismiss}
            className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
          >
            ไว้ทีหลังนะ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAHandler;