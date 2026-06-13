import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar, PauseCircle, PlayCircle } from 'lucide-react';
import { npGet, npPut } from './npApi';

const inp  = { width:'100%', height:40, padding:'0 12px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' };
const card = { background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.07)', marginBottom:16 };
const btn  = (bg='#2563eb',c='#fff') => ({ padding:'9px 18px', borderRadius:9, border:'none', background:bg, color:c, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 });

const BillingTab = ({ mobile, toast }) => {
  const [customers,  setCustomers]  = useState([]);
  const [newspapers, setNewspapers] = useState([]);
  const [billing,    setBilling]    = useState(null);
  const [selCust,    setSelCust]    = useState('');
  const [pauseForm,  setPauseForm]  = useState({ start:'', end:'' });
  const [showPause,  setShowPause]  = useState(false);
  const [loading,    setLoading]    = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, n] = await Promise.all([npGet(`/customers/${mobile}`), npGet(`/newspapers/${mobile}`)]);
      setCustomers(c || []);
      setNewspapers(n || []);
    } catch(e) { console.error(e); }
  }, [mobile]);

  useEffect(() => { load(); }, [load]);

  const calcBilling = async () => {
    if (!selCust) return toast('Select a customer');
    setLoading(true);
    try {
      const res = await npGet(`/billing/${selCust}`);
      setBilling(res);
    } catch(e) { toast(e.message, 'error'); }
    finally    { setLoading(false); }
  };

  const pauseCustomer = async () => {
    if (!selCust || !pauseForm.start || !pauseForm.end) return toast('Select customer and dates');
    setLoading(true);
    try {
      await npPut(`/customers/${selCust}/pause`, pauseForm);
      toast('Paper paused for break days!', 'success');
      setShowPause(false);
      setBilling(null);
    } catch(e) { toast(e.message, 'error'); }
    finally    { setLoading(false); }
  };

  const resumeCustomer = async () => {
    if (!selCust) return toast('Select a customer');
    setLoading(true);
    try {
      await npPut(`/customers/${selCust}/resume`, {});
      toast('Paper resumed!', 'success');
      setBilling(null);
    } catch(e) { toast(e.message, 'error'); }
    finally    { setLoading(false); }
  };

  const selectedCust = customers.find(c => String(c.id) === String(selCust));

  // Find this customer's newspaper
  const custPaper = newspapers.find(n => String(n.id) === String(selectedCust?.newspaperId));

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ margin:0, fontWeight:800 }}>Monthly Billing</h2>
        <p style={{ margin:0, color:'#64748b', fontSize:13 }}>
          Formula: (Month Days − Break Days) × Paper Rate × Quantity
        </p>
      </div>

      {/* Customer Selector */}
      <div style={card}>
        <h4 style={{ margin:'0 0 12px', fontWeight:700 }}>Select Customer</h4>
        <div style={{ display:'flex', gap:10 }}>
          <select value={selCust} onChange={e => { setSelCust(e.target.value); setBilling(null); }} style={{ ...inp, flex:1 }}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.mobile}) – {c.routeName || 'General'}</option>
            ))}
          </select>
          <button onClick={calcBilling} disabled={loading} style={btn()}>
            {loading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Calendar size={15}/>} Calculate Bill
          </button>
        </div>

        {selectedCust && (
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => setShowPause(!showPause)} style={btn('#f59e0b','#fff')}>
              <PauseCircle size={15}/> Set Break Days
            </button>
            <button onClick={resumeCustomer} style={btn('#10b981','#fff')}>
              <PlayCircle size={15}/> Resume Paper
            </button>
          </div>
        )}

        {showPause && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10, marginTop:12, alignItems:'end' }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'#64748b', display:'block', marginBottom:4 }}>BREAK START DATE</label>
              <input type="date" value={pauseForm.start} onChange={e => setPauseForm(p => ({...p, start:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'#64748b', display:'block', marginBottom:4 }}>BREAK END DATE</label>
              <input type="date" value={pauseForm.end} onChange={e => setPauseForm(p => ({...p, end:e.target.value}))} style={inp}/>
            </div>
            <button onClick={pauseCustomer} style={btn('#f59e0b')}>Save Break</button>
          </div>
        )}
      </div>

      {/* Billing Result */}
      {billing && (
        <div style={card}>
          <h4 style={{ margin:'0 0 16px', fontWeight:800, fontSize:17 }}>
            📋 Bill for {billing.customerName}
          </h4>

          {custPaper && (
            <div style={{ background:'#eff6ff', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13 }}>
              <strong>{custPaper.name}</strong> · ₹{custPaper.price}/day · Qty: {selectedCust?.quantity || 1}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
            {[
              ['Total Month Days', billing.monthDays, '#2563eb'],
              ['Break Days', billing.breakDays, '#f59e0b'],
              ['Active Days', billing.activeDays, '#10b981'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background:'#f8fafc', borderRadius:12, padding:14, textAlign:'center' }}>
                <div style={{ fontSize:26, fontWeight:900, color }}>{val}</div>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius:12, padding:'16px 20px', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, opacity:.8 }}>Monthly Amount</div>
              <div style={{ fontSize:11, opacity:.6 }}>
                {billing.activeDays} days × rate × qty
              </div>
            </div>
            <div style={{ fontSize:32, fontWeight:900 }}>₹{billing.monthlyAmount?.toFixed(0)}</div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default BillingTab;
