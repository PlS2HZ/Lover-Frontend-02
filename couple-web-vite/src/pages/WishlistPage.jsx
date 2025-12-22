import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Gift, Plus, ExternalLink, CheckCircle, X } from 'lucide-react';

const WishlistPage = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', desc: '', url: '' });
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // ✅ เพิ่มเลือกแฟน
    const [visibleTo, setVisibleTo] = useState([]);
    
    const userId = localStorage.getItem('user_id');
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    const fetchData = useCallback(async () => {
        try {
            const [itemRes, userRes] = await Promise.all([
                axios.get(`${API_URL}/api/wishlist/get`),
                axios.get(`${API_URL}/api/users`)
            ]);
            setItems(itemRes.data || []);
            setUsers(userRes.data.filter(u => u.id !== userId)); // แสดงเฉพาะแฟน
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [API_URL, userId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = async () => {
        if (!newItem.name.trim()) return;
        if (visibleTo.length === 0) return alert("เลือกคนที่จะแจ้งเตือนก่อนครับ");
        try {
            await axios.post(`${API_URL}/api/wishlist/save`, {
                user_id: userId,
                item_name: newItem.name,
                item_url: newItem.url,
                visible_to: visibleTo // ✅ ส่งรายชื่อแฟน
            });
            setNewItem({ name: '', desc: '', url: '' });
            setShowAdd(false);
            fetchData();
        } catch (err) { 
            console.error("Add wishlist error:", err);
            alert("เพิ่มไม่สำเร็จ"); }
    };

    const handleComplete = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/wishlist/complete?id=${id}`);
            fetchData();
        } catch (err) { 
            console.error("Complete wishlist error:", err);
            alert("อัปเดตไม่สำเร็จ"); }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 pb-24">
            <div className="max-w-md mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-700 italic uppercase">Wishlist</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ของที่อยากได้ ✨</p>
                    </div>
                    <button onClick={() => setShowAdd(!showAdd)} className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${showAdd ? 'bg-slate-200' : 'bg-rose-500 text-white shadow-rose-100'}`}>
                        {showAdd ? <X size={20} /> : <Plus size={20} />}
                    </button>
                </header>

                {showAdd && (
                    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-rose-100 space-y-4 shadow-xl">
                        <input className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:border-rose-300 outline-none" placeholder="ชื่อของที่อยากได้..." value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        <input className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:border-rose-300 outline-none" placeholder="ลิงก์สินค้า (ถ้ามี)..." value={newItem.url} onChange={e => setNewItem({...newItem, url: e.target.value})} />
                        
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase italic ml-2">แจ้งเตือนถึงใคร? (แฟน)</p>
                            <div className="flex flex-wrap gap-2">
                                {users.map(u => (
                                    <button key={u.id} onClick={() => setVisibleTo(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                        className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${visibleTo.includes(u.id) ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                                        @{u.username}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleAdd} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs shadow-md shadow-rose-200">เพิ่มลงรายการ ✨</button>
                    </div>
                )}

                <div className="grid gap-4">
                    {loading ? <div className="text-center py-10 text-slate-300 animate-pulse">โหลดรายการ...</div> :
                    items.map((item) => (
                        <div key={item.id} className={`p-5 rounded-[2.5rem] border-2 flex items-center gap-4 transition-all ${item.is_received ? 'bg-emerald-50 border-emerald-100 opacity-60 shadow-inner' : 'bg-white border-white shadow-sm'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.is_received ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}><Gift size={24} /></div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-black uppercase ${item.is_received ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.item_name}</h3>
                                {item.item_url && <a href={item.item_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-rose-400 flex items-center gap-1 mt-1 hover:underline"><ExternalLink size={10}/> รายละเอียด</a>}
                            </div>
                            {!item.is_received && <button onClick={() => handleComplete(item.id)} className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:text-emerald-500 active:scale-90 transition-all"><CheckCircle size={20} /></button>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default WishlistPage;