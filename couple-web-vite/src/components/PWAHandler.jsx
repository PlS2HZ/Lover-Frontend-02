// src/components/PWAHandler.jsx
import React, { useState } from 'react';
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
    const [status, setStatus] = useState(() => {
        if (!("Notification" in window)) return "ไม่รองรับ";
        return Notification.permission;
    });

    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'https://lover-backend.onrender.com';

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

                localStorage.setItem('pwa_subscribed', 'true');
                alert('เย้! เปิดการแจ้งเตือนสำเร็จแล้วครับ ❤️');
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    return (
        <div className="p-5 bg-rose-50/60 rounded-[2.5rem] border-2 border-rose-100 shadow-sm mt-2 transition-all">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left space-y-1">
                    <p className="font-black text-slate-700 text-sm uppercase italic tracking-wider">การแจ้งเตือนบนอุปกรณ์</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className={`w-3 h-3 rounded-full ${status === 'granted' ? 'bg-emerald-500' : 'bg-rose-400 animate-pulse'}`}></span>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                            สถานะ: {status === 'granted' ? 'อนุญาตแล้ว' : status === 'denied' ? 'ถูกปฏิเสธ' : 'ยังไม่ได้ตั้งค่า'}
                        </p>
                    </div>
                </div>
                
                {/* ✅ ปุ่มใหม่ที่เด่นกว่าเดิม */}
                <button 
                    onClick={handleSubscribe}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                        ${status === 'granted' 
                            ? 'bg-white text-emerald-600 border-2 border-emerald-100' 
                            : 'bg-rose-500 text-white hover:bg-rose-600 animate-bounce'}`}
                >
                    {status === 'granted' ? '✓ เปิดใช้งานแล้ว' : '🔔 คลิกเพื่อเปิดตอนนี้! ✨'}
                </button>
            </div>
            {status !== 'granted' && (
                <p className="text-[9px] text-rose-400 mt-4 font-bold italic text-center leading-relaxed">
                    * จำเป็นต้องเปิดเพื่อให้แอปแจ้งเตือนเวลาแฟนส่งคำขอหรือมีนัดหมายสำคัญครับ
                </p>
            )}
        </div>
    );
};

export default PWAHandler;