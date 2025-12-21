import React, { useEffect } from 'react';
import axios from 'axios';

// ✅ ฟังก์ชันช่วยแปลงรหัสกุญแจ (ก๊อปไปวางได้เลย)
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
  const userId = localStorage.getItem('user_id');
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://lover-backend.onrender.com';

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // ✅ ลบ "reg =>" ออก เพราะเราไม่ได้ใช้ค่าของมันในบรรทัดนี้
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
      
      // 🔑 【 จุดที่ 1 】: นำ publicKey (ตัวอักษรยาวๆ) จากหน้าเว็บมาใส่ตรงนี้
      const publicKey = "BOkbnuWUKrV8BKHA5UkNQAovhejO3ANCGjrY2M86OsYZ_WHRZSYUAaeKvh0g6qr1WjI5pZdZ1PwCelM6_ReNbF0"; 

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // ✅ ส่งข้อมูลเครื่องไปเก็บในฐานข้อมูล (Backend)
      await axios.post(`${API_URL}/api/save-subscription`, {
        user_id: userId,
        subscription: subscription
      });

      alert('ลงทะเบียนแจ้งเตือนสำเร็จแล้วครับ! ❤️');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  return (
    <button 
      onClick={handleSubscribe}
      className="bg-rose-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-rose-600 transition-all animate-pulse"
    >
      🔔 เปิดแจ้งเตือนเข้ามือถือ
    </button>
  );
};

export default PWAHandler;