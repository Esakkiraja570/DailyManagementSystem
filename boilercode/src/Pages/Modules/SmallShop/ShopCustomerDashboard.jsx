import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Phone,
  ArrowRight,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Receipt,
  ChevronRight,
  LogOut,
  Star
} from 'lucide-react';

import { apiGet } from './smallshopApi';
import '../Milkman/Dashboard.css';
import ShopRazorpayPayment from './ShopRazorpayPayment';

const CustomerLogin = ({ onLogin }) => {
  const [customerMobile, setCustomerMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanMobile = customerMobile.trim();

    if (!cleanMobile || cleanMobile.length !== 10 || !/^\d+$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In this flow, we simply pass the mobile to the parent
      // The dashboard component will handle the actual validation via fetch
      onLogin(cleanMobile);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: 'linear-gradient(135deg,#f4f7fb 0%,#e8f0fe 100%)'
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 p-5"
        style={{ maxWidth: 420, width: '100%' }}
      >
        <div className="text-center mb-5">
          <div
            className="logo-icon bg-primary d-flex align-items-center justify-content-center text-white shadow mx-auto mb-4"
            style={{ width: 56, height: 56, borderRadius: 16 }}
          >
            <Store size={24} />
          </div>
          <h3 className="fw-bold mb-1">Customer Portal</h3>
          <p className="text-muted small">Access your bills & offers</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3 small mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted text-uppercase">
              Your Mobile Number
            </label>
            <div className="input-group-modern">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                className="form-control-modern"
                placeholder="9876543210"
                value={customerMobile}
                maxLength={10}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ShopCustomerDashboard = () => {
  const [customerMobile, setCustomerMobile] = useState(
    localStorage.getItem('custMobile') || ''
  );

  const [customer, setCustomer] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [billToPay, setBillToPay] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!customerMobile) return;
    setLoading(true);

    try {
      // 1. Fetch main dashboard data (Customer + Bills)
      // Note: Update URL if your backend port or path changed
      const res = await fetch(`http://localhost:1010/customer/dashboard/${customerMobile}`);
      
      if (!res.ok) {
         throw new Error('No account found with this mobile number');
      }
      
      const data = await res.json();
      setCustomer(data.customer);
      setBills(data.bills || []);

      const shopId = data.customer?.shopId;
      
      // 2. Fetch Shop specific details if shopId exists
      if (shopId) {
        try {
          const [productsRes, offersRes, profileRes] = await Promise.allSettled([
            apiGet(`/${shopId}/products`),
            apiGet(`/${shopId}/offers`),
            apiGet(`/${shopId}/profile`)
          ]);

          if (productsRes.status === 'fulfilled') setProducts(productsRes.value || []);
          if (offersRes.status === 'fulfilled') setOffers(offersRes.value || []);
          if (profileRes.status === 'fulfilled') setShopData(profileRes.value);
        } catch (e) {
          console.warn("Partial data fetch failed", e);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
      handleLogout(); // Force logout if customer record is missing
    } finally {
      setLoading(false);
    }
  }, [customerMobile]);

  useEffect(() => {
    if (customerMobile) {
      fetchDashboardData();
    }
  }, [customerMobile, fetchDashboardData]);

  const handleLogin = (mobile) => {
    localStorage.setItem('custMobile', mobile);
    setCustomerMobile(mobile);
  };

  const handleLogout = () => {
    localStorage.removeItem('custMobile');
    localStorage.clear(); // Clear all associated customer data
    setCustomerMobile('');
    setCustomer(null);
    setShopData(null);
    setBills([]);
    setProducts([]);
    setOffers([]);
  };

  if (!customerMobile) {
    return <CustomerLogin onLogin={handleLogin} />;
  }

  if (loading && !customer) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mb-3" size={48} />
          <p className="fw-bold text-muted">Loading Store...</p>
        </div>
      </div>
    );
  }

  const totalSpent = bills.reduce((total, bill) => total + (Number(bill.total) || 0), 0);

  const NavLink = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`nav-link border-0 w-100 text-start d-flex align-items-center gap-3 py-3 px-3 rounded-4 transition-all ${
        active ? 'bg-primary text-white shadow-lg fw-bold' : 'text-muted bg-transparent hover-bg-light'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="d-flex dashboard-container vh-100 overflow-hidden">
      <aside className="sidebar d-flex flex-column p-4 flex-shrink-0">
        <div className="brand mb-5 d-flex align-items-center gap-2">
          <div className="logo-icon bg-primary d-flex align-items-center justify-content-center text-white shadow-sm">
            <Store size={20} />
          </div>
          <div>
            <h6 className="fw-bold mb-0">{shopData?.shopName || 'Store'}</h6>
            <small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
              Customer Portal
            </small>
          </div>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <NavLink icon={<Store size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavLink icon={<Receipt size={20} />} label="Receipts" active={activeTab === 'receipts'} onClick={() => setActiveTab('receipts')} />
          <NavLink icon={<Star size={20} />} label="Offers" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
          <NavLink icon={<Package size={20} />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
        </nav>

        <div className="mt-auto">
          <button className="btn btn-outline-danger w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm" onClick={handleLogout}>
            <LogOut size={18} /> Switch Store
          </button>
        </div>
      </aside>

      <main className="main-content flex-grow-1 p-4 overflow-auto bg-light bg-opacity-50">
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div className="search-box invisible"><Search size={18} /></div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-bold small">{customer?.name || customerMobile}</div>
              <div className="text-muted extra-small">Customer</div>
            </div>
            <div className="avatar rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
              {(customer?.name || 'C').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="fw-bold">Welcome to {shopData?.shopName || 'Store'} 👋</h1>
            <p className="text-muted mb-5">Your personal portal</p>
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
                  <div className="d-flex justify-content-between mb-3">
                    <small className="text-muted fw-bold extra-small text-uppercase opacity-50">TOTAL SPENT</small>
                    <div className="stat-icon-box"><Receipt className="text-success" /></div>
                  </div>
                  <h3 className="fw-bold mb-0">₹{totalSpent.toLocaleString('en-IN')}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
                  <div className="d-flex justify-content-between mb-3">
                    <small className="text-muted fw-bold extra-small text-uppercase opacity-50">PURCHASES</small>
                    <div className="stat-icon-box"><ShoppingBag className="text-primary" /></div>
                  </div>
                  <h3 className="fw-bold mb-0">{bills.length} Bills</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-black text-white">
                  <div className="d-flex justify-content-between mb-3">
                    <small className="opacity-50 fw-bold extra-small text-uppercase">OFFERS</small>
                    <div className="stat-icon-box bg-white bg-opacity-10"><Star className="text-warning" /></div>
                  </div>
                  <h3 className="fw-bold mb-0">{offers.length}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="row g-4">
            {products.map((product, idx) => (
              <div key={product.id || idx} className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 product-card">
                  <div style={{ height: 140, background: '#f8fafc' }} className="d-flex align-items-center justify-content-center">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                        <Package size={40} className="text-muted opacity-25" />
                    )}
                  </div>
                  <div className="p-3">
                    <h6 className="fw-bold mb-1 text-truncate">{product.productName}</h6>
                    <p className="extra-small text-muted mb-2">{product.category || 'General'}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-primary fs-5">₹{product.price}</span>
                      <span className={`badge ${product.stock > 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <div className="col-12 text-center py-5 text-muted">No products available in this store</div>}
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="animate-fade-in">
            <h3 className="fw-bold mb-4">My Receipts</h3>
            {!billToPay ? (
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <table className="table align-middle custom-table">
                  <thead>
                    <tr className="text-muted small">
                      <th>BILL #</th>
                      <th>TOTAL</th>
                      <th className="text-end">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, index) => (
                      <tr key={bill.id || index}>
                        <td className="fw-bold text-primary">{bill.billNumber}</td>
                        <td className="fw-bold">₹{bill.total}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-primary rounded-pill px-4" onClick={() => setBillToPay(bill)}>
                            Pay Now
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bills.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-5 text-muted">No receipts found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="animate-fade-in mt-4">
                <button className="btn btn-sm btn-light mb-3 d-flex align-items-center gap-2" onClick={() => setBillToPay(null)}>
                  <ChevronRight size={16} className="rotate-180" /> Back
                </button>
                <ShopRazorpayPayment
                  amount={billToPay.total}
                  customerName={customer?.name || "Customer"}
                  customerMobile={customerMobile}
                  description={`Payment for Bill #${billToPay.billNumber}`}
                  onSuccess={() => {
                    alert('Payment Recorded Successfully!');
                    setBillToPay(null);
                    fetchDashboardData();
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="row g-4">
            {offers.map((offer, idx) => (
              <div className="col-md-6 col-lg-4" key={offer.id || idx}>
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                  <div className="badge bg-warning text-dark mb-3 d-inline-block px-3 py-1 rounded-pill fw-bold align-self-start">
                    Valid till {offer.validUntil}
                  </div>
                  <h5 className="fw-bold mb-2">{offer.offerName}</h5>
                  <p className="text-muted small mb-3">{offer.description}</p>
                  <div className="d-flex align-items-center gap-2 mt-auto pt-3 border-top">
                    <span className="fs-4 fw-bold text-success">{offer.discount}% OFF</span>
                  </div>
                </div>
              </div>
            ))}
            {offers.length === 0 && <div className="col-12 text-center py-5 text-muted">No active offers available</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopCustomerDashboard;