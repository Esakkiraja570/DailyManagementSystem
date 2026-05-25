import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { custApiGet, custApiPut, apiGet } from './smallshopApi';
import { 
  User, 
  LogOut, 
  Loader2, 
  Receipt, 
  Store, 
  Edit2, 
  CheckCircle,
  Phone,
  Calendar,
  IndianRupee,
  MapPin,
  ShoppingBag,
  Package
} from 'lucide-react';
import './SmallShop.css';
import ShopRazorpayPayment from './ShopRazorpayPayment';

const ShopCustomerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [shopDetails, setShopDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  
  const phone = localStorage.getItem('custMobile') || JSON.parse(localStorage.getItem('smallshopCustomer') || '{}').mobile;

  useEffect(() => {
    if (!phone) {
      navigate('/select-role/smallshop');
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line
  }, [phone]);

  const fetchDashboard = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const shopId = localStorage.getItem('shopId') || new URLSearchParams(window.location.search).get('shopId');
      if (shopId && !localStorage.getItem('shopId')) {
        localStorage.setItem('shopId', shopId);
      }

      const cachedCustomer = JSON.parse(localStorage.getItem('smallshopCustomer') || '{}');
      setCustomer(cachedCustomer);
      setEditName(cachedCustomer?.name || '');

      let allBills = [];
      let sDetails = null;

      try {
        // HIT THE NEW BACKEND DASHBOARD API
        const dashboardRes = await custApiGet(`/dashboard/${phone}`);

        if (dashboardRes && dashboardRes.success === false) {
          throw new Error(dashboardRes.message || "Failed to load from backend");
        }
        
        // Extract bills from 'bills' (Map response) or 'orders' (DTO response)
        if (dashboardRes?.bills && Array.isArray(dashboardRes.bills)) {
          allBills = dashboardRes.bills;
        } else if (dashboardRes?.orders && Array.isArray(dashboardRes.orders)) {
          allBills = dashboardRes.orders;
        }

        // Extract Shop Info
        if (dashboardRes?.shop) {
          sDetails = dashboardRes.shop;
        } else if (dashboardRes?.shopDetails) {
          sDetails = dashboardRes.shopDetails;
        } else if (dashboardRes?.shopName) {
          sDetails = { shopName: dashboardRes.shopName };
        }

        // Update Customer details if the API returned fresh data
        if (dashboardRes?.customer) {
          setCustomer(prev => ({ ...prev, ...dashboardRes.customer }));
        } else if (dashboardRes?.customerName) {
           setCustomer(prev => ({ ...prev, name: dashboardRes.customerName, purchaseLevel: dashboardRes.purchaseLevel }));
        }

      } catch (err) {
        console.warn("Failed to hit main dashboard API. Running fallbacks...", err);
        // Fallback: Try fetching bills from other endpoints if dashboard throws 500
        try {
          const recentRes = await apiGet(`/${shopId}/recent-bills`);
          if (Array.isArray(recentRes)) {
            allBills = recentRes.filter(b => String(b.customerPhone) === String(phone) || String(b.customerId) === String(cachedCustomer?.customerId));
          }
        } catch (fallbackErr) {
          console.warn("Fallback failed.");
        }
      }

      setBills(allBills);

      // Final Shop Details Fallback if API returned null
      if (!sDetails) {
        const shopData = JSON.parse(localStorage.getItem('smallshop') || '{}');
        if (shopData && shopData.shopName) {
           sDetails = shopData;
        }
      }
      setShopDetails(sDetails);

      if (shopId) {
        try {
          const productsRes = await apiGet(`/${shopId}/products`);
          setProducts(Array.isArray(productsRes) ? productsRes : []);
        } catch (e) {
          console.warn('Failed to fetch products');
        }
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fully sync your dashboard details. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim()) return;
    setUpdatingName(true);
    try {
      await custApiPut('/update-name', { phone, name: editName });
      setCustomer(prev => ({ ...prev, name: editName }));
      setIsEditingName(false);
    } catch (err) {
      alert('Failed to update name: ' + err.message);
    } finally {
      setUpdatingName(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('custMobile');
    localStorage.removeItem('smallshopCustomer');
    navigate('/select-role/smallshop');
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="text-center">
          <Loader2 className="spinner text-primary mb-3" size={48} />
          <h5 className="fw-bold text-muted">Loading your portal...</h5>
        </div>
      </div>
    );
  }

  const totalSpent = bills.reduce((acc, bill) => acc + (bill.totalAmount || bill.amount || bill.total || 0), 0);

  return (
    <div className="shop-dashboard-wrapper bg-light min-vh-100 d-flex flex-column">
      
      {/* ─── NAVBAR ────────────────────────────────────────────── */}
      <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3 sticky-top z-10">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary rounded-circle p-2 text-white">
            <User size={24} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 lh-1">Customer Portal</h5>
            <small className="text-muted" style={{ fontSize: '11px' }}>Powered by ShopManager</small>
          </div>
        </div>
        
        <button className="btn btn-light rounded-pill px-3 py-2 d-flex align-items-center gap-2 text-danger fw-semibold shadow-sm" onClick={handleLogout}>
          <LogOut size={16} /> <span className="d-none d-md-inline">Logout</span>
        </button>
      </nav>

      {/* ─── TABS ──────────────────────────────────────────────── */}
      <div className="bg-white border-bottom px-4 pt-3 mb-4">
        <div className="container">
          <div className="d-flex gap-4 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
            {['overview', 'store', 'payment'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn border-0 pb-3 rounded-0 px-1 fw-bold text-capitalize ${activeTab === tab ? 'text-primary border-bottom border-primary border-3' : 'text-muted bg-transparent'}`}
              >
                {tab === 'overview' ? 'My Profile & Bills' : tab === 'store' ? 'Browse Products' : 'Pay Bill'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="container pb-5 flex-grow-1">
        
        {errorMsg && (
          <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-4">
            {errorMsg}
          </div>
        )}

        {/* =======================================================
            OVERVIEW TAB 
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="row g-4 animate-fade-in">
            {/* ─── LEFT COL: PROFILE & SHOP INFO ─────────────────── */}
            <div className="col-lg-4">
              
              {/* PROFILE CARD */}
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
                <div className="bg-primary p-4 text-center text-white position-relative">
                  <div className="bg-white rounded-circle p-1 d-inline-block shadow-sm mb-2">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${customer?.name || 'User'}&background=random&color=fff&size=80`} 
                      alt="avatar" 
                      className="rounded-circle"
                    />
                  </div>
                  {isEditingName ? (
                    <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                      <input 
                        type="text" 
                        className="form-control form-control-sm text-center w-75 rounded-pill border-0" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <button 
                        className="btn btn-success btn-sm rounded-circle p-1 d-flex align-items-center shadow-sm"
                        onClick={handleUpdateName}
                        disabled={updatingName}
                      >
                        {updatingName ? <Loader2 size={14} className="spinner" /> : <CheckCircle size={14} />}
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                      <h5 className="fw-bold mb-0">{customer?.name || 'Add Name'}</h5>
                      <button className="btn btn-link text-white p-0 opacity-75 hover-opacity-100" onClick={() => setIsEditingName(true)}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="mb-0 opacity-75 small mt-1 d-flex align-items-center justify-content-center gap-1">
                    <Phone size={14} /> {customer?.mobile || phone}
                  </p>
                </div>
                
                <div className="p-4">
                  <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '12px' }}>Summary</h6>
                  <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white p-2 rounded-circle shadow-sm text-primary">
                        <Receipt size={18} />
                      </div>
                      <span className="fw-semibold">Total Bills</span>
                    </div>
                    <span className="fw-bold fs-5">{bills.length}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white p-2 rounded-circle shadow-sm text-success">
                        <IndianRupee size={18} />
                      </div>
                      <span className="fw-semibold">Total Spent</span>
                    </div>
                    <span className="fw-bold fs-5 text-success">₹{totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* SHOP DETAILS CARD (ALWAYS RENDER WITH FALLBACK) */}
              <div className="card border-0 shadow-sm rounded-4 bg-white">
                <div className="p-4 border-bottom">
                  <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <Store size={18} className="text-primary" /> My Connected Shop
                  </h6>
                </div>
                <div className="p-4">
                  <h5 className="fw-bold mb-3 text-primary">{shopDetails?.shopName || shopDetails?.name || 'Local Shop Details'}</h5>
                  <div className="d-flex flex-column gap-3 text-muted small">
                    {shopDetails?.ownerName && (
                      <div className="d-flex align-items-center gap-2">
                        <User size={16} /> <span>Owner: {shopDetails.ownerName}</span>
                      </div>
                    )}
                    {(shopDetails?.mobile || localStorage.getItem('shopId')) && (
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={16} /> <span>{shopDetails?.mobile || localStorage.getItem('shopId')}</span>
                      </div>
                    )}
                    {shopDetails?.city && (
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={16} /> <span>{shopDetails.area}, {shopDetails.city}</span>
                      </div>
                    )}
                    {!shopDetails?.shopName && (
                      <p className="text-muted opacity-50 mb-0">Shop profile information is limited at the moment.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* ─── RIGHT COL: BILLS HISTORY ──────────────────────── */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <Receipt size={20} className="text-primary" /> Recent Bills
                  </h5>
                  <span className="badge bg-primary text-white rounded-pill px-3 py-2 shadow-sm">
                    {bills.length} Bills
                  </span>
                </div>
                
                <div className="p-0">
                  {bills.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 custom-table">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3 text-muted text-uppercase fw-bold" style={{ fontSize: '11px' }}>Bill #</th>
                            <th className="py-3 text-muted text-uppercase fw-bold" style={{ fontSize: '11px' }}>Date</th>
                            <th className="py-3 text-muted text-uppercase fw-bold" style={{ fontSize: '11px' }}>Items</th>
                            <th className="px-4 py-3 text-end text-muted text-uppercase fw-bold" style={{ fontSize: '11px' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map((bill, index) => {
                            const dateObj = bill.createdAt || bill.date ? new Date(bill.createdAt || bill.date) : new Date();
                            const itemsCount = bill.items?.length || bill.totalItems || 0;
                            return (
                              <tr key={bill.id || index} style={{ cursor: 'pointer' }}>
                                <td className="px-4 py-3 fw-semibold text-primary">#{bill.id || (index + 1000)}</td>
                                <td className="py-3">
                                  <div className="d-flex align-items-center gap-2 text-muted small">
                                    <Calendar size={14} /> {dateObj.toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className="badge bg-light text-dark border">
                                    <ShoppingBag size={12} className="me-1" /> {itemsCount} items
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-end fw-bold">
                                  ₹{(bill.totalAmount || bill.amount || bill.total || 0).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <Receipt size={40} className="text-muted opacity-50" />
                      </div>
                      <h5 className="fw-bold text-muted">No Bills Yet</h5>
                      <p className="text-muted small">Your purchases will appear here.</p>
                      <button className="btn btn-outline-primary mt-3 px-4 rounded-pill fw-bold" onClick={() => setActiveTab('store')}>
                        Browse Products
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* =======================================================
            STORE TAB (PRODUCTS)
        ======================================================== */}
        {activeTab === 'store' && (
          <div className="animate-fade-in">
            <h4 className="fw-bold mb-4">Shop Products</h4>
            {products.length > 0 ? (
              <div className="row g-4">
                {products.map(p => (
                  <div key={p.id || p.productId} className="col-md-4 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
                      <div className="bg-light d-flex align-items-center justify-content-center position-relative" style={{ height: '140px' }}>
                        <Package size={48} className="text-muted opacity-25" />
                        <span className="badge bg-white text-primary fw-bold shadow-sm position-absolute bottom-0 start-0 m-2 px-2 py-1">
                          ₹{p.price || p.productPrice}
                        </span>
                      </div>
                      <div className="p-3">
                        <h6 className="fw-bold mb-1 text-truncate">{p.productName || p.name}</h6>
                        <p className="text-muted extra-small mb-3 text-truncate">{p.description || 'Quality product'}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className={`extra-small fw-bold ${p.stock <= 5 ? 'text-danger' : 'text-success'}`}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm border-0">
                <Package size={48} className="text-muted opacity-25 mb-3" />
                <h5 className="fw-bold text-muted">No Products Found</h5>
                <p className="text-muted small">The shop owner hasn't listed any products yet.</p>
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            PAYMENT TAB
        ======================================================== */}
        {activeTab === 'payment' && (
          <div className="animate-fade-in d-flex justify-content-center">
            <div className="w-100" style={{ maxWidth: '600px' }}>
              <ShopRazorpayPayment 
                amount={totalSpent > 0 ? totalSpent : 1} 
                customerName={customer?.name || 'Customer'}
                customerMobile={customer?.mobile || phone}
                description={`Bill Payment for ${shopDetails?.shopName || 'Shop'}`}
                onSuccess={(payment) => {
                  alert(`Payment Successful! ID: ${payment.paymentId}`);
                  setActiveTab('overview');
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopCustomerDashboard;
