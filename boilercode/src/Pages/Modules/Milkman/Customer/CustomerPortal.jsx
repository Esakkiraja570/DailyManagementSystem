import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, User, Droplet, ShoppingBag, Receipt,
  Bell, Search, ChevronRight, Plus, Minus, Package,
  CreditCard, Zap, Loader2, ClipboardList, Phone, ArrowRight
} from 'lucide-react';
import { BASE_URL } from '../milkmanApi';
import BillingSummery from '../BillingSummery';
import UpiPayment from './UpiPayment';
import RazorpayPayment from './RazorpayPayment';
import '../Dashboard.css';

// ── LOGIN GATE ────────────────────────────────────────────────────────────────
const CustomerLogin = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) return setError('Enter a valid 10-digit mobile number.');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE_URL}/customer/login/${mobile}`);
      if (!res.ok) throw new Error('No account found for this number. Please contact your milkman.');
      const data = await res.json();
      onLogin(mobile, data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'linear-gradient(135deg,#f4f7fb 0%,#e8f0fe 100%)' }}>
      <div className="card border-0 shadow-lg rounded-4 p-5" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-5">
          <div className="logo-icon bg-primary d-flex align-items-center justify-content-center text-white shadow mx-auto mb-4" style={{ width: 56, height: 56, borderRadius: 16 }}>
            <Droplet size={24} />
          </div>
          <h3 className="fw-bold mb-1">Customer Portal</h3>
          <p className="text-muted small">Enter your mobile number to view your dairy account</p>
        </div>

        {error && <div className="alert alert-danger border-0 rounded-3 small mb-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted text-uppercase">Mobile Number</label>
            <div className="input-group-modern">
              <Phone size={18} className="input-icon" />
              <input
                type="tel" className="form-control-modern"
                placeholder="10-digit mobile number"
                value={mobile} onChange={e => setMobile(e.target.value)}
                maxLength={10} required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Verifying...' : 'View My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
const CustomerPortal = () => {
  const [loggedInMobile, setLoggedInMobile] = useState(
    new URLSearchParams(window.location.search).get('mobile') || ''
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [customerData, setCustomerData] = useState(null);
  const [milkmanDetails, setMilkmanDetails] = useState(null);
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [payMethod, setPayMethod] = useState('razorpay'); // 'razorpay' | 'upi'
  const [notifications] = useState([
    { id: 1, text: 'Your bill this month is ready to view.', time: '2h ago', unread: true },
    { id: 2, text: 'New product added: Ghee 500ml', time: '1d ago', unread: true },
    { id: 3, text: 'Payment received for last month. Thank you!', time: '5d ago', unread: false },
  ]);

  const fetchAll = useCallback(async (mob) => {
    const m = mob || loggedInMobile;
    setLoading(true);
    try {
      // Skip if customerData already loaded (from login)
      let data = customerData;
      if (!data) {
        const res = await fetch(`${BASE_URL}/customer/login/${m}`);
        if (!res.ok) throw new Error('Not found');
        data = await res.json();
        setCustomerData(data);
      }

      const ROOT_URL = BASE_URL.replace('/api', '');
      const [entryRes, prodRes, orderRes] = await Promise.all([
        fetch(`${BASE_URL}/milk/${data.id}`),
        fetch(`${ROOT_URL}/product/list`),
        fetch(`${ROOT_URL}/order/customer/${m}`) // Assuming this exists or will be added to backend
      ]);

      if (entryRes.ok) setEntries(await entryRes.json());
      if (prodRes.ok) {
        const p = await prodRes.json();
        setProducts((p || []).filter(x => x.milkmanMobile === data.milkmanMobile || !x.milkmanMobile));
      }
      if (orderRes.ok) setMyOrders(await orderRes.json());

      // Fetch milkman details directly using the customer's mobile number via the new endpoint
      const mRes = await fetch(`${BASE_URL}/customer/milkman/${m}`);
      if (mRes.ok) {
        setMilkmanDetails(await mRes.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [customerData, loggedInMobile]);

  useEffect(() => { if (loggedInMobile) fetchAll(loggedInMobile); }, [loggedInMobile, fetchAll]);

  const handleLogin = (mobile, data) => {
    setCustomerData(data);
    setLoggedInMobile(mobile);
  };

  if (!loggedInMobile) return <CustomerLogin onLogin={handleLogin} />;

  const totalMilkL = entries.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);
  const totalMilkBill = entries.reduce((s, e) => s + ((parseFloat(e.total) || 0) * (parseFloat(e.price) || 60)), 0);
  const totalProductBill = myOrders.filter(o => o.status !== 'REJECTED' && o.status !== 'cancelled').reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const totalBill = totalMilkBill + totalProductBill;
  const unreadCount = notifications.filter(n => n.unread).length;

  const updateQty = (id, d) => setQuantities(p => ({ ...p, [id]: Math.max(1, (p[id] || 1) + d) }));

  const handleOrder = async (product) => {
    const qty = quantities[product.id] || 1;
    try {
      const ROOT_URL = BASE_URL.replace('/api', '');
      const res = await fetch(`${ROOT_URL}/order/place`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id,
          customerMobile: loggedInMobile, 
          quantity: qty, 
          total: product.price * qty,
          status: 'PENDING'
        })
      });
      if (res.ok) { alert('Order placed! ✅'); fetchAll(); }
    } catch { alert('Order failed.'); }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mb-3" size={48} />
        <p className="fw-bold text-muted">Loading your portal...</p>
      </div>
    </div>
  );

  // ── OVERVIEW ─────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="animate-fade-in">
      <h1 className="fw-bold">Hello, {customerData?.name || 'Customer'} 👋</h1>
      <p className="text-muted mb-5">Here is your dairy service summary.</p>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
            <div className="d-flex justify-content-between mb-3"><small className="text-muted fw-bold extra-small text-uppercase opacity-50">CURRENT BILL</small><div className="stat-icon-box"><CreditCard className="text-danger" /></div></div>
            <h3 className="fw-bold mb-0">₹{totalBill.toFixed(0)}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
            <div className="d-flex justify-content-between mb-3"><small className="text-muted fw-bold extra-small text-uppercase opacity-50">MILK THIS MONTH</small><div className="stat-icon-box"><Droplet className="text-info" /></div></div>
            <h3 className="fw-bold mb-0">{totalMilkL.toFixed(1)}L</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
            <div className="d-flex justify-content-between mb-3"><small className="text-muted fw-bold extra-small text-uppercase opacity-50">MY ORDERS</small><div className="stat-icon-box"><ShoppingBag className="text-success" /></div></div>
            <h3 className="fw-bold mb-0">{myOrders.length}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-black text-white">
            <div className="d-flex justify-content-between mb-3"><small className="opacity-50 fw-bold extra-small text-uppercase">PAY NOW</small><div className="stat-icon-box bg-white bg-opacity-10"><Zap className="text-white" /></div></div>
            <h3 className="fw-bold mb-0">₹{totalBill.toFixed(0)}</h3>
            <button className="btn btn-light btn-sm w-100 mt-3 rounded-pill fw-bold" onClick={() => setActiveTab('pay')}>Pay via UPI</button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="card-header bg-white p-4 border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Milk Log</h5>
              <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => setActiveTab('milkdata')}>View All</button>
            </div>
            <div className="table-responsive px-4 pb-4">
              <table className="table align-middle custom-table">
                <thead><tr className="text-muted small"><th>DATE</th><th>MORNING</th><th>EVENING</th><th>TOTAL</th><th className="text-end">COST</th></tr></thead>
                <tbody>
                  {entries.slice(0, 5).map((e, i) => (
                    <tr key={i}><td className="small">{e.date}</td><td>{e.morning}L</td><td>{e.evening}L</td><td className="fw-bold">{e.total}L</td><td className="text-end fw-bold">₹{(e.total * (e.price || 60)).toFixed(0)}</td></tr>
                  ))}
                  {entries.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted small">No entries yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <h5 className="fw-bold mb-4">What's New</h5>
          <div className="d-flex flex-column gap-3">
            {products.slice(0, 3).map(p => (
              <div key={p.id} className="action-item d-flex align-items-center justify-content-between p-3 bg-white rounded-4 shadow-sm cursor-pointer" onClick={() => setActiveTab('shop')}>
                <div className="d-flex align-items-center gap-3">
                  <div className="action-icon-box bg-light rounded-3 p-2"><Package size={20} /></div>
                  <div><div className="fw-bold small">{p.name}</div><small className="text-primary fw-bold">₹{p.price}</small></div>
                </div>
                <ChevronRight size={18} className="text-muted opacity-50" />
              </div>
            ))}
            {products.length === 0 && <p className="text-muted small">No new products yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ── PROFILE ───────────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-4">My Profile</h3>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex align-items-center gap-4 mb-4">
              <img src={`https://ui-avatars.com/api/?name=${customerData?.name}&background=0D8ABC&color=fff&size=80`} className="rounded-circle shadow" alt="avatar" style={{ width: 80, height: 80 }} />
              <div><h4 className="fw-bold mb-0">{customerData?.name}</h4><span className="badge-active px-3 py-1">ACTIVE</span></div>
            </div>
            <div className="d-flex flex-column gap-3">
              {[['Mobile', customerData?.mobile], ['Address', customerData?.address], ['Rate', `₹${customerData?.price || 60}/Litre`]].map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted small fw-bold text-uppercase">{k}</span>
                  <span className="fw-bold small">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><Droplet size={20} className="text-primary" />Your Milkman</h5>
            {milkmanDetails ? (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <img src={`https://ui-avatars.com/api/?name=${milkmanDetails.name}&background=3B82F6&color=fff&size=60`} className="rounded-circle shadow-sm" alt="milkman" style={{ width: 60, height: 60 }} />
                  <div><h5 className="fw-bold mb-0">{milkmanDetails.name}</h5><small className="text-muted">Route Manager</small></div>
                </div>
                {[['Mobile', milkmanDetails.mobile], ['Area', milkmanDetails.area], ['Rate', `₹${milkmanDetails.price}/Litre`]].map(([k, v]) => (
                  <div key={k} className="d-flex justify-content-between border-bottom pb-2">
                    <span className="text-muted small fw-bold text-uppercase">{k}</span>
                    <span className="fw-bold small">{v || '—'}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted">No milkman data found.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ── MILK DATA ─────────────────────────────────────────────────────────────
  const renderMilkData = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">Milk Consumption</h3>
      <p className="text-muted small mb-4">Your complete daily milk delivery log.</p>
      <div className="row g-4 mb-4">
        {[['Total Litres', `${totalMilkL.toFixed(1)}L`, 'text-info'], ['Total Cost', `₹${totalBill.toFixed(0)}`, 'text-primary'], ['Entries', entries.length, 'text-success']].map(([l, v, c]) => (
          <div className="col-md-4" key={l}>
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white text-center">
              <p className="text-muted small text-uppercase fw-bold mb-1">{l}</p>
              <h3 className={`fw-bold mb-0 ${c}`}>{v}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive px-4 pb-4 pt-3">
          <table className="table align-middle custom-table">
            <thead><tr className="text-muted small"><th>DATE</th><th>MORNING</th><th>EVENING</th><th>TOTAL (L)</th><th>RATE</th><th className="text-end">COST</th></tr></thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}><td className="small">{e.date}</td><td>{e.morning}L</td><td>{e.evening}L</td><td className="fw-bold">{e.total}L</td><td className="text-muted small">₹{e.price || 60}/L</td><td className="text-end fw-bold">₹{(e.total * (e.price || 60)).toFixed(0)}</td></tr>
              ))}
              {entries.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-muted small">No milk entries found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── SHOP ──────────────────────────────────────────────────────────────────
  const renderShop = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">Storefront</h3>
      <p className="text-muted small mb-4">Exclusive products from your milkman.</p>
      <div className="row g-4">
        {products.map(p => (
          <div key={p.id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
              <div style={{ height: 140, background: '#f4f7fb' }} className="d-flex align-items-center justify-content-center">
                {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={50} className="opacity-25" />}
              </div>
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-1"><h6 className="fw-bold mb-0">{p.name}</h6><span className="fw-bold text-primary">₹{p.price}</span></div>
                <p className="extra-small text-success fw-bold mb-3">{p.specialMessage || 'Fresh & Quality'}</p>
                <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-2 mb-3">
                  <span className="small fw-bold">Qty</span>
                  <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-sm border bg-white rounded-circle p-1" onClick={() => updateQty(p.id, -1)}><Minus size={12} /></button>
                    <span className="fw-bold">{quantities[p.id] || 1}</span>
                    <button className="btn btn-sm border bg-white rounded-circle p-1" onClick={() => updateQty(p.id, 1)}><Plus size={12} /></button>
                  </div>
                </div>
                <button className="btn btn-black w-100 py-2 fw-bold rounded-3" onClick={() => handleOrder(p)}>Order Now</button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="col-12 text-center py-5 text-muted">No products available right now.</div>}
      </div>
    </div>
  );

  // ── ORDERS ────────────────────────────────────────────────────────────────
  const renderOrders = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">My Orders</h3>
      <p className="text-muted small mb-4">Track your product purchase history.</p>
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive px-4 pb-4 pt-3">
          <table className="table align-middle custom-table">
            <thead><tr className="text-muted small"><th>PRODUCT</th><th>DATE</th><th>QTY</th><th>STATUS</th><th className="text-end">AMOUNT</th></tr></thead>
            <tbody>
              {myOrders.map(o => (
                <tr key={o.id}>
                  <td className="fw-bold">{o.productName}</td>
                  <td className="small text-muted">{o.date}</td>
                  <td>{o.quantity}</td>
                  <td><span className={`badge-active px-3 py-1 ${o.status === 'cancelled' ? 'bg-danger text-white' : ''}`}>{(o.status || 'PENDING').toUpperCase()}</span></td>
                  <td className="text-end fw-bold">₹{o.total}</td>
                </tr>
              ))}
              {myOrders.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted small">No orders placed yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── NOTIFICATIONS ────────────────────────────────────────────────────────
  const renderNotifications = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-4">Notifications</h3>
      <div className="d-flex flex-column gap-3">
        {notifications.map(n => (
          <div key={n.id} className={`card border-0 shadow-sm rounded-4 p-4 ${n.unread ? 'bg-white border-start border-primary border-4' : 'bg-light'}`}>
            <div className="d-flex align-items-start gap-3">
              <div className={`stat-icon-box ${n.unread ? 'text-primary' : 'text-muted'}`}><Bell size={20} /></div>
              <div>
                <p className={`mb-0 ${n.unread ? 'fw-bold' : 'text-muted'}`}>{n.text}</p>
                <small className="text-muted">{n.time}</small>
              </div>
              {n.unread && <span className="badge bg-primary rounded-pill ms-auto">NEW</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── NAV LINK ──────────────────────────────────────────────────────────────
  const NavLink = ({ icon, label, active, onClick, badge }) => (
    <button onClick={onClick} className={`nav-link border-0 w-100 text-start d-flex align-items-center gap-3 py-3 px-3 rounded-4 transition-all ${active ? 'bg-primary text-white shadow-lg fw-bold' : 'text-muted bg-transparent hover-bg-light'}`}>
      {icon} <span className="flex-grow-1">{label}</span>
      {badge && <span className="badge bg-danger rounded-pill" style={{ fontSize: '10px' }}>{badge}</span>}
    </button>
  );

  return (
    <div className="d-flex dashboard-container vh-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="sidebar d-flex flex-column p-4 flex-shrink-0">
        <div className="brand mb-5 d-flex align-items-center gap-2">
          <div className="logo-icon bg-primary d-flex align-items-center justify-content-center text-white shadow-sm"><Droplet size={20} /></div>
          <div><h6 className="fw-bold mb-0">My Dairy</h6><small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>Customer Portal</small></div>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <NavLink icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavLink icon={<User size={20} />} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavLink icon={<Droplet size={20} />} label="Milk Data" active={activeTab === 'milkdata'} onClick={() => setActiveTab('milkdata')} />
          <NavLink icon={<ShoppingBag size={20} />} label="Shop" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
          <NavLink icon={<ClipboardList size={20} />} label="My Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <NavLink icon={<Receipt size={20} />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          <NavLink icon={<CreditCard size={20} />} label="Pay UPI" active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} />
          <NavLink icon={<Bell size={20} />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={unreadCount > 0 ? unreadCount : null} />
        </nav>

        <div className="mt-auto">
          <button className="btn btn-black w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm mb-4" onClick={() => setActiveTab('pay')}>
            <Zap size={18} /> Pay via UPI
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content flex-grow-1 p-4 overflow-auto bg-light bg-opacity-50">
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" className="form-control" placeholder="Search..." />
          </div>
          <div className="d-flex align-items-center gap-4">
            <div className="position-relative cursor-pointer" onClick={() => setActiveTab('notifications')}>
              <Bell className="text-muted" />
              {unreadCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>{unreadCount}</span>}
            </div>
            <div className="d-flex align-items-center gap-3 ps-3 border-start">
              <div className="text-end d-none d-md-block">
                <div className="fw-bold small">{customerData?.name}</div>
                <div className="text-muted extra-small">Customer</div>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${customerData?.name}&background=0D8ABC&color=fff`} className="avatar rounded-circle" alt="avatar" />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'milkdata' && renderMilkData()}
        {activeTab === 'shop' && renderShop()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'billing' && customerData && <BillingSummery customer={customerData} />}
        {activeTab === 'pay' && (
          <div className="animate-fade-in">
            {/* Payment Method Toggle */}
            <div className="d-flex gap-3 mb-5">
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold ${payMethod === 'razorpay' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setPayMethod('razorpay')}
              >
                💳 Card / Net Banking
              </button>
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold ${payMethod === 'upi' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setPayMethod('upi')}
              >
                📱 UPI QR Code
              </button>
            </div>

            {payMethod === 'razorpay' && (
              <RazorpayPayment
                amount={totalBill}
                customerName={customerData?.name}
                customerMobile={loggedInMobile}
                description={`Milk Bill – ${new Date().toLocaleString('default',{month:'long',year:'numeric'})}`}
                onSuccess={(pid) => alert(`✅ Payment successful! ID: ${pid}`)}
                onFailure={(err) => console.error('Payment failed:', err)}
              />
            )}
            {payMethod === 'upi' && (
              <UpiPayment
                amount={totalBill}
                upiId={milkmanDetails?.upiId || ''}
                payeeName={milkmanDetails?.name || 'Milkman'}
                description={`Milk Bill – ${new Date().toLocaleString('default',{month:'long',year:'numeric'})}`}
                onSuccess={async () => {
                  try {
                    const msg = `Dear ${milkmanDetails?.name || 'Milkman'}, customer ${customerData?.name} has initiated a UPI payment of Rs.${totalBill}.`;
                    await fetch(`${BASE_URL}/sms/send?mobile=${milkmanDetails?.mobile}&message=${encodeURIComponent(msg)}`, { method: 'POST' });
                  } catch (err) { console.error('SMS failed', err); }
                  alert('Payment notification sent to your milkman! ✅');
                }}
              />
            )}
          </div>
        )}
        {activeTab === 'notifications' && renderNotifications()}
      </main>
    </div>
  );
};

export default CustomerPortal;
