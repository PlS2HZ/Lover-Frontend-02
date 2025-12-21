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
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('pwa_subscribed') === 'true';
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
        alert('นายต้องอนุญาตการแจ้งเตือนก่อนนะ!');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // 🔑 ใส่ Public Key ของนายตรงนี้
      const publicKey = "BOkbnuWUKrV8BKHA5UkNQAovhejO3ANCGjrY2M86OsYZ_WHRZSYUAaeKvh0g6qr1WjI5pZdZ1PwCelM6_ReNbF0"; 

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await axios.post(`${API_URL}/api/save-subscription`, {
        user_id: userId,
        subscription: subscription
      });

      // เซฟสถานะลงเครื่อง และซ่อนปุ่ม
      localStorage.setItem('pwa_subscribed', 'true');
      setIsSubscribed(true);
      alert('ลงทะเบียนแจ้งเตือนสำเร็จแล้วครับ! ❤️');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  // ถ้าลงทะเบียนแล้ว ไม่ต้องแสดงปุ่ม
  if (isSubscribed) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-rose-100 text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
        <div className="text-5xl mb-4">🔔</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">เปิดแจ้งเตือน</h2>
        <p className="text-slate-500 text-sm mb-6 font-bold">เพื่อไม่ให้พลาดทุกคำขอและความคิดถึงจากคนรัก กดปุ่มด้านล่างเพื่อรับแจ้งเตือนเข้ามือถือนะ!</p>
        <button 
          onClick={handleSubscribe}
          className="w-full bg-rose-500 text-white py-4 rounded-2xl text-lg font-black shadow-lg hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          ตกลง เปิดแจ้งเตือน ✨
        </button>
      </div>
    </div>
  );
};

export default PWAHandler;