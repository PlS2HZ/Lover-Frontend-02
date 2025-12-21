import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '', 
    password: ''
  });

  // ✨ คำนวณ API_URL ตามตำแหน่งที่รันแอป
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://lover-backend.onrender.com';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ส่งข้อมูล Login ไปที่ API
      const res = await axios.post(`${API_URL}/api/login`, formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('avatar_url', res.data.avatar_url || ''); 

      alert(`ยินดีต้อนรับคุณ ${res.data.username} ❤️`);
      window.location.href = "/"; 
    } catch (err) { 
      console.error("Login Error:", err);
      const msg = err.response?.data || 'ล็อกอินไม่สำเร็จ ตรวจสอบชื่อผู้ใช้ หรือรหัสผ่านอีกครั้ง';
      alert(msg); 
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-rose-100">
      <h2 className="text-3xl font-black text-rose-500 mb-6 text-center italic">LOGIN ❤️</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Username</label>
          <input 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold text-slate-700"
            placeholder="ชื่อผู้ใช้งาน" 
            type="text" 
            required 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
          <input 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold text-slate-700"
            placeholder="รหัสผ่าน" 
            type="password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>
        <button className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all text-lg mb-6 active:scale-95">
          SIGN IN
        </button>
      </form>
    </div>
  );
};

export default Login;