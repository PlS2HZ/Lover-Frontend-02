import React, { useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '', // รองรับทั้ง Email หรือ Username
    password: ''
  });
  // const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // *** เปลี่ยน URL ตรงนี้เป็นของ Render ของคุณ ***
      const res = await axios.post('https://lover-backend.onrender.com/api/login', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('email', res.data.email);

      alert(`ยินดีต้อนรับคุณ ${res.data.username} ❤️`);
      window.location.href = "/"; 
    } catch { 
      alert('ล็อกอินไม่สำเร็จ ตรวจสอบ Username/Email หรือ Password อีกครั้ง'); 
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-rose-100">
      <h2 className="text-3xl font-black text-rose-500 mb-6 text-center italic">LOGIN ❤️</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        {/* เปลี่ยนจาก email เป็น text และใช้ identifier */}
        <input 
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold text-slate-700"
          placeholder="USERNAME OR EMAIL" 
          type="text" 
          required 
          value={formData.identifier}
          onChange={(e) => setFormData({...formData, identifier: e.target.value})} 
        />
        <input 
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold text-slate-700"
          placeholder="PASSWORD" 
          type="password" 
          required 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
        />
        <button className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all text-lg mb-6 active:scale-95">
          SIGN IN
        </button>

        {/* <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold">OR</span>
            <div className="flex-grow border-t border-slate-100"></div>
        </div> */}

        {/* <button 
          type="button"
          onClick={() => navigate('/register')}
          className="w-full bg-white border-2 border-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:border-rose-200 hover:text-rose-500 transition-all active:scale-95"
        >
          CREATE NEW ACCOUNT ✨
        </button> */}
      </form>
    </div>
  );
};

export default Login;