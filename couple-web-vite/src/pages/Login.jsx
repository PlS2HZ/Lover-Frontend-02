import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
  identifier: '', // เปลี่ยนชื่อจาก email
  password: ''
});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8080/api/login', formData);
      // เก็บข้อมูลสำคัญลงเครื่อง
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('email', res.data.email);
      alert(`ยินดีต้อนรับคุณ ${res.data.username} ❤️`);
      window.location.href = "/"; // รีโหลดหน้าเพื่อให้ Navbar อัปเดต
    } catch { alert('ล็อกอินไม่สำเร็จ ตรวจสอบข้อมูลอีกครั้ง'); }
  };

  // ในส่วนของ Input
<input 
  type="text" 
  placeholder="Username or Email" 
  value={formData.identifier}
  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
  required 
/>

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-rose-100">
      <h2 className="text-3xl font-black text-rose-500 mb-6 text-center italic">LOGIN ❤️</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold"
          placeholder="EMAIL" type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold"
          placeholder="PASSWORD" type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all text-lg mb-6">
  SIGN IN
</button>

<div className="relative flex py-4 items-center">
    <div className="flex-grow border-t border-slate-100"></div>
    <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold">OR</span>
    <div className="flex-grow border-t border-slate-100"></div>
</div>

<button 
  type="button"
  onClick={() => navigate('/register')}
  className="w-full bg-white border-2 border-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:border-rose-200 hover:text-rose-500 transition-all"
>
  CREATE NEW ACCOUNT ✨
</button>
            {/* <p className="text-center text-xs font-bold text-slate-400 mt-4 cursor-pointer hover:text-rose-400" 
            onClick={() => navigate('/register')}>ยังไม่มีบัญชี? สมัครสมาชิกที่นี่</p> */}
      </form>
    </div>
  );
};

export default Login;