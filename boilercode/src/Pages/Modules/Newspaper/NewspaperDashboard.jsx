import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper, Users, CreditCard, LayoutDashboard,
  LogOut, TrendingUp, Loader2
} from 'lucide-react';
import { npGet, getMobile } from './npApi';
import CustomersTab  from './CustomersTab';
import NewspapersTab from './NewspapersTab';
import BillingTab    from './BillingTab';
import PaymentsTab   from './PaymentsTab';

// ── simple toast ──────────────────────────────────────────────
const useToast = () => {
  const [t, setT] = useState(null);
  const show = (msg, type='warning') => { setT({msg,type}); setTimeout(()=>setT(null),3500); };
  return [t, show];
};

const NewspaperDashboard = () => {
  const navigate   = useNavigate();
  const mobile     = getMobile();
  const [tab, setTab]   = useState('overview');
  const [data, setData] = useState({ customers:[], newspapers:[], payments:[] });
  const [loading, setL] = useState(true);
  const [toast, showToast] = useToast();

  const npData = JSON.parse(localStorage.getItem('npData') || '{}');

  const loadOverview = useCallback(async () => {
    if (!mobile) { navigate('/auth/distributor/admin'); return; }
    try {
      const [c, n] = await Promise.all([
        npGet(`/customers/${mobile}`).catch(() => []),
        npGet(`/newspapers/${mobile}`).catch(() => []),
      ]);
      setData({ customers: c||[], newspapers: n||[] });
    } catch(e) { console.error(e); }
    finally    { setL(false); }
  }, [mobile, navigate]);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const logout = () => {
    ['npToken','npMobile','npData'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const navItems = [
    { id:'overview',   label:'Overview',   icon:<LayoutDashboard size={18}/> },
    { id:'customers',  label:'Customers',  icon:<Users size={18}/>            },
    { id:'newspapers', label:'Newspapers', icon:<Newspaper size={18}/>        },
    { id:'billing',    label:'Billing',    icon:<TrendingUp size={18}/>       },
    { id:'payments',   label:'Payments',   icon:<CreditCard size={18}/>       },
  ];

  const activeCustomers = data.customers.filter(c => c.active !== false);
  const routes = [...new Set(data.customers.map(c => c.routeName).filter(Boolean))];

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'Inter,sans-serif', background:'#f4f7fb' }}>
      {/* SIDEBAR */}
      <aside style={{ width:220, background:'#0f172a', display:'flex', flexDirection:'column', padding:'24px 16px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, paddingBottom:20, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#1e40af,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Newspaper size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:13, color:'#fff' }}>NP Manager</div>
            <div style={{ fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:1 }}>Distributor</div>
          </div>
        </div>

        <nav style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, textAlign:'left', transition:'all .15s',
              background: tab===item.id ? 'rgba(37,99,235,.25)' : 'transparent',
              color: tab===item.id ? '#93c5fd' : '#94a3b8',
            }}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <button onClick={logout} style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,border:'1px solid rgba(239,68,68,.3)',background:'transparent',color:'#f87171',fontWeight:600,fontSize:13,cursor:'pointer' }}>
          <LogOut size={16}/> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ margin:0, fontWeight:900, fontSize:24, color:'#0f172a' }}>
              {tab === 'overview' ? `Hello, ${npData.name || 'Distributor'} 👋` : navItems.find(n=>n.id===tab)?.label}
            </h1>
            {tab === 'overview' && <p style={{ margin:0, fontSize:13, color:'#64748b' }}>{npData.businessName || ''}</p>}
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
            <Loader2 size={36} color="#2563eb" style={{ animation:'spin 1s linear infinite' }}/>
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div>
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                  {[
                    ['Total Customers', data.customers.length, '#2563eb', <Users size={20}/>],
                    ['Active Customers', activeCustomers.length, '#10b981', <Users size={20}/>],
                    ['Total Routes', routes.length, '#f59e0b', <LayoutDashboard size={20}/>],
                    ['Newspapers', data.newspapers.length, '#8b5cf6', <Newspaper size={20}/>],
                  ].map(([label, val, color, icon]) => (
                    <div key={label} style={{ background:'#fff', borderRadius:16, padding:'18px 20px', boxShadow:'0 2px 12px rgba(0,0,0,.07)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase' }}>{label}</span>
                        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, color, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
                      </div>
                      <div style={{ fontSize:28, fontWeight:900, color:'#0f172a' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Customer Route List */}
                <div style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.07)' }}>
                  <h3 style={{ margin:'0 0 14px', fontWeight:800 }}>Route Chain Overview</h3>
                  {routes.length === 0 ? (
                    <p style={{ color:'#94a3b8', textAlign:'center', padding:20 }}>No routes yet. Add customers with route names!</p>
                  ) : routes.map(route => (
                    <div key={route} style={{ marginBottom:12 }}>
                      <div style={{ fontWeight:700, color:'#2563eb', fontSize:13, marginBottom:6 }}>📍 {route}</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {data.customers
                          .filter(c => c.routeName === route)
                          .sort((a,b) => (a.routeOrder||0)-(b.routeOrder||0))
                          .map((c, i) => (
                            <span key={c.id} style={{ padding:'4px 10px', background:'#eff6ff', color:'#1e40af', borderRadius:20, fontSize:12, fontWeight:600 }}>
                              {i+1}. {c.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'customers'  && <CustomersTab  mobile={mobile} toast={showToast}/>}
            {tab === 'newspapers' && <NewspapersTab mobile={mobile} toast={showToast}/>}
            {tab === 'billing'    && <BillingTab    mobile={mobile} toast={showToast}/>}
            {tab === 'payments'   && <PaymentsTab   mobile={mobile} toast={showToast}/>}
          </>
        )}
      </main>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:9999, padding:'12px 18px', borderRadius:12, fontWeight:700, fontSize:13,
          background: toast.type==='success' ? '#dcfce7' : toast.type==='error' ? '#fef2f2' : '#fef9c3',
          color: toast.type==='success' ? '#166534' : toast.type==='error' ? '#dc2626' : '#854d0e',
          boxShadow:'0 8px 24px rgba(0,0,0,.15)', display:'flex', alignItems:'center', gap:8
        }}>
          {toast.type==='success' ? '✅' : toast.type==='error' ? '❌' : '⚠️'} {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default NewspaperDashboard;
