/* eslint-disable */
// 1. นำเข้าไฟล์ Library ที่เราก๊อปมาไว้ในเครื่อง
import './supabase-core.js'; 

const supabaseUrl = 'https://xqmvmryebvmyariewpvr.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbXZtcnllYnZteWFyaWV3cHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODIwOTcsImV4cCI6MjA4MTU1ODA5N30.xj8m6GZ6DrW5RCQM5fyCQekSbr2P46iBY1WuKQx9n-4';

// 2. สร้างฟังก์ชันช่วยตรวจสอบว่า window.supabase พร้อมใช้งานหรือยัง
const getSupabase = () => {
    if (typeof window !== 'undefined' && window.supabase) {
        return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }
    // ถ้ายังไม่พร้อม (มักเกิดตอน Build หรือโหลดหน้าแรกบน Vercel) 
    // ให้คืนค่า Object เปล่าที่มีฟังก์ชันหลอกๆ ไว้ก่อนเพื่อไม่ให้หน้าจอขาว
    return {
        from: () => ({ select: () => ({ eq: () => ({ executeTo: () => [] }) }) }),
        auth: {}
    };
};

export const supabase = getSupabase();