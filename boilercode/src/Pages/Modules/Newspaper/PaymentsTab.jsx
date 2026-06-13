import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { npGet, npPost } from './npApi';

const inp  = { width:'100%', height:40, padding:'0 12px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' };
const card = { background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.07)', marginBottom:16 };
const btn  = (bg='#2563eb',c='#fff') => ({ padding:'9px 18px', borderRadius:9, border:'none', background:bg, color:c, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 });

const PaymentsTab = ({ mobile, toast }) => {
  const [customers, setCustomers] = useState([]);
  const [history,   setHistory]   = useState([]);
  const [selCust,   setSelCust]   = useState('');
  const [amount,    setAmount]    = useState('');
  const [loading,   setLoading]   = useState(false);

  const load = useCallback(async () => {
    try { setCustomers(await npGet(`/customers/${mobile}`) || []); }
    catch(e) { console.error(e); }
  }, [mobile]);

  useEffect(() => { load(); }, [load]);

  const loadHistory = async (id) => {
    if (!id) return;
    try { setHistory(await npGet(`/payments/${id}`) || []); }
    catch(e) { setHistory([]); }
  };

  const recordPayment = async () => {
    if (!selCust || !amount) return toast('Select customer and enter amount');
    setLoading(true);
    try {
      await npPost('/payments', { customerId: Number(selCust), amount: Number(amount), distributorMobile: mobile });
      toast('Payment recorded!', 'success');
      setAmount('');
      loadHistory(selCust);
    } catch(e) { toast(e.message, 'error'); }
    finally    { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ margin:0, fontWeight:800 }}>Payments</h2>
        <p style={{ margin:0, color:'#64748b', fontSize:13 }}>Record and view payment history</p>
      </div>

      <div style={card}>
        <h4 style={{ margin:'0 0 12px', fontWeight:700 }}>Record Payment</h4>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:10, alignItems:'end' }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#64748b', display:'block', marginBottom:4 }}>CUSTOMER</label>
            <select value={selCust} onChange={e => { setSelCust(e.target.value); loadHistory(e.target.value); }} style={inp}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#64748b', display:'block', marginBottom:4 }}>AMOUNT (₹)</label>
            <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" style={inp}/>
          </div>
          <button onClick={recordPayment} disabled={loading} style={{ ...btn(), height:40 }}>
            {loading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <CheckCircle size={15}/>} Pay
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div style={card}>
          <h4 style={{ margin:'0 0 12px', fontWeight:700 }}>Payment History – {customers.find(c=>String(c.id)===String(selCust))?.name}</h4>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #f1f5f9', textAlign:'left' }}>
                <th style={{ padding:'8px 10px', color:'#64748b', fontWeight:700 }}>DATE</th>
                <th style={{ padding:'8px 10px', color:'#64748b', fontWeight:700 }}>AMOUNT</th>
                <th style={{ padding:'8px 10px', color:'#64748b', fontWeight:700 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p, i) => (
                <tr key={p.id || i} style={{ borderBottom:'1px solid #f8fafc' }}>
                  <td style={{ padding:'10px 10px' }}>{p.paymentDate}</td>
                  <td style={{ padding:'10px 10px', fontWeight:700, color:'#10b981' }}>₹{p.amount}</td>
                  <td style={{ padding:'10px 10px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700, background:'#dcfce7', color:'#166534' }}>
                      {p.status || 'PAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selCust && history.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
          <CreditCard size={36} style={{ marginBottom:10, opacity:.4 }}/>
          <p style={{ fontWeight:600 }}>No payment history for this customer.</p>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default PaymentsTab;
