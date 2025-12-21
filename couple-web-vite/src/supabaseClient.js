/* eslint-disable */
import './supabase-core.js'; 

const supabaseUrl = 'https://xqmvmryebvmyariewpvr.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbXZtcnllYnZteWFyaWV3cHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODIwOTcsImV4cCI6MjA4MTU1ODA5N30.xj8m6GZ6DrW5RCQM5fyCQekSbr2P46iBY1WuKQx9n-4';

const getSupabase = () => {
    if (typeof window !== 'undefined' && window.supabase) {
        return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }

    // ✨ สร้าง Mock Object ที่สมบูรณ์ขึ้น เพื่อไม่ให้หน้า Create/Profile พัง
    const mockStorage = {
        from: () => ({
            upload: async () => ({ data: null, error: new Error("Supabase library is still loading...") }),
            getPublicUrl: () => ({ data: { publicUrl: "" } })
        })
    };

    return {
        from: () => ({
            select: () => ({ eq: () => ({ executeTo: () => [] }) }),
            insert: () => ({ execute: () => ({ error: null }) }),
            update: () => ({ eq: () => ({ execute: () => ({ error: null }) }) })
        }),
        storage: mockStorage, // ✅ เพิ่มส่วนนี้เพื่อให้หน้า Create เรียก .storage.from() ได้
        auth: {}
    };
};

export const supabase = getSupabase();