/* eslint-disable */
// ✅ โหลดไฟล์โค้ดที่เราก๊อปมาไว้ในโปรเจกต์
import './supabase-core.js'; 

const supabaseUrl = 'https://xqmvmryebvmyariewpvr.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbXZtcnllYnZteWFyaWV3cHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODIwOTcsImV4cCI6MjA4MTU1ODA5N30.xj8m6GZ6DrW5RCQM5fyCQekSbr2P46iBY1WuKQx9n-4';

// ✅ เรียกใช้ผ่านตัวแปร global 'supabase' ที่ถูกสร้างขึ้นจากไฟล์ supabase-core.js
// เราใช้ window.supabase เพราะไฟล์ UMD จะเอาตัวแปรไปฝากไว้ที่นั่นครับ
export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);