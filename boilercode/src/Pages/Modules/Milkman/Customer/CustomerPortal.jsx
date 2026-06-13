import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, User, Droplet, ShoppingBag, Receipt,
  Bell, Search, ChevronRight, Package,
  CreditCard, Zap, Loader2, ClipboardList, Phone, ArrowRight,
  MessageCircle, HelpCircle, LogOut, CheckCircle2, Clock, Send, Star, RefreshCcw
} from 'lucide-react';
import { BASE_URL } from '../milkmanApi';
import BillingSummery from '../BillingSummery';
import UpiPayment from './UpiPayment';
import RazorpayPayment from './RazorpayPayment';
import Productview from './Productview';
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
  const [payMethod, setPayMethod] = useState('razorpay'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Order History State (Moved to top level to comply with React Hooks rules)
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);

  const [notifications] = useState([
    { id: 1, text: 'Your bill this month is ready to view.', time: '2h ago', unread: true },
    { id: 2, text: 'New product added: Ghee 500ml', time: '1d ago', unread: true },
  ]);

  const fetchAll = useCallback(async (mob) => {
    const m = mob || loggedInMobile;
    if (!m) return;
    setLoading(true);
    try {
      let data = customerData;
      if (!data) {
        const res = await fetch(`${BASE_URL}/customer/login/${m}`);
        if (!res.ok) throw new Error('Not found');
        data = await res.json();
        setCustomerData(data);
      }

      const ROOT_URL = BASE_URL.replace('/api', '');
      const [entryRes, prodRes, promotedRes, orderRes, mRes] = await Promise.all([
        fetch(`${BASE_URL}/milk/${data.id}`),
        fetch(`${ROOT_URL}/product/list`),
        fetch(`${ROOT_URL}/product/customer/list`),
        fetch(`${ROOT_URL}/order/customer/${m}`),
        fetch(`${BASE_URL}/customer/milkman/${m}`)
      ]);

      // Handle Milk Entries
      if (entryRes.ok) {
        const eData = await entryRes.json();
        setEntries(Array.isArray(eData) ? eData : []);
      }

      // Handle Products (Logic: Combine regular and promoted)
      if (prodRes.ok) {
        const pData = await prodRes.json();
        const promData = promotedRes.ok ? await promotedRes.json() : [];
        
        // Combine and Deduplicate
        const allProds = [...(pData || []), ...(promData || [])];
        const uniqueProds = Array.from(new Map(allProds.map(p => [p.id, p])).values());

        const processedProds = uniqueProds
          .filter(x => x.promoted || x.milkmanMobile === data.milkmanMobile || !x.milkmanMobile)
          .map(p => {
            // Backend stores image as 'imagePath', not 'image'
            const rawPath = p.imagePath || p.image || null;
            let imageUrl = null;
            if (rawPath) {
              if (rawPath.startsWith('http')) {
                imageUrl = rawPath; // Already absolute URL
              } else {
                imageUrl = `${ROOT_URL}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
              }
            }
            return { ...p, image: imageUrl };
          });
        setProducts(processedProds);
      }

      // Handle Orders
      if (orderRes.ok) {
        const oData = await orderRes.json();
        setMyOrders(Array.isArray(oData) ? oData : []);
      }

      // Milkman details
      if (mRes.ok) setMilkmanDetails(await mRes.json());

    } catch (e) { 
      console.error("Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [customerData, loggedInMobile]);

  useEffect(() => { if (loggedInMobile) fetchAll(loggedInMobile); }, [loggedInMobile, fetchAll]);

  const handleLogin = (mobile, data) => {
    setCustomerData(data);
    setLoggedInMobile(mobile);
  };

  // ── CALCULATION LOGIC ─────────────────────────────────────────────────────
  const totalMilkL = entries.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);
  const totalMilkBill = entries.reduce((s, e) => s + ((parseFloat(e.total) || 0) * (parseFloat(e.price) || 60)), 0);
  const totalProductBill = myOrders
    .filter(o => o.status === 'DELIVERED')
    .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const totalBill = totalMilkBill + totalProductBill;
  const unreadCount = notifications.filter(n => n.unread).length;

  // eslint-disable-next-line no-unused-vars
  const updateQty = (id, d) => setQuantities(p => ({ ...p, [id]: Math.max(1, (p[id] || 1) + d) }));

  const handleOrder = async (product, qtyInput) => {
    const qty = qtyInput || quantities[product.id] || 1;
    try {
      const ROOT_URL = BASE_URL.replace('/api', '');
      const res = await fetch(`${ROOT_URL}/order/place`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id,
          productName: product.name,
          customerMobile: loggedInMobile, 
          quantity: qty,
          unitPrice: product.price,
          total: product.price * qty,
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (!res.ok) throw new Error('Failed');
      // Silently refresh data — Productview shows its own success state
      await fetchAll(loggedInMobile);
    } catch {
      throw new Error('Order could not be placed. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const ROOT_URL = BASE_URL.replace('/api', '');
      const res = await fetch(`${ROOT_URL}/order/reject/${orderId}`, { method: 'PUT' });
      if (res.ok) {
        fetchAll(loggedInMobile);
      } else {
        alert('Could not cancel order.');
      }
    } catch (e) { alert('Cancellation failed.'); }
  };

  const handleSendSupport = async (e) => {
    e.preventDefault();
    if (!supportMsg) return;
    setSendingSupport(true);
    try {
      const res = await fetch(`${BASE_URL}/sms/send?mobile=${milkmanDetails?.mobile}&message=${encodeURIComponent(`Support from ${customerData?.name}: ${supportMsg}`)}`, { method: 'POST' });
      if (res.ok) {
        alert('Message sent to Milkman! ✅');
        setSupportMsg('');
        setActiveTab('overview');
      }
    } catch (e) { alert('Failed to send message.'); }
    finally { setSendingSupport(false); }
  };

  if (loading && !customerData) return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mb-3" size={48} />
        <p className="fw-bold text-muted">Loading your portal...</p>
      </div>
    </div>
  );

  if (!loggedInMobile) return <CustomerLogin onLogin={handleLogin} />;

  // ── SUB-RENDER FUNCTIONS ──────────────────────────────────────────────────
  
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
            <div className="d-flex justify-content-between mb-3"><small className="opacity-50 fw-bold extra-small text-uppercase">QUICK PAY</small><div className="stat-icon-box bg-white bg-opacity-10"><Zap className="text-white" /></div></div>
            <h3 className="fw-bold mb-0">₹{totalBill.toFixed(0)}</h3>
            <button className="btn btn-light btn-sm w-100 mt-3 rounded-pill fw-bold" onClick={() => setActiveTab('pay')}>Pay Now</button>
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
                    <tr key={i}>
                      <td className="small">{e.date}</td>
                      <td>{e.morning || 0}L</td>
                      <td>{e.evening || 0}L</td>
                      <td className="fw-bold">{e.total}L</td>
                      <td className="text-end fw-bold">₹{((parseFloat(e.total)||0) * (parseFloat(e.price) || customerData?.price || 60)).toFixed(0)}</td>
                    </tr>
                  ))}
                  {entries.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted small">No entries yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <Star size={18} className="text-warning" fill="currentColor" /> Featured Products
          </h5>
          <div className="d-flex flex-column gap-2 mb-4">
            {products.filter(p => p.promoted).slice(0, 3).map(p => (
              <div key={p.id} className="action-item d-flex align-items-center justify-content-between p-3 bg-white rounded-4 shadow-sm cursor-pointer" onClick={() => { setSelectedProduct(p); setActiveTab('shop'); }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="action-icon-box bg-light rounded-3 p-1 overflow-hidden">
                    {p.image
                      ? <img src={p.image} alt="" style={{width: 32, height: 32, objectFit: 'cover', borderRadius: 6}} onError={(e)=>{e.target.onerror=null;e.target.src='https://placehold.co/32x32?text=P';}} />
                      : <Package size={20} />}
                  </div>
                  <div>
                    <div className="fw-bold small">{p.name}</div>
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-primary fw-bold">₹{p.price}</small>
                      <span className="badge bg-warning-light text-warning extra-small px-1">★</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted opacity-50" />
              </div>
            ))}
            {products.filter(p => p.promoted).length === 0 && <p className="text-muted small">No featured products yet.</p>}
            <button className="btn btn-link text-primary small fw-bold p-0 text-decoration-none" onClick={() => setActiveTab('shop')}>Browse Storefront <ArrowRight size={13}/></button>
          </div>

          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <ClipboardList size={18} className="text-success" /> Recent Orders
          </h5>
          <div className="d-flex flex-column gap-2">
            {myOrders.slice(0, 3).map((o, i) => {
              const unitP = parseFloat(o.unitPrice) || 0;
              const qty   = parseFloat(o.quantity) || 1;
              const lineT = parseFloat(o.total) > 0 ? parseFloat(o.total) : unitP * qty;
              const statusColor = o.status === 'DELIVERED' ? '#10b981' : o.status === 'ACCEPTED' ? '#3b82f6' : '#f59e0b';
              return (
                <div key={i} className="p-3 bg-white rounded-4 shadow-sm" style={{ borderLeft: `4px solid ${statusColor}` }}>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="fw-bold small text-truncate" style={{maxWidth: 130}}>{o.productName}</div>
                    <span className="extra-small fw-bold" style={{color: statusColor}}>{o.status || 'PENDING'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Qty: {qty}</small>
                    <small className="fw-bold">₹{lineT > 0 ? lineT.toFixed(0) : '—'}</small>
                  </div>
                </div>
              );
            })}
            {myOrders.length === 0 && <p className="text-muted small">No orders placed yet.</p>}
            <button className="btn btn-link text-muted small fw-bold p-0 text-decoration-none mt-1" onClick={() => setActiveTab('orders')}>All Orders <ArrowRight size={13}/></button>
          </div>
        </div>
      </div>
    </div>
  );

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
            ) : <div className="text-center py-4"><Loader2 className="animate-spin" /></div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderShop = () => {
    if (selectedProduct) {
      return (
        <Productview 
          product={selectedProduct} 
          onOrder={(p, q) => handleOrder(p, q)} 
          onBack={() => setSelectedProduct(null)} 
        />
      );
    }

    return (
      <div className="animate-fade-in">
        <h3 className="fw-bold mb-1">Storefront</h3>
        <p className="text-muted small mb-4">Fresh dairy products delivered to your door.</p>

        {/* Promoted Section */}
        {products.filter(p => p.promoted).length > 0 && (
          <div className="mb-5">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><Star size={18} className="text-warning" fill="currentColor" /> Featured for You</h5>
            <div className="row g-4">
              {products.filter(p => p.promoted).map(p => (
                <div key={p.id} className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow rounded-4 overflow-hidden bg-white h-100 product-card featured-border cursor-pointer" onClick={() => setSelectedProduct(p)}>
                    <div style={{ height: 160, background: '#f8fafc' }} className="d-flex align-items-center justify-content-center overflow-hidden position-relative">
                      <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2 shadow-sm fw-bold">★ FEATURED</span>
                      {p.stock <= 0 && <div className="out-of-stock-overlay">OUT OF STOCK</div>}
                      {p.image ? (
                        <img src={p.image} alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.stock <= 0 ? 0.5 : 1 }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x160?text=Product'; }}
                        />
                      ) : <Package size={50} className="opacity-25" />}
                    </div>
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold mb-0 text-truncate">{p.name}</h6>
                        <span className="fw-bold text-primary">₹{p.price}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="extra-small text-muted mb-0 text-truncate">{p.description || 'Pure & Fresh'}</p>
                        <span className={`extra-small fw-bold ms-2 flex-shrink-0 ${p.stock <= 5 ? 'text-danger' : 'text-success'}`}>
                          {p.stock > 0 ? `${p.stock} left` : 'Sold Out'}
                        </span>
                      </div>
                      <button
                        className="btn btn-warning w-100 py-2 fw-bold rounded-3 small text-dark"
                        disabled={p.stock <= 0}
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }}
                      >
                        {p.stock > 0 ? 'View & Order' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h5 className="fw-bold mb-3">All Products</h5>
        <div className="row g-4">
          {products.map(p => (
            <div key={p.id} className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 product-card cursor-pointer" onClick={() => setSelectedProduct(p)}>
                <div style={{ height: 160, background: '#f8fafc' }} className="d-flex align-items-center justify-content-center overflow-hidden position-relative">
                  {p.stock <= 0 && <div className="out-of-stock-overlay">OUT OF STOCK</div>}
                  {p.image ? (
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.stock <= 0 ? 0.5 : 1 }} 
                      onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/150?text=Product'; }}
                    />
                  ) : <Package size={50} className="opacity-25" />}
                </div>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="fw-bold mb-0 text-truncate" style={{maxWidth: '120px'}}>{p.name}</h6>
                    <span className="fw-bold text-primary">₹{p.price}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="extra-small text-muted mb-0 text-truncate">{p.description || 'Pure & Fresh'}</p>
                    <span className={`extra-small fw-bold ${p.stock <= 5 ? 'text-danger' : 'text-success'}`}>
                      {p.stock > 0 ? `${p.stock} left` : 'Sold Out'}
                    </span>
                  </div>
                  
                  <button className="btn btn-black-outline w-100 py-2 fw-bold rounded-3 small" onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }} disabled={p.stock <= 0}>
                    {p.stock > 0 ? 'View Details' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-12 text-center py-5">
              <Package size={48} className="text-muted opacity-25 mb-3" />
              <p className="text-muted">No products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const filtered = myOrders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesSearch = o.productName ? o.productName.toLowerCase().includes(orderSearch.toLowerCase()) : false;
      return matchesStatus && matchesSearch;
    });

    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Order History</h3>
            <p className="text-muted small mb-0">Track and manage your product purchases.</p>
          </div>
          <div className="d-flex gap-2 bg-light p-1 rounded-pill">
            {['ALL', 'PENDING', 'ACCEPTED', 'DELIVERED'].map(s => (
              <button key={s} className={`btn btn-sm rounded-pill px-3 fw-bold extra-small transition-all ${statusFilter === s ? 'bg-white shadow-sm text-dark' : 'text-muted border-0 bg-transparent'}`} onClick={() => setStatusFilter(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom bg-light bg-opacity-50">
            <div className="position-relative">
              <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input type="text" className="form-control form-control-sm ps-5 rounded-pill border-0 shadow-none" placeholder="Search products..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-responsive px-4 pb-4">
            <table className="table align-middle custom-table">
              <thead><tr className="text-muted small"><th>PRODUCT</th><th>DATE</th><th>QTY</th><th>STATUS</th><th className="text-end">ACTION</th></tr></thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <div className="fw-bold small">{o.productName}</div>
                      <div className="extra-small text-muted">₹{o.total} total</div>
                    </td>
                    <td className="small text-muted">{o.date || 'Today'}</td>
                    <td className="fw-bold small">{o.quantity}</td>
                    <td>
                      <span className={`badge-status px-2 py-1 extra-small ${
                        o.status === 'DELIVERED' ? 'bg-success-light text-success' : 
                        o.status === 'ACCEPTED' ? 'bg-info-light text-info' : 
                        o.status === 'REJECTED' || o.status === 'cancelled' ? 'bg-danger-light text-danger' : 
                        'bg-warning-light text-warning'
                      }`}>
                        {(o.status || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      {o.status === 'PENDING' && (
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3 extra-small fw-bold" onClick={() => handleCancelOrder(o.id)}>
                          Cancel
                        </button>
                      )}
                      {o.status === 'DELIVERED' && <CheckCircle2 size={16} className="text-success" />}
                      {o.status === 'ACCEPTED' && <Clock size={16} className="text-info" />}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted small">No orders matching your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── NAV LINK COMPONENT ──────────────────────────────────────────────────
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
          <div><h6 className="fw-bold mb-0">Dairy App</h6><small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>Customer</small></div>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <NavLink icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavLink icon={<User size={20} />} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavLink icon={<Droplet size={20} />} label="Milk Data" active={activeTab === 'milkdata'} onClick={() => setActiveTab('milkdata')} />
          <NavLink icon={<ShoppingBag size={20} />} label="Shop" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
          <NavLink icon={<ClipboardList size={20} />} label="My Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <NavLink icon={<Receipt size={20} />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          <NavLink icon={<CreditCard size={20} />} label="Pay UPI" active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} />
          <NavLink icon={<HelpCircle size={20} />} label="Help & Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
          <NavLink icon={<Bell size={20} />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={unreadCount > 0 ? unreadCount : null} />
        </nav>

        <div className="mt-auto">
          <button className="btn btn-black-outline w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3" onClick={() => { localStorage.clear(); window.location.reload(); }}>
            <LogOut size={18} /> Logout
          </button>
          <button className="btn btn-black w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm" onClick={() => setActiveTab('pay')}>
            <Zap size={18} /> Pay Bill
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content flex-grow-1 p-4 overflow-auto bg-light bg-opacity-50">
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="form-control border-0 bg-white" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center gap-4">
            <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => fetchAll(loggedInMobile)} disabled={loading}>
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="d-flex align-items-center gap-3 ps-3 border-start">
              <div className="text-end d-none d-md-block">
                <div className="fw-bold small">{customerData?.name}</div>
                <div className="text-muted extra-small">{customerData?.mobile}</div>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${customerData?.name}&background=0D8ABC&color=fff`} className="avatar rounded-circle shadow-sm" alt="avatar" />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
         {activeTab === 'milkdata' && (
          <div className="animate-fade-in">
             <h3 className="fw-bold mb-1">Consumption History</h3>
             <p className="text-muted small mb-4">Complete log of daily milk delivery.</p>
             <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <table className="table custom-table align-middle">
                    <thead><tr className="text-muted small"><th>DATE</th><th>MORNING</th><th>EVENING</th><th>TOTAL</th><th>RATE</th><th className="text-end">COST</th></tr></thead>
                    <tbody>
                        {entries
                          .filter(e => e.date.includes(searchTerm))
                          .map((e, i) => (
                            <tr key={i}>
                                <td>{e.date}</td><td>{e.morning}L</td><td>{e.evening}L</td><td className="fw-bold">{e.total}L</td><td>₹{e.price || customerData.price}/L</td>
                                <td className="text-end fw-bold">₹{(e.total * (e.price || customerData.price)).toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {entries.filter(e => e.date.includes(searchTerm)).length === 0 && (
                  <div className="text-center py-5 opacity-25">No entries found for "{searchTerm}"</div>
                )}
             </div>
          </div>
        )}
        {activeTab === 'support' && (
          <div className="animate-fade-in">
            <h3 className="fw-bold mb-1">Help & Support</h3>
            <p className="text-muted small mb-5">Need help? Message your milkman directly.</p>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <MessageCircle size={20} className="text-primary" /> Contact Milkman
                  </h5>
                  <form onSubmit={handleSendSupport}>
                    <div className="mb-4">
                      <label className="form-label fw-bold extra-small text-muted text-uppercase">Your Message</label>
                      <textarea 
                        className="form-control bg-light border-0 rounded-4 p-3" 
                        rows="4" 
                        placeholder="Hi, I wanted to ask about..."
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow d-flex align-items-center justify-content-center gap-2" disabled={sendingSupport}>
                      {sendingSupport ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {sendingSupport ? 'Sending...' : 'Send SMS Message'}
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4">
                  <h5 className="fw-bold mb-3">Quick FAQ</h5>
                  <div className="d-flex flex-column gap-3 mt-4">
                    <div className="bg-white bg-opacity-10 p-3 rounded-3">
                      <div className="fw-bold small mb-1">How do I pay?</div>
                      <div className="extra-small opacity-75">Go to "Pay UPI" tab and scan the QR code.</div>
                    </div>
                    <div className="bg-white bg-opacity-10 p-3 rounded-3">
                      <div className="fw-bold small mb-1">When is billing done?</div>
                      <div className="extra-small opacity-75">Bills are generated at the end of every month.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'shop' && renderShop()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'billing' && customerData && <BillingSummery customer={customerData} />}
        {activeTab === 'pay' && (
          <div className="animate-fade-in">
            <h3 className="fw-bold mb-4">Make a Payment</h3>
            <div className="d-flex gap-3 mb-5">
              <button className={`btn rounded-pill px-4 py-2 fw-bold ${payMethod === 'razorpay' ? 'btn-primary shadow' : 'btn-outline-secondary'}`} onClick={() => setPayMethod('razorpay')}>💳 Card / Net Banking</button>
              <button className={`btn rounded-pill px-4 py-2 fw-bold ${payMethod === 'upi' ? 'btn-primary shadow' : 'btn-outline-secondary'}`} onClick={() => setPayMethod('upi')}>📱 UPI QR Code</button>
            </div>

            {payMethod === 'razorpay' ? (
              <RazorpayPayment 
                amount={totalBill} customerName={customerData?.name} customerMobile={loggedInMobile} 
                description="Monthly Milk Bill" onSuccess={(pid) => alert(`Paid: ${pid}`)} 
              />
            ) : (
              <UpiPayment 
                amount={totalBill} upiId={milkmanDetails?.upiId} payeeName={milkmanDetails?.name} 
                description="Milk Bill Payment" 
                onSuccess={() => alert('Notification sent to milkman!')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;