import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper, Phone, Loader2, LogOut, Calendar, CreditCard,
  AlertCircle, CheckCircle, ArrowLeft, ArrowRight, User, MapPin,
  Receipt, Sliders, Shield, Wallet, Sparkles, X, ChevronRight,
  RefreshCw, Send, Check
} from 'lucide-react';
import { npGet, npPost, npPut } from './npApi';

// ── CUSTOM PREMIUM DESIGN SYSTEM VARIABLES ─────────────────────
const STYLES = {
  glassBg: 'rgba(255, 255, 255, 0.85)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.03)',
  gradientPrimary: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
  gradientSecondary: 'linear-gradient(135deg, #0f172a, #1e293b)',
  gradientAccent: 'linear-gradient(135deg, #10b981, #059669)',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  borderRadius: '20px',
  transitionSpeed: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

// ── UTILITIES ──────────────────────────────────────────────────
const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// ── Customer Login ────────────────────────────────────────────
const CustomerLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [loading, setL]     = useState(false);
  const [error, setErr]     = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!mobile || mobile.length !== 10) return setErr('Enter valid 10-digit mobile');
    setL(true);
    try {
      // Find customer by mobile using npGet
      const data = await npGet(`/customer/lookup/${mobile}`);
      onLogin(mobile, data);
    } catch(err) {
      setErr(err.message || 'No customer account found with this mobile number');
    } finally { setL(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 90%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Spheres */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.25)', filter: 'blur(80px)', top: '-50px', left: '-50px' }}/>
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', filter: 'blur(80px)', bottom: '-50px', right: '-50px' }}/>

      <div className="login-card" style={{
        background: STYLES.glassBg,
        backdropFilter: 'blur(20px)',
        border: STYLES.glassBorder,
        borderRadius: '28px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        boxSizing: 'border-box',
        zIndex: 2,
        animation: 'slideUp 0.6s ease-out'
      }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/select-role/distributor')}
          style={{
            background: 'rgba(15, 23, 42, 0.05)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: STYLES.textSecondary,
            fontWeight: 700,
            fontSize: '13px',
            marginBottom: '28px',
            transition: STYLES.transitionSpeed
          }}
          className="hover-scale"
        >
          <ArrowLeft size={15}/> Back to Roles
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: STYLES.gradientPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 12px 28px rgba(79, 70, 229, 0.3)'
          }}>
            <Newspaper size={30} color="#fff"/>
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '24px', margin: '0 0 6px', color: STYLES.textPrimary }}>Customer Portal</h2>
          <p style={{ color: STYLES.textSecondary, fontSize: '14px', margin: 0, fontWeight: 500 }}>Access your delivery schedule & bills instantly</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16}/> {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: STYLES.textMuted }}/>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g,''))}
              placeholder="Your 10-digit mobile number"
              required
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px 0 42px',
                borderRadius: '12px',
                border: '2.5px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                transition: STYLES.transitionSpeed,
                background: '#fff'
              }}
              className="login-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '48px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: STYLES.gradientPrimary,
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
              transition: STYLES.transitionSpeed
            }}
            className="hover-scale-btn"
          >
            {loading ? (
              <><Loader2 size={18} className="spin"/> Loading Profile...</>
            ) : (
              <><Wallet size={16}/> Login Portfolio <ArrowRight size={16}/></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Customer Dashboard ────────────────────────────────────────
const CustomerDashboard = ({ mobile, initialData, onLogout }) => {
  const [customer, setCust] = useState(initialData);
  const [newspaper, setNewsp] = useState(null);
  const [payments, setPayments] = useState([]);
  const [billing, setBilling] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [loading, setL] = useState(true);
  const [tab, setTab] = useState('overview');

  // Pause Form
  const [pauseDates, setPauseDates] = useState({ start: '', end: '' });
  const [submittingPause, setSubmittingPause] = useState(false);
  const [message, setMessage] = useState(null);

  // Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [payingState, setPayingState] = useState('idle'); // idle, processing, success
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch Fresh Customer Info
      const c = await npGet(`/customer/lookup/${mobile}`);
      setCust(c);

      // 2. Fetch billing details
      try {
        const b = await npGet(`/billing/${c.id}`);
        setBilling(b);
      } catch(e) { console.error('Billing error', e); }

      // 3. Fetch payment logs
      try {
        const p = await npGet(`/payments/${c.id}`);
        setPayments(p ? [...p].reverse() : []);
      } catch(e) { console.error('Payments error', e); }

      // 4. Fetch newspaper details
      if (c.newspaperId) {
        try {
          const n = await npGet(`/newspapers/find/${c.newspaperId}`);
          setNewsp(n);
        } catch(e) { console.error('Newspaper find error', e); }
      }

      // 5. Fetch Today's Delivery Status
      try {
        const todayDelivery = await npGet(`/api/entry/customer/today/${c.id}`);
        setTodayEntry(todayDelivery);
      } catch(e) { console.error('Today delivery error', e); }

    } catch(err) {
      console.error('Data loading error', err);
    } finally {
      setL(false);
    }
  }, [mobile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set subscription break dates
  const handleSetPause = async (e) => {
    e.preventDefault();
    if (!pauseDates.start || !pauseDates.end) return;
    setSubmittingPause(true);
    try {
      await npPut(`/customers/${customer.id}/pause`, pauseDates);
      setMessage({ type: 'success', text: 'Paper paused for break days successfully!' });
      setPauseDates({ start: '', end: '' });
      loadData();
    } catch(e) {
      setMessage({ type: 'error', text: e.message || 'Failed to pause newspaper.' });
    } finally {
      setSubmittingPause(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Resume subscription paper
  const handleResumePaper = async () => {
    setSubmittingPause(true);
    try {
      await npPut(`/customers/${customer.id}/resume`, {});
      setMessage({ type: 'success', text: 'Newspaper delivery resumed instantly!' });
      loadData();
    } catch(e) {
      setMessage({ type: 'error', text: e.message || 'Failed to resume newspaper.' });
    } finally {
      setSubmittingPause(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Initiate dynamic payment completion
  const handleConfirmPayment = async () => {
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.name)) {
      alert('Please fill out card details');
      return;
    }
    setPayingState('processing');
    
    // Simulate payment transaction loader
    setTimeout(async () => {
      try {
        await npPost('/payments', {
          customerId: customer.id,
          amount: billing?.monthlyAmount || 240,
          distributorMobile: customer.distributorMobile
        });
        setPayingState('success');
      } catch(e) {
        alert(e.message || 'Payment simulation failed');
        setPayingState('idle');
      }
    }, 1800);
  };

  // Close payment modal and reload fresh transaction metrics
  const closePaymentFlow = () => {
    setShowPayModal(false);
    setPayingState('idle');
    setPaymentMethod('');
    setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
    loadData();
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f7fb',
      gap: '12px'
    }}>
      <Loader2 size={44} color="#4f46e5" className="spin"/>
      <div style={{ color: STYLES.textSecondary, fontWeight: 700, fontSize: '15px' }}>Loading Customer Environment...</div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
      
      {/* ── TOP HEADER BAR ── */}
      <header style={{
        background: STYLES.gradientSecondary,
        color: '#fff',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <Newspaper size={22} color="#06b6d4"/>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.3px' }}>{customer.name}</span>
              <span style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                Customer
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <MapPin size={11}/> Route: <strong style={{ color: '#fff' }}>{customer.routeName || 'General'}</strong> (Position {customer.routeOrder || 1})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textAlign: 'right', display: 'none' }} className="d-md-block">
            Distributor Ref: <strong>{customer.distributorMobile}</strong>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              borderRadius: '10px',
              padding: '9px 16px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: STYLES.transitionSpeed
            }}
            className="hover-logout"
          >
            <LogOut size={14}/> Logout
          </button>
        </div>
      </header>

      {/* ── TAB NAVIGATION ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        display: 'flex',
        gap: '24px',
        position: 'sticky',
        top: '84px',
        zIndex: 9
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <User size={16}/> },
          { id: 'billing', label: 'Subscription & Bills', icon: <Sliders size={16}/> },
          { id: 'payments', label: 'Payment Ledger', icon: <Receipt size={16}/> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '18px 8px',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: tab === t.id ? '#4f46e5' : '#64748b',
              borderBottom: tab === t.id ? '3px solid #4f46e5' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div style={{ maxWidth: '980px', margin: '32px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* Alerts / Toast Messages inside dashboard */}
        {message && (
          <div style={{
            background: message.type === 'success' ? '#dcfce7' : '#fef2f2',
            border: `1.5px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '16px',
            padding: '14px 20px',
            color: message.type === 'success' ? '#15803d' : '#b91c1c',
            fontWeight: 700,
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.3s ease'
          }}>
            {message.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
            {message.text}
          </div>
        )}

        {/* ── TAB: OVERVIEW ── */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            
            {/* Top Stat Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Paper Product Subscription Banner */}
              {newspaper ? (
                <div style={{
                  background: STYLES.gradientPrimary,
                  color: '#fff',
                  borderRadius: STYLES.borderRadius,
                  padding: '28px',
                  boxShadow: '0 12px 30px rgba(79, 70, 229, 0.25)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Watermark Logo */}
                  <Newspaper size={180} style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1, pointerEvents: 'none' }}/>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Active Subscription</span>
                    <span style={{
                      background: customer.active !== false ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: customer.active !== false ? '#34d399' : '#fbbf24',
                      border: `1px solid ${customer.active !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      {customer.active !== false ? '● DELIVERING' : '⏸ PAUSED'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.5px' }}>{newspaper.name}</h3>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '24px' }}>
                    {newspaper.publisher} · {newspaper.language} · {newspaper.type}
                  </div>

                  <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '18px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Price</div>
                      <div style={{ fontSize: '20px', fontWeight: 900 }}>{formatCurrency(newspaper.price)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Quantity</div>
                      <div style={{ fontSize: '20px', fontWeight: 900 }}>{customer.quantity || 1} Unit(s)</div>
                    </div>
                    {newspaper.deliveryTime && (
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Schedule</div>
                        <div style={{ fontSize: '20px', fontWeight: 900 }}>🕐 {newspaper.deliveryTime}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#fff',
                  borderRadius: STYLES.borderRadius,
                  padding: '40px 20px',
                  boxShadow: STYLES.boxShadow,
                  textAlign: 'center',
                  border: '1.5px dashed #cbd5e1'
                }}>
                  <Newspaper size={44} style={{ color: STYLES.textMuted, marginBottom: '12px' }}/>
                  <h4 style={{ fontWeight: 800, margin: '0 0 6px' }}>No Assigned Subscription</h4>
                  <p style={{ fontSize: '13px', color: STYLES.textSecondary, margin: 0 }}>Please contact your distributor to choose your newspaper.</p>
                </div>
              )}

              {/* Delivery Status & Mini Bill Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Real-time Delivery Status Tracker */}
                <div style={{
                  background: '#fff',
                  borderRadius: STYLES.borderRadius,
                  padding: '24px',
                  boxShadow: STYLES.boxShadow,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: todayEntry?.delivered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: todayEntry?.delivered ? '#10b981' : '#4f46e5'
                  }}>
                    {todayEntry?.delivered ? <CheckCircle size={24}/> : <Calendar size={24} className={customer.active !== false ? "pulse-anim" : ""}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: STYLES.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Delivery Status</div>
                    {customer.active === false ? (
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '16px', marginTop: '3px' }}>Paused (Break Period)</div>
                    ) : todayEntry?.delivered ? (
                      <div style={{ fontWeight: 800, color: '#10b981', fontSize: '16px', marginTop: '3px' }}>Delivered Successfully!</div>
                    ) : (
                      <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '16px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Awaiting Dispatch 
                        <span style={{ width: '8px', height: '8px', background: '#4f46e5', borderRadius: '50%', display: 'inline-block', animation: 'ping 1.5s infinite' }}/>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Summary Box */}
                <div style={{
                  background: '#fff',
                  borderRadius: STYLES.borderRadius,
                  padding: '24px',
                  boxShadow: STYLES.boxShadow,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: STYLES.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Outstanding Bill</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: STYLES.textPrimary, marginTop: '4px' }}>
                      {formatCurrency(billing?.monthlyAmount || 0)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if ((billing?.monthlyAmount || 0) <= 0) {
                        alert('Your bill balance is fully settled!');
                        return;
                      }
                      setShowPayModal(true);
                    }}
                    style={{
                      background: STYLES.gradientAccent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.2)',
                      transition: STYLES.transitionSpeed
                    }}
                    className="hover-scale-btn"
                  >
                    Pay Invoice
                  </button>
                </div>

              </div>
            </div>

            {/* Delivery Logs Ledger Simulation */}
            <div style={{
              background: '#fff',
              borderRadius: STYLES.borderRadius,
              padding: '28px',
              boxShadow: STYLES.boxShadow,
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '18px' }}>Recent Deliveries Ledger</h3>
              <p style={{ margin: '0 0 20px', color: STYLES.textSecondary, fontSize: '13px' }}>Logs for the past 7 days showing paper dispatch and status.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                {[...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  const isToday = i === 0;
                  const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  // Pause / Delivery verification conditions
                  let wasDelivered = !isToday; 
                  let wasPaused = false;
                  if (customer.pauseStartDate && customer.pauseEndDate) {
                    const start = new Date(customer.pauseStartDate);
                    const end = new Date(customer.pauseEndDate);
                    if (d >= start && d <= end) {
                      wasPaused = true;
                      wasDelivered = false;
                    }
                  }
                  if (isToday) {
                    wasDelivered = !!todayEntry?.delivered;
                  }

                  return (
                    <div key={i} style={{
                      background: isToday ? '#f8fafc' : '#fff',
                      border: `1.5px solid ${isToday ? '#4f46e5' : '#e2e8f0'}`,
                      borderRadius: '14px',
                      padding: '16px 10px',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: '11px', color: STYLES.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>{dayStr}</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0 10px', color: STYLES.textPrimary }}>{dateStr}</div>
                      
                      <div style={{
                        display: 'inline-flex',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: wasPaused ? '#fef9c3' : wasDelivered ? '#dcfce7' : '#eff6ff',
                        color: wasPaused ? '#a16207' : wasDelivered ? '#15803d' : '#1d4ed8'
                      }}>
                        {wasPaused ? '⏸ BREAK' : wasDelivered ? '✅ DONE' : '⏳ PENDING'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB: SUBSCRIPTION & BILLING ── */}
        {tab === 'billing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Pause Delivery Form */}
            <div style={{
              background: '#fff',
              borderRadius: STYLES.borderRadius,
              padding: '28px',
              boxShadow: STYLES.boxShadow,
              border: '1px solid #e2e8f0',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706'
                }}>
                  <Calendar size={18}/>
                </div>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '18px' }}>Delivery Vacation Pause</h3>
              </div>

              {customer.active !== false ? (
                <>
                  <p style={{ color: STYLES.textSecondary, fontSize: '13px', margin: '0 0 20px', lineHeight: '1.4' }}>
                    Going on holiday? Set vacation break dates to pause your paper delivery. Your monthly billing will automatically deduct these dates.
                  </p>
                  
                  <form onSubmit={handleSetPause} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: STYLES.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Start Date</label>
                        <input
                          type="date"
                          required
                          value={pauseDates.start}
                          onChange={e => setPauseDates(p => ({ ...p, start: e.target.value }))}
                          style={{
                            width: '100%',
                            height: '42px',
                            borderRadius: '10px',
                            border: '2px solid #e2e8f0',
                            padding: '0 10px',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: STYLES.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>End Date</label>
                        <input
                          type="date"
                          required
                          value={pauseDates.end}
                          onChange={e => setPauseDates(p => ({ ...p, end: e.target.value }))}
                          style={{
                            width: '100%',
                            height: '42px',
                            borderRadius: '10px',
                            border: '2px solid #e2e8f0',
                            padding: '0 10px',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPause}
                      style={{
                        height: '44px',
                        background: '#f59e0b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: submittingPause ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 6px 16px rgba(245,158,11,0.2)',
                        transition: STYLES.transitionSpeed
                      }}
                      className="hover-scale-btn"
                    >
                      {submittingPause ? <Loader2 size={16} className="spin"/> : <Sliders size={15}/>} Confirm Vacation Break
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>⏸</div>
                  <h4 style={{ fontWeight: 800, margin: '0 0 6px', color: '#b45309' }}>Vacation Mode Active</h4>
                  <p style={{ fontSize: '12px', color: '#b45309', margin: '0 0 16px', lineHeight: '1.4' }}>
                    Your subscription is paused from <strong style={{ color: '#78350f' }}>{customer.pauseStartDate}</strong> to <strong style={{ color: '#78350f' }}>{customer.pauseEndDate}</strong>.
                  </p>
                  
                  <button
                    onClick={handleResumePaper}
                    disabled={submittingPause}
                    style={{
                      width: '100%',
                      height: '44px',
                      background: STYLES.gradientAccent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 6px 16px rgba(16,185,129,0.2)',
                      transition: STYLES.transitionSpeed
                    }}
                    className="hover-scale-btn"
                  >
                    {submittingPause ? <Loader2 size={16} className="spin"/> : <CheckCircle size={16}/>} Resume Subscriptions Now
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Month Billing Calculations */}
            {billing ? (
              <div style={{
                background: '#fff',
                borderRadius: STYLES.borderRadius,
                padding: '28px',
                boxShadow: STYLES.boxShadow,
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: '18px' }}>Billing Analytics Breakdown</h3>
                <p style={{ margin: '0 0 20px', color: STYLES.textSecondary, fontSize: '13px' }}>Breakdown of active delivery days for the current billing month.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  {[
                    ['Calendar Days', billing.monthDays, '#4f46e5', 'rgba(79, 70, 229, 0.06)'],
                    ['Break Days', billing.breakDays, '#f59e0b', 'rgba(245, 158, 11, 0.06)'],
                    ['Billing Days', billing.activeDays, '#10b981', 'rgba(16, 185, 129, 0.06)']
                  ].map(([lbl, val, color, bg]) => (
                    <div key={lbl} style={{ background: bg, border: `1.5px solid ${color}20`, borderRadius: '14px', padding: '16px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color }}>{val}</div>
                      <div style={{ fontSize: '11px', color: STYLES.textSecondary, fontWeight: 700, marginTop: '2px' }}>{lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Mathematical Equation Block */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '11px', color: STYLES.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Payment Equation</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: STYLES.textSecondary }}>
                    <span>Active Days:</span>
                    <strong style={{ color: STYLES.textPrimary }}>{billing.activeDays} Days</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: STYLES.textSecondary, marginTop: '8px' }}>
                    <span>Daily Rate ({newspaper?.name}):</span>
                    <strong style={{ color: STYLES.textPrimary }}>{formatCurrency(newspaper?.price || 0)} / day</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: STYLES.textSecondary, marginTop: '8px' }}>
                    <span>Subscribed Qty:</span>
                    <strong style={{ color: STYLES.textPrimary }}>{customer.quantity || 1} Unit(s)</strong>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '14px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: STYLES.textPrimary }}>Calculated Invoice Total:</span>
                    <strong style={{ fontSize: '20px', color: '#4f46e5', fontWeight: 900 }}>{formatCurrency(billing.monthlyAmount)}</strong>
                  </div>
                </div>

                {billing.monthlyAmount > 0 ? (
                  <button
                    onClick={() => setShowPayModal(true)}
                    style={{
                      width: '100%',
                      height: '46px',
                      background: STYLES.gradientPrimary,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(79, 70, 229, 0.25)',
                      transition: STYLES.transitionSpeed
                    }}
                    className="hover-scale-btn"
                  >
                    <CreditCard size={16}/> Settle Balance Now ({formatCurrency(billing.monthlyAmount)})
                  </button>
                ) : (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1.5px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle size={15}/> All balance bills fully cleared!
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: STYLES.borderRadius, padding: '30px', boxShadow: STYLES.boxShadow, textAlign: 'center' }}>
                No active billing calculator.
              </div>
            )}

          </div>
        )}

        {/* ── TAB: PAYMENTS ── */}
        {tab === 'payments' && (
          <div style={{
            background: '#fff',
            borderRadius: STYLES.borderRadius,
            padding: '28px',
            boxShadow: STYLES.boxShadow,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '18px' }}>Payment Ledger History</h3>
                <p style={{ margin: '2px 0 0', color: STYLES.textSecondary, fontSize: '13px' }}>Ledger of successful transaction receipts processed on this profile.</p>
              </div>
              <button
                onClick={() => loadData()}
                style={{
                  background: 'rgba(15, 23, 42, 0.04)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: STYLES.textSecondary,
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={13}/> Sync Ledger
              </button>
            </div>

            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: STYLES.textMuted }}>
                <CreditCard size={44} style={{ opacity: 0.4, marginBottom: '12px' }}/>
                <h4 style={{ fontWeight: 800, margin: '0 0 4px', color: STYLES.textPrimary }}>No Transaction Records</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>You haven't processed any digital payments yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2.5px solid #f1f5f9', color: STYLES.textSecondary, fontWeight: 800 }}>
                      <th style={{ padding: '12px 14px' }}>Transaction Receipt</th>
                      <th style={{ padding: '12px 14px' }}>Invoice Date</th>
                      <th style={{ padding: '12px 14px' }}>Method</th>
                      <th style={{ padding: '12px 14px' }}>Settled Sum</th>
                      <th style={{ padding: '12px 14px' }}>Security Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => (
                      <tr key={p.id || idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }} className="table-row-hover">
                        <td style={{ padding: '14px', fontWeight: 700, color: STYLES.textPrimary }}>
                          TXN-{p.id ? String(p.id).padStart(5, '0') : Math.floor(100000 + Math.random() * 900000)}
                        </td>
                        <td style={{ padding: '14px', color: STYLES.textSecondary, fontWeight: 500 }}>{p.paymentDate}</td>
                        <td style={{ padding: '14px', color: STYLES.textSecondary, fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Wallet size={13}/> UPI/Digital
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 800, color: '#10b981', fontSize: '14px' }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: '#dcfce7',
                            color: '#15803d',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Check size={11}/> {p.status || 'PAID'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── HIGH FIDELITY INTERACTIVE PAYMENT MODAL ── */}
      {showPayModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.3s ease'
        }}>
          
          <div style={{
            background: '#fff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>

            {/* Modal Header */}
            <div style={{
              background: STYLES.gradientSecondary,
              color: '#fff',
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 900, fontSize: '18px', letterSpacing: '-0.3px' }}>Digital Settle Desk</h4>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Securely processing: {customer.name}</div>
              </div>
              {payingState !== 'processing' && payingState !== 'success' && (
                <button
                  onClick={() => setShowPayModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: STYLES.transitionSpeed
                  }}
                  className="hover-bg-opacity"
                >
                  <X size={16}/>
                </button>
              )}
            </div>

            {/* Modal Workspace States */}

            {/* STATE 1: IDLE / FORM FILL */}
            {payingState === 'idle' && (
              <div style={{ padding: '28px', boxSizing: 'border-box' }}>
                
                {/* Total Billing Preview card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Ledger Bill Due</span>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e40af', marginTop: '2px' }}>
                      {formatCurrency(billing?.monthlyAmount || 240)}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    🛡 256-bit Secure
                  </div>
                </div>

                {!paymentMethod ? (
                  <>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: STYLES.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Select Settlement Mode</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '14px',
                          background: '#fff',
                          cursor: 'pointer',
                          fontWeight: 700,
                          textAlign: 'left',
                          transition: STYLES.transitionSpeed
                        }}
                        className="payment-type-selector"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7', padding: '9px', boxSizing: 'border-box' }}>
                            <Send size={18}/>
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: STYLES.textPrimary }}>Instant UPI Transfer</div>
                            <div style={{ fontSize: '11px', color: STYLES.textSecondary, marginTop: '2px' }}>GPay, PhonePe, Paytm or UPI QR Code</div>
                          </div>
                        </div>
                        <ChevronRight size={18} color={STYLES.textMuted}/>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('card')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '14px',
                          background: '#fff',
                          cursor: 'pointer',
                          fontWeight: 700,
                          textAlign: 'left',
                          transition: STYLES.transitionSpeed
                        }}
                        className="payment-type-selector"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justify: 'center', color: '#15803d', padding: '9px', boxSizing: 'border-box' }}>
                            <CreditCard size={18}/>
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: STYLES.textPrimary }}>Debit / Credit Card</div>
                            <div style={{ fontSize: '11px', color: STYLES.textSecondary, marginTop: '2px' }}>Visa, MasterCard, RuPay Card</div>
                          </div>
                        </div>
                        <ChevronRight size={18} color={STYLES.textMuted}/>
                      </button>

                    </div>
                  </>
                ) : (
                  <div>
                    {/* Selected Mode Detail form */}
                    <button
                      onClick={() => setPaymentMethod('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#4f46e5',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ← Switch Payment Mode
                    </button>

                    {paymentMethod === 'upi' && (
                      <div style={{ textAlign: 'center', padding: '10px 0 0' }}>
                        <div style={{
                          background: '#fff',
                          border: '2px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'inline-block',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                          marginBottom: '16px'
                        }}>
                          {/* Beautiful QR Code Simulation Box */}
                          <div style={{ width: '150px', height: '150px', background: '#1e293b', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '8px', padding: '10px', boxSizing: 'border-box' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', width: '100%' }}>
                              {[...Array(25)].map((_, i) => (
                                <div key={i} style={{ height: '14px', background: (i % 2 === 0 || i % 3 === 0) ? '#fff' : 'transparent', borderRadius: '2px' }}/>
                              ))}
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>SCAN QR CODE</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '12px', color: STYLES.textSecondary, margin: '0 0 20px', lineHeight: '1.4' }}>
                          Scan the dynamic UPI QR code with GPay/PhonePe to pay <strong style={{ color: '#4f46e5' }}>{formatCurrency(billing?.monthlyAmount || 240)}</strong> instantly.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        <div>
                          <input
                            placeholder="Card Holder Name"
                            value={cardDetails.name}
                            onChange={e => setCardDetails(p => ({ ...p, name: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '42px',
                              borderRadius: '10px',
                              border: '2px solid #e2e8f0',
                              padding: '0 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <input
                            maxLength={16}
                            placeholder="16-digit Card Number"
                            value={cardDetails.number}
                            onChange={e => setCardDetails(p => ({ ...p, number: e.target.value.replace(/\D/g,'') }))}
                            style={{
                              width: '100%',
                              height: '42px',
                              borderRadius: '10px',
                              border: '2px solid #e2e8f0',
                              padding: '0 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            placeholder="MM / YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={e => setCardDetails(p => ({ ...p, expiry: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '42px',
                              borderRadius: '10px',
                              border: '2px solid #e2e8f0',
                              padding: '0 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                          <input
                            placeholder="CVV"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={e => setCardDetails(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'') }))}
                            style={{
                              width: '100%',
                              height: '42px',
                              borderRadius: '10px',
                              border: '2px solid #e2e8f0',
                              padding: '0 12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleConfirmPayment}
                      style={{
                        width: '100%',
                        height: '46px',
                        background: STYLES.gradientAccent,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)',
                        transition: STYLES.transitionSpeed
                      }}
                      className="hover-scale-btn"
                    >
                      Authorize Payment of {formatCurrency(billing?.monthlyAmount || 240)}
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* STATE 2: LOADING SECURE SECURE */}
            {payingState === 'processing' && (
              <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <Loader2 size={60} color="#4f46e5" className="spin"/>
                  <Shield size={24} color="#06b6d4" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate/transform translate(-50%, -50%)', margin: '-12px 0 0 -12px' }}/>
                </div>
                <h4 style={{ fontWeight: 800, margin: '0 0 8px', color: STYLES.textPrimary, fontSize: '18px' }}>Verifying Transaction</h4>
                <p style={{ fontSize: '13px', color: STYLES.textSecondary, margin: 0, maxWidth: '280px', lineHeight: '1.4' }}>
                  Contacting banking channels securely. Please do not close or refresh this panel...
                </p>
              </div>
            )}

            {/* STATE 3: SUCCESS ANIMATION WOW */}
            {payingState === 'success' && (
              <div style={{ padding: '48px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center' }}>
                
                {/* Success Circle SVG Draw */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  marginBottom: '20px',
                  border: '2.5px solid #10b981',
                  animation: 'pulseGreen 1.5s infinite',
                  position: 'relative'
                }}>
                  <CheckCircle size={44} style={{ animation: 'bounceUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}/>
                  <Sparkles size={20} color="#f59e0b" style={{ position: 'absolute', top: '-6px', right: '-6px', animation: 'ping 2s infinite' }}/>
                </div>

                <h4 style={{ fontWeight: 900, margin: '0 0 8px', color: '#15803d', fontSize: '20px', letterSpacing: '-0.3px' }}>Settlement Success!</h4>
                <p style={{ fontSize: '13px', color: STYLES.textSecondary, margin: '0 0 24px', maxWidth: '300px', lineHeight: '1.4' }}>
                  Your bill amount of <strong>{formatCurrency(billing?.monthlyAmount || 240)}</strong> has been settled. Your payment receipt ledger updated instantly.
                </p>

                <button
                  onClick={closePaymentFlow}
                  style={{
                    background: STYLES.gradientSecondary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 28px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(15,23,42,0.15)',
                    transition: STYLES.transitionSpeed
                  }}
                  className="hover-scale-btn"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── CENTRALIZED PREMIUM CSS ANIMATIONS STYLE BLOCK ── */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        @keyframes bounceUp { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        
        .spin { animation: spin 1s linear infinite; }
        
        .hover-scale {
          transition: ${STYLES.transitionSpeed};
        }
        .hover-scale:hover {
          transform: translateY(-2px);
          background: rgba(15, 23, 42, 0.08) !important;
        }
        
        .hover-logout {
          transition: ${STYLES.transitionSpeed};
        }
        .hover-logout:hover {
          transform: translateY(-2px);
          background: rgba(239, 68, 68, 0.25) !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        .hover-scale-btn {
          transition: ${STYLES.transitionSpeed};
        }
        .hover-scale-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }
        .hover-scale-btn:active {
          transform: translateY(0);
        }

        .login-input {
          transition: ${STYLES.transitionSpeed};
        }
        .login-input:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15) !important;
          background: #fff !important;
        }

        .payment-type-selector {
          transition: ${STYLES.transitionSpeed};
        }
        .payment-type-selector:hover {
          border-color: #4f46e5 !important;
          background: #f8fafc !important;
          transform: translateY(-2px);
        }

        .table-row-hover:hover {
          background: #f8fafc !important;
        }

        .pulse-anim {
          animation: pulseIcon 2s infinite;
        }
        @keyframes pulseIcon {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); filter: brightness(1.1); }
          100% { transform: scale(1); }
        }

        .hover-bg-opacity:hover {
          background: rgba(255,255,255,0.2) !important;
        }
      `}</style>

    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────
const BillingPortal = () => {
  const [mobile, setMobile] = useState(localStorage.getItem('npCustMobile') || '');
  const [custData, setCustData] = useState(null);
  const [loading, setL] = useState(true);

  // Auto lookups customer profile if cached credentials exist
  useEffect(() => {
    const autoLookup = async () => {
      if (mobile) {
        try {
          const profile = await npGet(`/customer/lookup/${mobile}`);
          setCustData(profile);
        } catch(e) {
          console.warn('Auto login failed for', mobile);
          localStorage.removeItem('npCustMobile');
          setMobile('');
        }
      }
      setL(false);
    };
    autoLookup();
  }, [mobile]);

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

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f7fb'
    }}>
      <Loader2 size={40} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!mobile || !custData) return <CustomerLogin onLogin={handleLogin}/>;
  return <CustomerDashboard mobile={mobile} initialData={custData} onLogout={handleLogout}/>;
};

export default BillingPortal;
