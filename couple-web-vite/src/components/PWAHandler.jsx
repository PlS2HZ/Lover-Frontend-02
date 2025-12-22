import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, BellOff, X } from 'lucide-react';

const PWAHandler = ({ isPopup = false }) => {
    const [status, setStatus] = useState(() => {
        if (!("Notification" in window)) return "ไม่รองรับ";
        return Notification.permission;
    });
    const [showPopup, setShowPopup] = useState(false);

    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    useEffect(() => {
        const dismissed = sessionStorage.getItem('pwa_dismissed');
        if (isPopup && status !== 'granted' && !dismissed) {
            // ✅ แก้ไข Error: ใช้ setTimeout เพื่อหลีกเลี่ยง cascading renders
            const timer = setTimeout(() => setShowPopup(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [status, isPopup]);

    const handleSubscribe = async () => {
        try {
            const permission = await Notification.requestPermission();
            setStatus(permission);
            if (permission === 'granted') {
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
                alert('เปิดการแจ้งเตือนสำเร็จ! ❤️');
                setShowPopup(false);
            }
        } catch (err) { 
          console.log("Error during subscription:", err);
          alert('เกิดข้อผิดพลาด'); 
        }
    };

    const handleUnsubscribe = async () => {
        if (window.confirm("คุณต้องการปิดการแจ้งเตือนบนเครื่องนี้ใช่หรือไม่?")) {
            try {
                // ✅ ส่งคำขอไปลบใน Backend ตามที่นายต้องการ
                await axios.post(`${API_URL}/api/unsubscribe`, { user_id: userId });
                setStatus('default');
                alert('ปิดการแจ้งเตือนเรียบร้อยแล้ว ✨');
            } catch (err) { 
              console.log("Error unsubscribing:", err);
              alert('ปิดไม่สำเร็จ'); 
            }
        }
    };

    const dismissPopup = () => {
        sessionStorage.setItem('pwa_dismissed', 'true'); 
        setShowPopup(false);
    };

    if (isPopup) {
        if (!showPopup) return null;
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-rose-100 p-5 animate-bounce-in">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-slate-700 flex items-center gap-2 uppercase italic text-sm">
                        <Bell className="text-rose-500 animate-swing" size={18}/> แจ้งเตือนบนอุปกรณ์
                    </h4>
                    <button onClick={dismissPopup} className="text-slate-300 hover:text-slate-500"><X size={20}/></button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed">
                    เปิดแจ้งเตือนเพื่อให้แอปแจ้งเวลาแฟนส่งคำขอหรือมีวันสำคัญนะครับ ✨
                </p>
                <div className="flex gap-2">
                    {/* ✅ ปุ่ม "ไว้ทีหลัง" */}
                    <button onClick={dismissPopup} className="flex-1 py-3 text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl transition-all active:scale-95">ไว้ทีหลัง</button>
                    {/* ✅ ปุ่ม "เปิดการใช้งาน" */}
                    <button onClick={handleSubscribe} className="flex-2 py-3 px-6 bg-rose-500 text-white text-[10px] font-black rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95">เปิดการใช้งาน</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className={`p-5 rounded-[2.5rem] border-2 transition-all ${status === 'granted' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="font-black text-slate-700 text-xs uppercase italic">การตั้งค่าแจ้งเตือน</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                            สถานะ: {status === 'granted' ? '● เปิดแจ้งเตือนแล้ว' : '○ ปิดอยู่'}
                        </p>
                    </div>
                    {status === 'granted' ? (
                        <button onClick={handleUnsubscribe} title="ปิดการแจ้งเตือน" className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm border border-rose-100 hover:bg-rose-50 transition-all active:scale-90">
                            <BellOff size={18} />
                        </button>
                    ) : (
                        <button onClick={handleSubscribe} className="px-6 py-3 bg-rose-500 text-white text-[10px] font-black rounded-2xl shadow-md active:scale-95 uppercase tracking-tighter">
                            เปิดแจ้งเตือน
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

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

export default PWAHandler;