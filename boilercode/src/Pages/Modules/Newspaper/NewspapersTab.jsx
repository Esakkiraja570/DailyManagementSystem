import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Trash2, Newspaper } from 'lucide-react';
import { npGet, npPost, npDelete } from './npApi';

const inp  = { width:'100%', height:40, padding:'0 12px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' };
const card = { background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.07)', marginBottom:16 };
const btn  = (bg='#2563eb',c='#fff') => ({ padding:'9px 18px', borderRadius:9, border:'none', background:bg, color:c, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 });

const NewspapersTab = ({ mobile, toast }) => {
  const [papers,   setPapers]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({ name:'', language:'', publisher:'', price:'', monthlyPrice:'', type:'Newspaper', deliveryTime:'', description:'' });

  const load = useCallback(async () => {
    try { setPapers(await npGet(`/newspapers/${mobile}`) || []); }
    catch(e) { console.error(e); }
  }, [mobile]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast('Name and price required');
    setLoading(true);
    try {
      await npPost('/newspapers', { ...form, price: Number(form.price), monthlyPrice: Number(form.monthlyPrice || 0), distributorMobile: mobile });
      toast('Newspaper added!', 'success');
      setShowForm(false);
      setForm({ name:'', language:'', publisher:'', price:'', monthlyPrice:'', type:'Newspaper', deliveryTime:'', description:'' });
      load();
    } catch(e) { toast(e.message, 'error'); }
    finally    { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this newspaper?')) return;
    try { await npDelete(`/newspapers/${id}`); toast('Deleted','success'); load(); }
    catch(e) { toast(e.message,'error'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0, fontWeight:800 }}>Newspapers & Products</h2>
          <p style={{ margin:0, color:'#64748b', fontSize:13 }}>{papers.length} items</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btn()}>
          <Plus size={16}/> Add Paper
        </button>
      </div>

      {showForm && (
        <div style={card}>
          <h4 style={{ margin:'0 0 14px', fontWeight:700 }}>Add Newspaper / Product</h4>
          <form onSubmit={submit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <input placeholder="Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp}/>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={inp}>
                <option>Newspaper</option>
                <option>Magazine</option>
                <option>Milk</option>
                <option>Other</option>
              </select>
              <input placeholder="Language (e.g. Tamil)" value={form.language} onChange={e=>setForm(p=>({...p,language:e.target.value}))} style={inp}/>
              <input placeholder="Publisher (e.g. The Hindu)" value={form.publisher} onChange={e=>setForm(p=>({...p,publisher:e.target.value}))} style={inp}/>
              <input type="number" placeholder="Daily Price (₹) *" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} style={inp}/>
              <input type="number" placeholder="Monthly Price (₹)" value={form.monthlyPrice} onChange={e=>setForm(p=>({...p,monthlyPrice:e.target.value}))} style={inp}/>
              <input placeholder="Delivery Time (e.g. 6:00 AM)" value={form.deliveryTime} onChange={e=>setForm(p=>({...p,deliveryTime:e.target.value}))} style={inp}/>
              <input placeholder="Description (optional)" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={inp}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" disabled={loading} style={btn()}>{loading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Plus size={15}/>} Save</button>
              <button type="button" onClick={() => setShowForm(false)} style={btn('#f1f5f9','#475569')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {papers.map(p => (
          <div key={p.id} style={{ ...card, marginBottom:0, position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#1e40af,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10 }}>
                <Newspaper size={20} color="#fff"/>
              </div>
              <button onClick={() => remove(p.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:4 }}>
                <Trash2 size={15}/>
              </button>
            </div>
            <div style={{ fontWeight:800, fontSize:15 }}>{p.name}</div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>{p.type} · {p.language} · {p.publisher}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:800, color:'#2563eb', fontSize:18 }}>₹{p.price}<span style={{ fontSize:11, fontWeight:500, color:'#94a3b8' }}>/day</span></span>
              {p.monthlyPrice > 0 && <span style={{ fontSize:12, color:'#10b981', fontWeight:700 }}>₹{p.monthlyPrice}/mo</span>}
            </div>
            {p.deliveryTime && <div style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>🕐 {p.deliveryTime}</div>}
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:p.status==='ACTIVE'?'#dcfce7':'#f1f5f9', color:p.status==='ACTIVE'?'#166534':'#64748b', display:'inline-block', marginTop:8 }}>
              {p.status || 'ACTIVE'}
            </span>
          </div>
        ))}
      </div>

      {papers.length === 0 && !showForm && (
        <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
          <Newspaper size={40} style={{ marginBottom:12, opacity:.4 }}/>
          <p style={{ fontWeight:600 }}>No newspapers added yet.</p>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default NewspapersTab;
