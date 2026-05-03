import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Users, Box, Receipt, Plus, Settings,
  Search, Bell, Droplet, UserCheck, ClipboardList,
  Wallet, ChevronRight, TrendingUp, Loader2, Clock, CheckCircle2, X
} from 'lucide-react';
import { BASE_URL, getMilkmanMobile } from './milkmanApi';
import AddCustomers from './AddCustomers';
import NewProducts from './NewProducts';
import AddEntry from './AddEntry';
import BillingSummery from './BillingSummery';
import './Dashboard.css';

const MilkmanDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [milkmanData, setMilkmanData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalMilk: '0L', customers: 0, revenue: '₹0', pendingOrders: 0 });
  const milkmanMobile = getMilkmanMobile();

  const fetchDashboardData = useCallback(async () => {
    if (!milkmanMobile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const profileRes = await axios.get(`${BASE_URL}/milkman/me/${milkmanMobile}`);
      const profile = profileRes.data || {};
      setMilkmanData(profile);

      const custRes = await axios.get(`${BASE_URL}/customer/my/${milkmanMobile}`);
      const custList = custRes.data || [];
      setCustomers(custList);

      const ROOT_URL = BASE_URL.replace('/api', '');
      
      // Fetch Products
      const pRes = await axios.get(`${ROOT_URL}/product/list`);
      const filteredProds = (pRes.data || []).filter(p => !p.milkmanMobile || p.milkmanMobile === milkmanMobile);
      setProducts(filteredProds);

      // Since no "get all orders" endpoint exists, we fetch for each customer
      const orderPromises = custList.map(c => axios.get(`${ROOT_URL}/order/customer/${c.mobile}`));
      const orderResponses = await Promise.all(orderPromises);
      const allOrders = orderResponses.flatMap(r => r.data || []);
      
      // Sort orders by date/id to show newest first
      setOrders(allOrders.sort((a, b) => (b.id || 0) - (a.id || 0)));

      setStats({
        totalMilk: '450L',
        customers: custList.length,
        revenue: `₹${custList.length * (profile?.price || 60) * 15}`,
        pendingOrders: allOrders.filter(o => o.status === 'PENDING').length
      });

    } catch (err) {
      console.error('Dashboard Load Error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [milkmanMobile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const [newPrice, setNewPrice] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);

  const handleUpdatePrice = async (e) => {
    e.preventDefault();

    if (!newPrice || Number(newPrice) <= 0) {
      return alert("Enter valid price");
    }

    setUpdatingPrice(true);
    try {
      await axios.put(`${BASE_URL}/milkman/update-price/${milkmanMobile}?price=${newPrice}`);
      alert("Market rate updated successfully! ✅");

      setNewPrice('');
      fetchDashboardData();
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert("Failed to update rate.");
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleOrderAction = async (id, action) => {
    try {
      const ROOT_URL = BASE_URL.replace('/api', '');
      await axios.put(`${ROOT_URL}/order/${action}/${id}`);
      alert(`Order ${action}ed successfully! ✅`);
      fetchDashboardData();
    } catch (e) { alert(`Failed to ${action} order.`); }
  };

  const renderOverview = () => (
    <div className="animate-fade-in">
      <h1 className="fw-bold">Hello, {milkmanData?.name || 'Milkman'}</h1>
      <p className="text-muted mb-5">Here is what is happening with your dairy route today.</p>

      <div className="row g-4 mb-5">
        <StatCard title="TOTAL MILK TODAY" value={stats.totalMilk} trend="+12%" icon={<Droplet className="text-info" />} />
        <StatCard title="ACTIVE CUSTOMERS" value={stats.customers} trend="+5%" icon={<UserCheck className="text-primary" />} />
        <StatCard title="PENDING ORDERS" value={stats.pendingOrders} badge={stats.pendingOrders > 0 ? "NEW" : null} icon={<ClipboardList className="text-danger" />} onClick={() => setActiveTab('orders')} />
        <StatCard title="MONTHLY REVENUE" value={stats.revenue} trend="+8%" icon={<Wallet className="text-success" />} />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white p-4 border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Route Registry</h5>
              <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => setActiveTab('customers')}>View All</button>
            </div>
            <div className="table-responsive px-4 pb-4">
              <table className="table align-middle custom-table">
                <thead>
                  <tr className="text-muted small"><th>CUSTOMER</th><th>ADDRESS</th><th>PRICE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                  {customers.slice(0, 5).map(c => (
                    <tr key={c.id} className="cursor-pointer hover-bg-light transition-all" onClick={() => { setSelectedCustomer(c); setActiveTab('entry'); }}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-small-text">{c?.name ? c.name.charAt(0) : 'U'}</div>
                          <div>
                            <div className="fw-bold">{c?.name || 'Unknown'}</div>
                            <small className="text-muted">{c?.mobile}</small>
                          </div>
                        </div>
                      </td>
                      <td><small className="text-muted">{c?.address}</small></td>
                      <td><span className="fw-bold">₹{milkmanData?.price || 60}/L</span></td>
                      <td><span className="badge-active px-3 py-1">ACTIVE</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && <div className="text-center p-5 opacity-25">No customers registered.</div>}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <h5 className="fw-bold mb-4">Quick Actions</h5>
          <div className="d-flex flex-column gap-3 mb-4">
            <ActionItem icon={<UserCheck size={20} />} label="Add New Customer" onClick={() => setActiveTab('add-customer')} />
            <ActionItem icon={<Box size={20} />} label="Add New Product" onClick={() => setActiveTab('inventory')} />
            <ActionItem icon={<ClipboardList size={20} />} label="Manage Orders" sub={`${stats.pendingOrders} PENDING`} dot={stats.pendingOrders > 0} onClick={() => setActiveTab('orders')} />
          </div>
        </div>
      </div>
    </div>
  );



  const renderOrders = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">Manage Product Orders</h3>
      <p className="text-muted small mb-4">Accept and deliver customer product requests.</p>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive px-4 pb-4 pt-3">
          <table className="table align-middle custom-table">
            <thead>
              <tr className="text-muted small"><th>PRODUCT</th><th>CUSTOMER</th><th>DATE</th><th>QTY</th><th>IN STOCK</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const product = products.find(p => p.name === o.productName);
                return (
                <tr key={o.id}>
                  <td><div className="fw-bold">{o.productName}</div><small className="extra-small text-muted">₹{o.total}</small></td>
                  <td><div className="fw-bold small">{o.customerMobile}</div></td>
                  <td className="small text-muted">{o.date || 'Today'}</td>
                  <td className="fw-bold">{o.quantity}</td>
                  <td>
                    <span className={`fw-bold small ${(!product || product.stock < o.quantity) ? 'text-danger' : 'text-muted'}`}>
                      {product ? product.stock : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status px-3 py-1 ${
                      o.status === 'DELIVERED' ? 'bg-success-light text-success' : 
                      o.status === 'ACCEPTED' ? 'bg-info-light text-info' :
                      o.status === 'REJECTED' || o.status === 'cancelled' ? 'bg-danger-light text-danger' :
                      'bg-warning-light text-warning'
                    }`}>
                      {o.status === 'PENDING' ? <Clock size={12} className="me-1"/> : 
                       o.status === 'DELIVERED' ? <CheckCircle2 size={12} className="me-1"/> : 
                       o.status === 'REJECTED' ? <X size={12} className="me-1"/> : null}
                      {(o.status || 'PENDING').toUpperCase()}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {o.status === 'PENDING' && (
                        <>
                          <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold small" onClick={() => handleOrderAction(o.id, 'accept')}>Accept</button>
                          <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold small" onClick={() => handleOrderAction(o.id, 'reject')}>Reject</button>
                        </>
                      )}
                      {o.status === 'ACCEPTED' && (
                        <button className="btn btn-success btn-sm rounded-pill px-3 fw-bold small" onClick={() => handleOrderAction(o.id, 'deliver')}>Deliver</button>
                      )}
                      {o.status === 'DELIVERED' && <span className="text-success small fw-bold"><CheckCircle2 size={16} /> Completed</span>}
                    </div>
                  </td>
                </tr>
                );
              })}
              {orders.length === 0 && <div className="text-center p-5 opacity-25">No orders found.</div>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomerList = (title, subtitle, onRowClick) => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">{title}</h3>
      <p className="text-muted small mb-4">{subtitle}</p>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive px-4 pb-4 pt-3">
          <table className="table align-middle custom-table">
            <thead>
              <tr className="text-muted small"><th>CUSTOMER</th><th>ADDRESS</th><th>PHONE</th><th>RATE</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="cursor-pointer hover-bg-light transition-all" onClick={() => onRowClick(c)}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-small-text">{c.name.charAt(0)}</div>
                      <div className="fw-bold">{c.name}</div>
                    </div>
                  </td>
                  <td><small className="text-muted">{c.address}</small></td>
                  <td><small className="text-muted">{c.mobile}</small></td>
                  <td><span className="fw-bold">₹{milkmanData?.price || 60}/L</span></td>
                  <td><span className="badge-active px-3 py-1">ACTIVE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <div className="text-center p-5 opacity-25">No customers found.</div>}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-4">Dashboard Settings</h3>
      <div className="row">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> Update Market Rate
            </h5>
            <p className="text-muted small mb-4">Set the global per-liter milk price. This rate will be used for all newly added entries and automated billing calculations.</p>

            <form onSubmit={handleUpdatePrice}>
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Current Rate (₹/L)</label>
                <div className="input-group-modern">
                  <span className="fw-bold fs-4 text-primary">₹</span>
                  <input
                    type="number"
                    className="form-control-modern fs-4 text-dark bg-transparent"
                    placeholder={milkmanData?.price || 60}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-black w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={updatingPrice}
              >
                {updatingPrice ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                {updatingPrice ? 'Updating...' : 'Save New Rate'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mb-3" size={48} />
        <p className="fw-bold text-muted">Syncing with Dairy Cloud...</p>
      </div>
    </div>
  );

  return (
    <div className="d-flex dashboard-container vh-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="sidebar d-flex flex-column p-4 flex-shrink-0">
        <div className="brand mb-5 d-flex align-items-center gap-2">
          <div className="logo-icon bg-primary d-flex align-items-center justify-content-center text-white shadow-sm"><Droplet size={20} /></div>
          <div><h6 className="fw-bold mb-0">Executive Milk</h6><small className="text-muted text-uppercase small" style={{ fontSize: '10px' }}>Dairy Management</small></div>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <NavLink icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavLink icon={<Users size={20} />} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <NavLink icon={<ClipboardList size={20} />} label="Manage Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <NavLink icon={<Box size={20} />} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavLink icon={<Receipt size={20} />} label="Billing" active={activeTab === 'billing' || activeTab === 'billing-list'} onClick={() => setActiveTab('billing-list')} />
          <NavLink icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto">
          <button className="btn btn-black w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm mb-4" onClick={() => setActiveTab('add-customer')}>
            <Plus size={18} /> New Customer
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content flex-grow-1 p-4 overflow-auto bg-light bg-opacity-50">
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" className="form-control" placeholder="Search data..." />
          </div>
          <div className="d-flex align-items-center gap-4">
            <Bell className="text-muted cursor-pointer" />
            <div className="d-flex align-items-center gap-3 ps-3 border-start">
              <div className="text-end d-none d-md-block">
                <div className="fw-bold small">{milkmanData?.name}</div>
                <div className="text-muted extra-small">Route Manager</div>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${milkmanData?.name}&background=0D8ABC&color=fff`} className="avatar rounded-circle" alt="Profile" />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'customers' && renderCustomerList('All Customers', 'Select a customer to log their daily milk entry.', (c) => { setSelectedCustomer(c); setActiveTab('entry'); })}
        {activeTab === 'billing-list' && renderCustomerList('Billing Management', 'Select a customer to generate their monthly billing statement.', (c) => { setSelectedCustomer(c); setActiveTab('billing'); })}
        {activeTab === 'add-customer' && <AddCustomers onBack={() => setActiveTab('overview')} onSuccess={() => { fetchDashboardData(); setActiveTab('overview'); }} />}
        {activeTab === 'inventory' && <NewProducts onBack={() => setActiveTab('overview')} />}
        {activeTab === 'entry' && selectedCustomer && (
          <AddEntry
            customer={selectedCustomer}
            globalPrice={milkmanData?.price || 60}
            onBack={() => { setActiveTab('overview'); fetchDashboardData(); }}
            onViewBill={() => setActiveTab('billing')}
          />
        )}
        {activeTab === 'billing' && selectedCustomer && (
          <BillingSummery
            customer={selectedCustomer}
            onBack={() => setActiveTab('billing-list')}
          />
        )}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

// --- Helper Components ---

const NavLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`nav-link border-0 w-100 text-start d-flex align-items-center gap-3 py-3 px-3 rounded-4 transition-all ${active ? 'bg-primary text-white shadow-lg fw-bold' : 'text-muted bg-transparent hover-bg-light'}`}>
    {icon} <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, badge, icon }) => (
  <div className="col-md-3">
    <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
      <div className="d-flex justify-content-between mb-3 align-items-start">
        <small className="text-muted fw-bold extra-small text-uppercase opacity-50">{title}</small>
        <div className="stat-icon-box">{icon}</div>
      </div>
      <div className="d-flex align-items-end gap-2">
        <h3 className="fw-bold mb-0">{value}</h3>
        {trend && <span className="trend-badge text-success small">{trend}</span>}
        {badge && <span className="badge bg-danger rounded-pill extra-small">{badge}</span>}
      </div>
    </div>
  </div>
);

const ActionItem = ({ icon, label, sub, dot, onClick }) => (
  <div className="action-item d-flex align-items-center justify-content-between p-3 bg-white rounded-4 shadow-sm cursor-pointer hover-shadow border border-transparent hover-border-primary transition-all" onClick={onClick}>
    <div className="d-flex align-items-center gap-3">
      <div className="action-icon-box position-relative bg-light rounded-3 p-2">{icon}{dot && <span className="red-dot"></span>}</div>
      <div><div className="fw-bold small">{label}</div>{sub && <small className="text-danger fw-bold d-block extra-small">{sub}</small>}</div>
    </div>
    <ChevronRight size={18} className="text-muted opacity-50" />
  </div>
);

export default MilkmanDashboard;