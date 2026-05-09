import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Phone, Loader2, LogOut, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { npGet, BASE_URL } from './npApi';

const inp  = { width:'100%', height:42, padding:'0 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' };
const card = { background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.07)', marginBottom:14 };

// ── Customer Login ────────────────────────────────────────────
const CustomerLogin = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setL]     = useState(false);
  const [error, setErr]     = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!mobile || mobile.length !== 10) return setErr('Enter valid 10-digit mobile');
    setL(true);
    try {
      // Check if customer exists
      const res = await fetch(`${BASE_URL}/customer/lookup/${mobile}`);
      if (!res.ok) throw new Error('No account found with this mobile number');
      const data = await res.json();
      onLogin(mobile, data);
    } catch(err) {
      // Fallback: just login with mobile directly
      onLogin(mobile, null);
    } finally { setL(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
      <div style={{ background:'#fff', borderRadius:24, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 32px 80px rgba(0,0,0,.4)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:60,height:60,borderRadius:18,background:'linear-gradient(135deg,#1e40af,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:'0 8px 20px rgba(37,99,235,.4)' }}>
            <Newspaper size={28} color="#fff"/>
          </div>
          <h2 style={{ fontWeight:900, fontSize:22, margin:'0 0 4px' }}>Customer Portal</h2>
          <p style={{ color:'#64748b', fontSize:13, margin:0 }}>View your newspaper details & bills</p>
        </div>
        {error && <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',color:'#dc2626',fontSize:13,fontWeight:600,marginBottom:14 }}>{error}</div>}
        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ position:'relative' }}>
            <Phone size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#94a3b8' }}/>
            <input type="tel" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))}
              placeholder="Your 10-digit mobile number" required style={{ ...inp, paddingLeft:36 }}/>
          </div>
          <button type="submit" disabled={loading} style={{ height:46,borderRadius:12,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#1e40af,#3b82f6)',color:'#fff',fontWeight:800,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
            {loading ? <><Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> Loading...</> : 'View My Account'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ── Customer Dashboard ────────────────────────────────────────
const CustomerDashboard = ({ mobile, onLogout }) => {
  const [customer,  setCust]    = useState(null);
  const [newspaper, setNewsp]   = useState(null);
  const [payments,  setPayments] = useState([]);
  const [billing,   setBilling] = useState(null);
  const [loading,   setL]       = useState(true);
  const [tab, setTab] = useState('overview');

  const load = useCallback(async () => {
    setL(true);
    try {
      // 1. Find customer by mobile using lookup
      const res = await fetch(`${BASE_URL}/customer/lookup/${mobile}`);
      if (res.ok) {
        const c = await res.json();
        setCust(c);

        // 2. Fetch billing
        try {
          const b = await npGet(`/billing/${c.id}`);
          setBilling(b);
        } catch(e) {}

        // 3. Fetch payment history
        try {
          const p = await npGet(`/payments/${c.id}`);
          setPayments(p || []);
        } catch(e) {}

        // 4. Fetch newspaper if assigned
        if (c.newspaperId) {
          try {
            const res2 = await fetch(`${BASE_URL}/newspapers/find/${c.newspaperId}`);
            if (res2.ok) setNewsp(await res2.json());
          } catch(e) {}
        }
      }
    } catch(e) { console.error(e); }
    finally    { setL(false); }
  }, [mobile]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f7fb' }}>
      <Loader2 size={40} color="#2563eb" style={{ animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tabs = [
    ['overview', 'Overview'],
    ['billing',  'My Bill'],
    ['payments', 'Payments'],
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f4f7fb', fontFamily:'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e40af)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Newspaper size={20} color="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight:800, color:'#fff', fontSize:15 }}>{customer?.name || mobile}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Customer Portal</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6 }}>
          <LogOut size={14}/> Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', display:'flex', gap:0 }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:'14px 22px', border:'none', background:'transparent', fontWeight:700, fontSize:13, cursor:'pointer', borderBottom: tab===id ? '2px solid #2563eb' : '2px solid transparent', color: tab===id ? '#2563eb' : '#64748b' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:700, margin:'24px auto', padding:'0 16px' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            {/* Newspaper Details */}
            {newspaper ? (
              <div style={{ ...card, background:'linear-gradient(135deg,#1e40af,#3b82f6)', color:'#fff' }}>
                <div style={{ fontSize:12, opacity:.7, marginBottom:6, textTransform:'uppercase', fontWeight:700 }}>Your Newspaper</div>
                <div style={{ fontSize:22, fontWeight:900, marginBottom:4 }}>{newspaper.name}</div>
                <div style={{ fontSize:13, opacity:.8 }}>{newspaper.type} · {newspaper.language} · {newspaper.publisher}</div>
                <div style={{ display:'flex', gap:20, marginTop:14 }}>
                  <div>
                    <div style={{ fontSize:11, opacity:.7 }}>Daily Rate</div>
                    <div style={{ fontSize:20, fontWeight:800 }}>₹{newspaper.price}</div>
                  </div>
                  {newspaper.deliveryTime && (
                    <div>
                      <div style={{ fontSize:11, opacity:.7 }}>Delivery Time</div>
                      <div style={{ fontSize:16, fontWeight:700 }}>🕐 {newspaper.deliveryTime}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ ...card, textAlign:'center', color:'#94a3b8', padding:30 }}>
                <Newspaper size={36} style={{ marginBottom:8, opacity:.4 }}/>
                <p>No newspaper assigned yet. Contact your distributor.</p>
              </div>
            )}

            {/* Customer Info */}
            {customer && (
              <div style={card}>
                <h4 style={{ margin:'0 0 12px', fontWeight:800 }}>My Details</h4>
                {[
                  ['Mobile',  customer.mobile],
                  ['Address', customer.address || 'Not set'],
                  ['Route',   customer.routeName || 'General'],
                  ['Status',  customer.active !== false ? '✅ Active' : '⏸ Inactive'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                    <span style={{ color:'#64748b', fontWeight:600 }}>{k}</span>
                    <span style={{ fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* BILLING */}
        {tab === 'billing' && (
          billing ? (
            <div style={card}>
              <h4 style={{ margin:'0 0 16px', fontWeight:800 }}>Monthly Bill Summary</h4>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
                {[
                  ['Month Days', billing.monthDays, '#2563eb'],
                  ['Break Days', billing.breakDays, '#f59e0b'],
                  ['Active Days', billing.activeDays, '#10b981'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ background:'#f8fafc', borderRadius:12, padding:14, textAlign:'center' }}>
                    <div style={{ fontSize:24, fontWeight:900, color }}>{val}</div>
                    <div style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius:12, padding:'16px 20px', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, opacity:.8 }}>Monthly Amount Due</div>
                  <div style={{ fontSize:11, opacity:.6 }}>{billing.activeDays} active days × rate × qty</div>
                </div>
                <div style={{ fontSize:30, fontWeight:900 }}>₹{billing.monthlyAmount?.toFixed(0) || 0}</div>
              </div>

              {billing.breakDays > 0 && (
                <div style={{ background:'#fef9c3', borderRadius:10, padding:'10px 14px', marginTop:12, fontSize:13, color:'#854d0e', fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                  <AlertCircle size={15}/> You had {billing.breakDays} break day(s) this month. Bill adjusted accordingly.
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...card, textAlign:'center', color:'#94a3b8', padding:40 }}>
              <Calendar size={36} style={{ marginBottom:8, opacity:.4 }}/>
              <p>Billing data not available. Contact your distributor.</p>
            </div>
          )
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div style={card}>
            <h4 style={{ margin:'0 0 14px', fontWeight:800 }}>Payment History</h4>
            {payments.length === 0 ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:30 }}>
                <CreditCard size={36} style={{ marginBottom:8, opacity:.4 }}/>
                <p>No payment records yet.</p>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                    <th style={{ padding:'8px 10px', color:'#64748b', fontWeight:700, textAlign:'left' }}>DATE</th>
                    <th style={{ padding:'8px 10px', color:'#64748b', fontWeight:700, textAlign:'left' }}>AMOUNT</th>
                    <th style={{ padding:'8px 10px', color:'#64748b', fontWeight:700, textAlign:'left' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id || i} style={{ borderBottom:'1px solid #f8fafc' }}>
                      <td style={{ padding:'10px 10px' }}>{p.paymentDate}</td>
                      <td style={{ padding:'10px 10px', fontWeight:700, color:'#10b981' }}>₹{p.amount}</td>
                      <td style={{ padding:'10px 10px' }}>
                        <span style={{ padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700,background:'#dcfce7',color:'#166534' }}>
                          <CheckCircle size={10} style={{ marginRight:4 }}/>{p.status || 'PAID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────
const BillingPortal = () => {
  const [mobile, setMobile] = useState(localStorage.getItem('npCustMobile') || '');
  const [custData, setCustData] = useState(null);

  const handleLogin = (mob, data) => {
    setMobile(mob);
    setCustData(data);
    localStorage.setItem('npCustMobile', mob);
  };

  const handleLogout = () => {
    localStorage.removeItem('npCustMobile');
    setMobile('');
    setCustData(null);
  };

  if (!mobile) return <CustomerLogin onLogin={handleLogin}/>;
  return <CustomerDashboard mobile={mobile} custData={custData} onLogout={handleLogout}/>;
};

export default BillingPortal;
