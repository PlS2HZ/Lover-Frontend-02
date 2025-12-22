import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Gift, Plus, ExternalLink, CheckCircle, X, Trash2 } from 'lucide-react';

const WishlistPage = () => {
    const MY_ID = "d8eb372a-d196-44fc-a73b-1809f27e0a56";
    const LOVER_ID = "f384c03a-55bb-4d5f-b3f5-4f2052a9d00e";
    const loverMapping = { [MY_ID]: LOVER_ID, [LOVER_ID]: MY_ID };

    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', desc: '', url: '' });
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const userId = localStorage.getItem('user_id');
    // ✅ ตั้งค่าเริ่มต้นโดยตรง ไม่ต้องเรียกผ่าน useEffect เพื่อเลี่ยง Cascading Renders
    const [visibleTo] = useState(() => loverMapping[userId] ? [loverMapping[userId]] : []);
    
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' : 'https://lover-backend.onrender.com';

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/wishlist/get`);
            setItems(res.data || []);
        } catch (err) {
            console.error("Fetch wishlist error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = async () => {
        if (!newItem.name.trim()) return;
        try {
            await axios.post(`${API_URL}/api/wishlist/save`, {
                user_id: userId,
                item_name: newItem.name,
                item_description: newItem.desc,
                item_url: newItem.url,
                visible_to: visibleTo
            });
            setNewItem({ name: '', desc: '', url: '' });
            setShowAdd(false);
            fetchData();
        } catch (err) { 
            console.log("Add Error:", err);
            alert("เพิ่มไม่สำเร็จ"); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("ลบรายการนี้ใช่ไหมครับ?")) return;
        try {
            await axios.delete(`${API_URL}/api/wishlist/delete?id=${id}`);
            fetchData();
        } catch (err) { 
            console.log("Delete Error:", err);
            alert("ลบไม่สำเร็จ"); 
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/wishlist/complete?id=${id}`);
            fetchData();
        } catch (err) { 
            console.log("Update Error:", err);
            alert("อัปเดตไม่สำเร็จ"); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 pb-24 font-bold">
            <div className="max-w-md mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-700 italic uppercase">Wishlist</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">ของที่อยากได้ ✨</p>
                    </div>
                    <button onClick={() => setShowAdd(!showAdd)} className={`p-3 rounded-2xl shadow-lg transition-all ${showAdd ? 'bg-slate-200' : 'bg-rose-500 text-white shadow-rose-100'}`}>
                        {showAdd ? <X size={20} /> : <Plus size={20} />}
                    </button>
                </header>

                {showAdd && (
                    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-rose-100 space-y-4 shadow-xl">
                        <input className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:border-rose-300 outline-none" placeholder="ชื่อของ..." value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:border-rose-300 outline-none h-20 resize-none font-bold" placeholder="รายละเอียด..." value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} />
                        <input className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:border-rose-300 outline-none" placeholder="ลิงก์สินค้า..." value={newItem.url} onChange={e => setNewItem({...newItem, url: e.target.value})} />
                        <button onClick={handleAdd} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs">เพิ่มลงรายการ ✨</button>
                    </div>
                )}

                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-10 text-slate-300 animate-pulse uppercase text-[10px]">กำลังโหลดรายการ...</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className={`p-5 rounded-[2.5rem] border-2 flex items-center gap-4 ${item.is_received ? 'bg-emerald-50 border-emerald-100 opacity-60 shadow-inner' : 'bg-white border-white shadow-sm'}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.is_received ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}><Gift size={24} /></div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-black uppercase text-slate-700">{item.item_name}</h3>
                                    <p className="text-[10px] text-slate-400 italic line-clamp-1">{item.item_description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.user_id === userId && (
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                                    )}
                                    {!item.is_received && (
                                        <button onClick={() => handleComplete(item.id)} className="p-2 text-slate-300 hover:text-emerald-500"><CheckCircle size={20}/></button>
                                    )}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};
export default WishlistPage;