import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, BellOff, X } from 'lucide-react';

const PWAHandler = ({ isPopup = false }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [isSubscribedInDB, setIsSubscribedInDB] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    const checkDBStatus = async () => {
        if (!userId) { setIsLoading(false); return false; }
        try {
            const res = await axios.get(`${API_URL}/api/check-subscription?user_id=${userId}`);
            const isSub = res.data.subscribed;
            setIsSubscribedInDB(isSub);
            setIsLoading(false);
            return isSub;
        } catch (err) {
            console.error("PWA Subscription Check Error:", err);
            setIsLoading(false);
            return false;
        }
    };

    useEffect(() => {
        const init = async () => {
            const subscribed = await checkDBStatus();
            const dismissed = sessionStorage.getItem('pwa_dismissed');
            
            // ✅ ใช้สถานะจาก DB (subscribed) แทน status เดิมที่ Error ครับ
            if (isPopup && !subscribed && !dismissed) {
                const timer = setTimeout(() => setShowPopup(true), 1500);
                return () => clearTimeout(timer);
            }
        };
        init();
        
        const syncListener = () => checkDBStatus();
        window.addEventListener('pwa_sync', syncListener);
        return () => window.removeEventListener('pwa_sync', syncListener);
    }, [isPopup, userId]);

    const handleSubscribe = async () => {
        try {
            const permission = await Notification.requestPermission();
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
                
                setIsSubscribedInDB(true);
                setShowPopup(false); 
                window.dispatchEvent(new Event('pwa_sync')); 
                alert('เปิดการแจ้งเตือนสำเร็จ! ❤️');
            } else {
                alert('โปรดอนุญาตสิทธิ์การแจ้งเตือนในตั้งค่าเบราว์เซอร์ด้วยนะ');
            }
        } catch (err) { 
          console.error("PWA Subscription Error:", err);
          alert('เกิดข้อผิดพลาดในการเปิดใช้งาน'); }
    };

    const handleUnsubscribe = async () => {
        if (window.confirm("คุณต้องการปิดการแจ้งเตือนบนเครื่องนี้ใช่หรือไม่?")) {
            try {
                await axios.post(`${API_URL}/api/unsubscribe`, { user_id: userId });
                setIsSubscribedInDB(false);
                window.dispatchEvent(new Event('pwa_sync')); 
                alert('ปิดการแจ้งเตือนเรียบร้อยแล้ว ✨');
            } catch (err) { 
          console.error("PWA Unsubscribe Error:", err);
              alert('ปิดไม่สำเร็จ'); }
        }
    };

    const dismissPopup = () => {
        sessionStorage.setItem('pwa_dismissed', 'true'); 
        setShowPopup(false);
    };

    if (isLoading) return null;

    if (isPopup) {
        if (!showPopup || isSubscribedInDB) return null;
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-rose-100 p-5 animate-bounce-in">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-slate-700 flex items-center gap-2 uppercase italic text-sm">
                        <Bell className="text-rose-500 animate-swing" size={18}/> แจ้งเตือนบนอุปกรณ์
                    </h4>
                    <button onClick={dismissPopup} className="text-slate-300 hover:text-slate-500"><X size={20}/></button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-4">เปิดแจ้งเตือนเพื่อให้แอปแจ้งเวลาแฟนส่งคำขอหรือมีวันสำคัญนะครับ ✨</p>
                <div className="flex gap-2">
                    <button onClick={dismissPopup} className="flex-1 py-3 text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl">ไว้ทีหลัง</button>
                    <button onClick={handleSubscribe} className="flex-2 py-3 px-6 bg-rose-500 text-white text-[10px] font-black rounded-2xl shadow-lg">เปิดการใช้งาน</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-5 rounded-[2.5rem] border-2 transition-all ${isSubscribedInDB ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="font-black text-slate-700 text-xs uppercase italic">การตั้งค่าแจ้งเตือน</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                        สถานะ: {isSubscribedInDB ? '● เปิดแจ้งเตือนแล้ว' : '○ ปิดอยู่'}
                    </p>
                </div>
                {isSubscribedInDB ? (
                    <button onClick={handleUnsubscribe} className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm border border-rose-100 active:scale-90 transition-all"><BellOff size={18} /></button>
                ) : (
                    <button onClick={handleSubscribe} className="px-6 py-3 bg-rose-500 text-white text-[10px] font-black rounded-2xl shadow-md active:scale-95">เปิดแจ้งเตือน</button>
                )}
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