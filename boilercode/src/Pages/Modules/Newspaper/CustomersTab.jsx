import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper, Users, BookOpen, FileText, CreditCard,
  LogOut, Loader2, Plus, Edit2, Trash2, ChevronRight,
  AlertCircle, TrendingUp, Phone, MapPin, Calendar
} from 'lucide-react';
import { npGet, npPost, npPut, npDelete, getMobile } from './npApi';

// ── styles ────────────────────────────────────────────────────
const card  = { background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.07)', marginBottom:16 };
const inp   = { width:'100%', height:40, padding:'0 12px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' };
const btn   = (bg='#2563eb',c='#fff') => ({ padding:'9px 18px', borderRadius:9, border:'none', background:bg, color:c, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 });
const badge = (c) => ({ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:c==='ACTIVE'?'#dcfce7':c==='PAUSED'?'#fef9c3':'#f1f5f9', color:c==='ACTIVE'?'#166534':c==='PAUSED'?'#854d0e':'#475569' });

// ── Customers Tab ─────────────────────────────────────────────
const CustomersTab = ({ mobile, toast }) => {
  const [customers, setCustomers] = useState([]);
  const [newspapers, setNewspapers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', mobile:'', address:'', routeName:'', routeOrder:'', newspaperId:'', quantity:1 });

  const load = useCallback(async () => {
    try {
      const [c, n] = await Promise.all([
        npGet(`/customers/${mobile}`),
        npGet(`/newspapers/${mobile}`)
      ]);
      setCustomers(c || []);
      setNewspapers(n || []);
    } catch(e) { console.error(e); }
  }, [mobile]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || form.mobile.length !== 10) return toast('Enter valid customer name and mobile');
    setLoading(true);
    try {
      await npPost('/customers', { ...form, distributorMobile: mobile, quantity: Number(form.quantity), routeOrder: Number(form.routeOrder) });
      toast('Customer added!', 'success');
      setShowForm(false);
      setForm({ name:'', mobile:'', address:'', routeName:'', routeOrder:'', newspaperId:'', quantity:1 });
      load();
    } catch(e) { toast(e.message, 'error'); }
    finally    { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await npDelete(`/customers/${id}`); toast('Deleted', 'success'); load(); }
    catch(e) { toast(e.message, 'error'); }
  };

  // Group by route
  const routes = [...new Set(customers.map(c => c.routeName || 'General'))].sort();

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0, fontWeight:800 }}>Customers</h2>
          <p style={{ margin:0, color:'#64748b', fontSize:13 }}>{customers.length} registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btn()}>
          <Plus size={16}/> Add Customer
        </button>
      </div>

      {showForm && (
        <div style={card}>
          <h4 style={{ margin:'0 0 14px', fontWeight:700 }}>New Customer</h4>
          <form onSubmit={submit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <input placeholder="Customer Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp}/>
              <input placeholder="Mobile (10 digits) *" maxLength={10} value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value.replace(/\D/g,'')}))} style={inp}/>
              <input placeholder="Address" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} style={inp}/>
              <input placeholder="Route Name (e.g. Route A)" value={form.routeName} onChange={e=>setForm(p=>({...p,routeName:e.target.value}))} style={inp}/>
              <input type="number" placeholder="Route Order (1,2,3...)" value={form.routeOrder} onChange={e=>setForm(p=>({...p,routeOrder:e.target.value}))} style={inp}/>
              <input type="number" min={1} placeholder="Quantity" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} style={inp}/>
              <select value={form.newspaperId} onChange={e=>setForm(p=>({...p,newspaperId:e.target.value}))} style={inp}>
                <option value="">Select Newspaper (optional)</option>
                {newspapers.map(n => <option key={n.id} value={n.id}>{n.name} – ₹{n.price}/day</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button type="submit" disabled={loading} style={btn()}>{loading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Plus size={15}/>} Save</button>
              <button type="button" onClick={() => setShowForm(false)} style={btn('#f1f5f9','#475569')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {routes.map(route => (
        <div key={route} style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <MapPin size={16} color="#2563eb"/>
            <span style={{ fontWeight:700, fontSize:15, color:'#1e40af' }}>Route: {route}</span>
            <span style={{ fontSize:12, color:'#64748b' }}>({customers.filter(c=>(c.routeName||'General')===route).length} customers)</span>
          </div>
          {customers
            .filter(c => (c.routeName || 'General') === route)
            .sort((a,b) => (a.routeOrder||0) - (b.routeOrder||0))
            .map((c, idx) => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background: idx%2===0 ? '#f8fafc' : '#fff', borderRadius:8, marginBottom:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)', color:'#fff', fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {idx+1}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{c.mobile} · {c.address || 'No address'}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={badge(c.active !== false ? 'ACTIVE' : 'INACTIVE')}>
                    {c.active !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <button onClick={() => remove(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            ))}
        </div>
      ))}

      {customers.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
          <Users size={40} style={{ marginBottom:12, opacity:.4 }}/>
          <p style={{ fontWeight:600 }}>No customers yet. Add your first customer!</p>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
