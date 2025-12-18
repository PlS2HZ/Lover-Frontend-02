import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://lover-backend.onrender.com/api/register', formData);
      alert('สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน');
      navigate('/login');
    } catch { alert('อีเมลนี้อาจถูกใช้งานแล้ว หรือเซิร์ฟเวอร์มีปัญหา'); }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-rose-100">
      <h2 className="text-3xl font-black text-rose-500 mb-6 text-center italic">JOIN US ✨</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold"
          placeholder="EMAIL" type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold"
          placeholder="USERNAME" type="text" required onChange={(e) => setFormData({...formData, username: e.target.value})} />
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-rose-400 border border-slate-100 font-bold"
          placeholder="PASSWORD" type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-rose-600 transition-all">SIGN UP</button>
      </form>
    </div>
  );
};

export default Register;