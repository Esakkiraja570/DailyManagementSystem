import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Package, Receipt, Tag,
  Store, TrendingUp, Loader2, Bell, Search,
  ShoppingCart, LogOut, AlertTriangle, ExternalLink,
} from 'lucide-react';

import { getShopId, getShopProfile, apiGet } from './smallshopApi';
import { useToast }       from './useToast';
import { Toast }          from './ShopUI';
import BillingPOS         from './BillingPOS';
import InventoryManager   from './InventoryManager';
import CustomerManager    from './CustomerManager';
import OfferManager       from './OfferManager';
import './SmallShop.css';
import { useNavigate } from 'react-router-dom';

// Helper: wrap toast hook into a plain object for child components
const makeToast = (hook) => ({ 
    success: hook.success, 
    error: hook.error, 
    warning: hook.warning 
});

// ─── Mini Stat Card ───────────────────────────────────────────
const StatCard = ({ title, value, sub, icon, accent, onClick }) => (
  <div onClick={onClick} style={{
    background: '#fff', borderRadius: 16, padding: 22,
    border: '1px solid #e2e8f0', cursor: onClick ? 'pointer' : 'default',
    transition: 'all .25s', position: 'relative', overflow: 'hidden',
  }}
    onMouseEnter={e => { if(onClick) { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(0,0,0,.10)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
  >
    <div style={{ position: 'absolute', top: 18, right: 18, width: 44, height: 44, borderRadius: 12, background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
      {icon}
    </div>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 10 }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>}
  </div>
);

// ─── Nav Link ─────────────────────────────────────────────────
const NavLink = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 11,
    padding: '11px 14px', borderRadius: 11, border: 'none',
    background: active ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : 'transparent',
    color: active ? '#fff' : '#64748b',
    fontWeight: active ? 700 : 500, fontSize: 14,
    cursor: 'pointer', transition: 'all .22s',
    width: '100%', textAlign: 'left',
    boxShadow: active ? '0 4px 14px rgba(37,99,235,.28)' : 'none',
  }}
    onMouseEnter={e => { if(!active) { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#2563eb'; }}}
    onMouseLeave={e => { if(!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748b'; }}}
  >
    {icon}
    <span style={{ flex: 1 }}>{label}</span>
    {badge > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 20 }}>{badge}</span>}
  </button>
);

// ─── Overview Dashboard ───────────────────────────────────────
const Overview = ({ shopProfile, salesReport, customers, products, offers, recentBills, lowStock, setActiveTab, shopId }) => {
  const totalRevenue   = Number(salesReport?.totalRevenue || 0);
  const totalSales     = Number(salesReport?.totalSales || recentBills.length);

  // Mini bar chart data logic
  const weekData = salesReport?.weekRevenue || [0,0,0,0,0,0,0];
  const maxBar = Math.max(...weekData, 1);
  const days = ['M','T','W','T','F','S','S'];

  const shareStoreLink = () => {
    const url = `${window.location.origin}/smallshop/customer?shopId=${shopId}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Store link copied to clipboard! Share it with your customers on WhatsApp.');
    });
  };

  return (
    <div className="ss-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 900, fontSize: 26, marginBottom: 4 }}>Hello, {shopProfile?.ownerName || 'Shop Owner'} 👋</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Here is what's happening with <strong>{shopProfile?.shopName}</strong> today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
        <StatCard title="Total Revenue"     value={`₹${totalRevenue.toLocaleString('en-IN')}`}  sub={`${totalSales} bills generated`} icon={<TrendingUp size={22}/>}   accent="#10b981" />
        <StatCard title="Total Customers"   value={customers.length}                                  sub="Registered shoppers"                                         icon={<Users size={22}/>}       accent="#2563eb" />
        <StatCard title="Active Offers"     value={offers.length}                                     sub="Running promotions"                                          icon={<Tag size={22}/>}         accent="#f59e0b" onClick={() => setActiveTab('offers')} />
        <StatCard title="Low Stock Items"   value={lowStock.length}                                   sub="Need restocking"                                             icon={<ShoppingCart size={22}/>} accent="#ef4444" onClick={() => setActiveTab('inventory')} />
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTab('inventory')}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span style={{ fontWeight: 600, fontSize: 14, color: '#854d0e' }}>
            {lowStock.length} products are running low on stock — click to restock
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Recent Sales */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ fontWeight: 800, fontSize: 15 }}>Recent Bills</h5>
            <button onClick={() => setActiveTab('billing')} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ New Bill</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['BILL #','CUSTOMER','ITEMS','AMOUNT','STATUS'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBills.slice(0, 6).map((b, i) => (
                  <tr key={b.id || i} style={{ borderTop: '1px solid #f8fafc' }}>
                    <td style={{ padding: '13px 18px', fontWeight: 700, color: '#2563eb', fontSize: 13 }}>{b.billNumber || `#${i+1}`}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{b.customerName || 'Walk-in'}</div>
                      {b.customerPhone && <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.customerPhone}</div>}
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: '#64748b' }}>{b.items?.length || 0} items</td>
                    <td style={{ padding: '13px 18px', fontWeight: 800, fontSize: 14 }}>₹{Number(b.total || 0).toFixed(0)}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534' }}>{b.paymentStatus || 'PAID'}</span>
                    </td>
                  </tr>
                ))}
                {recentBills.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No bills found. Create your first bill in the Billing tab!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Mini Chart */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
            <h6 style={{ fontWeight: 800, marginBottom: 16, fontSize: 14 }}>This Week's Revenue</h6>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 8 }}>
              {weekData.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div title={`₹${v}`} style={{ width: '100%', height: `${(v / maxBar) * 70}px`, background: 'linear-gradient(180deg,#2563eb,#93c5fd)', borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height .4s' }} />
                  <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{days[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>Total: <strong>₹{weekData.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}</strong></div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
            <h6 style={{ fontWeight: 800, marginBottom: 14, fontSize: 14 }}>Quick Actions</h6>
            {[
              { label: 'Create New Bill', icon: <Receipt size={18}/>, accent: '#2563eb', onClick: () => setActiveTab('billing') },
              { label: 'Add Product',     icon: <Package size={18}/>, accent: '#10b981', onClick: () => setActiveTab('inventory') },
              { label: 'New Offer',       icon: <Tag size={18}/>,     accent: '#f59e0b', onClick: () => setActiveTab('offers') },
              { label: 'Share Store Link',icon: <ExternalLink size={18}/>, accent: '#7c3aed', onClick: shareStoreLink },
            ].map(({ label, icon, accent, onClick }) => (
              <div key={label} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 6, transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.transform='translateX(3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='none'; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: accent + '18', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 16 }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────
const ShopDashboard = () => {
  const navigate = useNavigate();
  const toastHook = useToast();
  const { toast } = toastHook;
  const toastObj = makeToast(toastHook);

  const [activeTab, setActiveTab]     = useState('overview');
  const [shopId]                      = useState(getShopId());
  const [shopProfile, setShopProfile] = useState(getShopProfile());

  const [products,    setProducts]    = useState([]);
  const [customers,   setCustomers]   = useState([]);
  const [offers,      setOffers]      = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [salesReport, setSalesReport] = useState({});
  const [lowStock,    setLowStock]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = useCallback(async () => {
    if (!shopId) { navigate('/select-module'); return; }
    setLoading(true);
    
    try {
        const [prods, custs, offs, bills, rep, lowStk] = await Promise.all([
          apiGet(`/${shopId}/products`).catch(()   => []),
          apiGet(`/${shopId}/customers`).catch(()  => []),
          apiGet(`/${shopId}/offers`).catch(()     => []),
          apiGet(`/${shopId}/recent-bills`).catch(()=> []),
          apiGet(`/${shopId}/sales-report`).catch(()=> ({})),
          apiGet(`/${shopId}/products/low-stock`).catch(()=> []),
        ]);

        setProducts(prods);
        setCustomers(custs);
        setOffers(offs);
        setRecentBills(bills);
        setSalesReport(rep);
        setLowStock(lowStk);

        // Sync profile
        const local = localStorage.getItem('smallshop');
        if (local) setShopProfile(JSON.parse(local));
    } catch (e) {
        toastObj.error("Failed to sync some store data");
    } finally {
        setLoading(false);
    }
  }, [shopId, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => {
    localStorage.clear(); // Standard approach
    navigate('/');
  };

  const filteredProducts = products.filter(p =>
    (p.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: <LayoutDashboard size={19}/> },
    { id: 'billing',    label: 'Billing',    icon: <Receipt size={19}/>  },
    { id: 'inventory',  label: 'Inventory',  icon: <Package size={19}/>  },
    { id: 'customers',  label: 'Customers',  icon: <Users size={19}/>    },
    { id: 'offers',     label: 'Offers',     icon: <Tag size={19}/>      },
  ];

  if (loading && !products.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f4f7fb', flexDirection: 'column', gap: 16 }}>
      <Loader2 size={42} color="#2563eb" className="ss-spin" />
      <p style={{ color: '#64748b', fontWeight: 600 }}>Loading your store...</p>
    </div>
  );

  return (
    <div className="ss-app" style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 265, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '26px 18px', flexShrink: 0, zIndex: 10, boxShadow: '4px 0 24px rgba(0,0,0,.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 32 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 16px rgba(37,99,235,.35)', flexShrink: 0 }}>
            <Store size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', lineHeight: 1.2 }}>{shopProfile?.shopName || 'Merchant Portal'}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontWeight: 700 }}>Management Hub</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(t => <NavLink key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} badge={t.id === 'inventory' ? lowStock.length : 0} />)}
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff5f5', color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'radial-gradient(circle at top right,#eef2ff 0%,#f4f7fb 60%)' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search store inventory..."
              style={{ paddingLeft: 40, height: 44, borderRadius: 22, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', width: 280, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button title="Notifications" style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', position: 'relative' }}>
              <Bell size={20} />
              {lowStock.length > 0 && <span style={{ position: 'absolute', top: 9, right: 9, width: 9, height: 9, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: '6px 14px 6px 6px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(shopProfile?.shopName || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.1 }}>{shopProfile?.ownerName || 'Merchant'}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <div className="tab-container">
            {activeTab === 'overview' && (
              <Overview
                shopProfile={shopProfile} salesReport={salesReport}
                customers={customers} products={products} offers={offers}
                recentBills={recentBills} lowStock={lowStock}
                setActiveTab={setActiveTab} shopId={shopId}
              />
            )}
            {activeTab === 'billing' && (
              <BillingPOS shopId={shopId} products={searchQuery ? filteredProducts : products} refresh={fetchAll} shopProfile={shopProfile} toast={toastObj} />
            )}
            {activeTab === 'inventory' && (
              <InventoryManager shopId={shopId} products={searchQuery ? filteredProducts : products} refresh={fetchAll} toast={toastObj} />
            )}
            {activeTab === 'customers' && (
              <CustomerManager customers={customers} shopId={shopId} />
            )}
            {activeTab === 'offers' && (
              <OfferManager shopId={shopId} offers={offers} refresh={fetchAll} customers={customers} toast={toastObj} />
            )}
        </div>
      </main>

      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
};

export default ShopDashboard;