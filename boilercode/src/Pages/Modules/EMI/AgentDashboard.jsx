import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../Components/DashboardLayout';
import { 
  Briefcase, CheckSquare, AlertTriangle, Plus, Trash2, Loader2, 
  Search, X, DollarSign, History, Send, Settings, Users
} from 'lucide-react';

const BASE_URL = "http://localhost:1010";

const AgentDashboard = () => {
  const [agentData, setAgentData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, OVERDUE, COMPLETED

  // Selected Customer for Details
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lateFeePerDay, setLateFeePerDay] = useState(0);
  const [newCustomer, setNewCustomer] = useState({
    name: '', mobile1: '', address: '', productName: '', productPrice: '',
    downPayment: '', loanAmount: '', interest: '', months: '', emiAmount: '',
    totalAmount: '', paymentType: 'MONTHLY', dueDate: '1'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const storedAgent = JSON.parse(localStorage.getItem('emiAgent') || 'null');
    if (storedAgent) {
      setAgentData(storedAgent);
      setLateFeePerDay(storedAgent.lateFeePerDay || 10); // Default 10 if not set
      fetchCustomers(storedAgent.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = async (agentId) => {
    try {
      const res = await fetch(`${BASE_URL}/customer/all/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (customerId) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/payment/history/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setPaymentHistory(data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...newCustomer,
        productPrice: parseFloat(newCustomer.productPrice || 0),
        downPayment: parseFloat(newCustomer.downPayment || 0),
        loanAmount: parseFloat(newCustomer.loanAmount || 0),
        interest: parseFloat(newCustomer.interest || 0),
        months: parseInt(newCustomer.months || 0),
        emiAmount: parseFloat(newCustomer.emiAmount || 0),
        totalAmount: parseFloat(newCustomer.totalAmount || 0),
        dueDate: parseInt(newCustomer.dueDate || 1),
        mobile: newCustomer.mobile1
      };
      
      const res = await fetch(`${BASE_URL}/customer/add/${agentData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.status === 409) throw new Error("Customer with this mobile number already exists!");
      if (!res.ok) throw new Error(await res.text());

      alert("Customer added successfully! ✅");
      setShowAddForm(false);
      setNewCustomer({ name: '', mobile1: '', address: '', productName: '', productPrice: '', downPayment: '', loanAmount: '', interest: '', months: '', emiAmount: '', totalAmount: '', paymentType: 'MONTHLY', dueDate: '1' });
      fetchCustomers(agentData.id);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const [manualPaymentAmount, setManualPaymentAmount] = useState('');
  const [showManualPayment, setShowManualPayment] = useState(false);

  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!manualPaymentAmount || manualPaymentAmount <= 0) return alert("Please enter a valid amount");
    
    setFormLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/payment/verify/${selectedCustomer.id}?amount=${manualPaymentAmount}&mode=CASH`, { 
        method: 'POST' 
      });
      if (res.ok) {
        alert("Payment recorded successfully! ✅");
        fetchCustomers(agentData.id);
        const updated = await res.json();
        setSelectedCustomer(updated);
        fetchPaymentHistory(selectedCustomer.id);
        setShowManualPayment(false);
        setManualPaymentAmount('');
      } else {
        const errText = await res.text();
        throw new Error(errText || "Failed to record payment");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`${BASE_URL}/customer/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Deleted successfully ✅");
        fetchCustomers(agentData.id);
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      }
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.mobile1.includes(searchQuery);
    const matchesFilter = filterStatus === 'ALL' || 
                         (filterStatus === 'OVERDUE' && c.lateFee > 0) || 
                         c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DashboardLayout title="EMI Agent Portal" moduleName="agent" role="admin">
        <div className="d-flex justify-content-center p-5"><Loader2 size={40} className="animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Total Outstanding', value: `₹${customers.reduce((acc, c) => acc + (c.balance || 0), 0).toLocaleString()}`, icon: <Briefcase className="text-primary" />, color: 'primary' },
    { label: 'Total Collected', value: `₹${customers.reduce((acc, c) => acc + (c.totalPaid || 0), 0).toLocaleString()}`, icon: <CheckSquare className="text-success" />, color: 'success' },
    { label: 'Overdue Cases', value: customers.filter(c => (c.lateFee || 0) > 0).length, icon: <AlertTriangle className="text-danger" />, color: 'danger' },
    { label: 'Total Customers', value: customers.length, icon: <Users className="text-info" />, color: 'info' },
  ];

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // Mocking update agent settings as per API /agent/update (if it exists)
      // For now, update local storage and state
      const updatedAgent = { ...agentData, lateFeePerDay: parseFloat(lateFeePerDay) };
      localStorage.setItem('emiAgent', JSON.stringify(updatedAgent));
      setAgentData(updatedAgent);
      alert("Settings updated! ✅ (Note: Backend update requires /agent/update API)");
      setShowSettings(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout title={`Agent Dashboard - ${agentData?.name || 'User'}`} moduleName="agent" role="admin">
      
      {/* Settings & Action Bar */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <button 
          className="btn btn-outline-black rounded-pill px-4 d-flex align-items-center gap-2"
          onClick={() => setShowSettings(true)}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="glass p-4 h-100 border-0 shadow-sm transition-transform hover-scale">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`icon-box bg-${stat.color} bg-opacity-10 p-3 rounded-4`}>
                  {React.cloneElement(stat.icon, { size: 24 })}
                </div>
                <span className="badge bg-light text-dark extra-small fw-bold border">LATEST</span>
              </div>
              <h3 className="fw-bold mb-1">{stat.value}</h3>
              <p className="text-muted small mb-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <div className="glass p-4 border-0 shadow-sm">
            
            {/* Toolbar */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <h5 className="fw-bold mb-0">Customer Directory</h5>
              <div className="d-flex gap-2">
                <div className="search-bar position-relative flex-grow-1">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <input 
                    type="text" 
                    className="form-control ps-5 rounded-pill" 
                    placeholder="Search by name or mobile..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="form-select rounded-pill w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button 
                  className="btn btn-black rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus size={18} /> <span className="d-none d-sm-inline">Add Customer</span>
                </button>
              </div>
            </div>

            {/* Customer List */}
            <div className="table-responsive">
              <table className="table table-hover border-0">
                <thead>
                  <tr className="text-muted extra-small text-uppercase">
                    <th className="border-0">Customer</th>
                    <th className="border-0">Product</th>
                    <th className="border-0">EMI Amount</th>
                    <th className="border-0">Balance</th>
                    <th className="border-0">Status</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">No customers found matching your criteria.</td></tr>
                  ) : (
                    filteredCustomers.map(c => (
                      <tr key={c.id} className="align-middle pointer" onClick={() => { setSelectedCustomer(c); fetchPaymentHistory(c.id); }}>
                        <td className="border-0">
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar bg-primary text-white small">{c.name[0]}</div>
                            <div>
                              <p className="fw-bold mb-0 small">{c.name}</p>
                              <p className="extra-small text-muted mb-0">{c.mobile1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="border-0 small">{c.productName || 'N/A'}</td>
                        <td className="border-0 fw-bold small">₹{c.emiAmount?.toLocaleString()}</td>
                        <td className="border-0 fw-bold text-danger small">₹{c.balance?.toLocaleString()}</td>
                        <td className="border-0">
                          <span className={`badge rounded-pill extra-small ${c.status === 'ACTIVE' ? (c.lateFee > 0 ? 'bg-danger' : 'bg-success') : 'bg-secondary'} bg-opacity-10 text-${c.status === 'ACTIVE' ? (c.lateFee > 0 ? 'danger' : 'success') : 'secondary'}`}>
                            {c.lateFee > 0 ? 'OVERDUE' : c.status}
                          </span>
                        </td>
                        <td className="border-0 text-end">
                          <button className="btn btn-light btn-sm rounded-circle p-2" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}>
                            <Trash2 size={16} className="text-danger" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal (Overlay) */}
      {selectedCustomer && (
        <div className="modal-overlay d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass p-0 border-0 rounded-4 overflow-hidden shadow-lg animate-scale-up" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: '#fff' }}>
            <div className="p-4 bg-black text-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-white text-black">{selectedCustomer.name[0]}</div>
                <div>
                  <h5 className="fw-bold mb-0">{selectedCustomer.name}</h5>
                  <p className="extra-small text-white text-opacity-50 mb-0">{selectedCustomer.mobile1} • {selectedCustomer.address || 'No Address'}</p>
                </div>
              </div>
              <button className="btn btn-link text-white p-0" onClick={() => setSelectedCustomer(null)}><X size={24} /></button>
            </div>
            
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="p-3 rounded-4 bg-light">
                    <h6 className="fw-bold extra-small text-uppercase text-muted mb-3">Loan Overview</h6>
                    <div className="d-flex justify-content-between mb-2"><span className="small">Product</span><span className="small fw-bold">{selectedCustomer.productName}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="small">Total Amount</span><span className="small fw-bold">₹{selectedCustomer.totalAmount?.toLocaleString()}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="small">Paid So Far</span><span className="small fw-bold text-success">₹{selectedCustomer.totalPaid?.toLocaleString()}</span></div>
                    <div className="d-flex justify-content-between pt-2 border-top"><span className="small fw-bold">Remaining Balance</span><span className="small fw-bold text-danger">₹{selectedCustomer.balance?.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-4 bg-danger bg-opacity-5 border border-danger border-opacity-10">
                    <h6 className="fw-bold extra-small text-uppercase text-danger mb-3">EMI & Late Fees</h6>
                    <div className="d-flex justify-content-between mb-2"><span className="small">Monthly EMI</span><span className="small fw-bold">₹{selectedCustomer.emiAmount?.toLocaleString()}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="small">Due Date</span><span className="small fw-bold">{selectedCustomer.dueDate} of month</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="small">Late Days</span><span className="small fw-bold">{selectedCustomer.lateDays || 0} Days</span></div>
                    <div className="d-flex justify-content-between pt-2 border-top"><span className="small fw-bold">Current Late Fee</span><span className="small fw-bold text-danger">₹{selectedCustomer.lateFee?.toLocaleString() || 0}</span></div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mb-4">
                <button className="btn btn-black rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={() => { setManualPaymentAmount(selectedCustomer.emiAmount); setShowManualPayment(true); }}>
                  <DollarSign size={18} /> Record Cash Payment
                </button>
                <button className="btn btn-outline-black rounded-pill d-flex align-items-center justify-content-center gap-2">
                  <Send size={18} /> Send Reminder
                </button>
              </div>

              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><History size={18} /> Payment History</h6>
              <div className="payment-history-list">
                {historyLoading ? (
                  <div className="text-center py-4"><Loader2 className="animate-spin" /></div>
                ) : paymentHistory.length === 0 ? (
                  <p className="text-center text-muted py-4 small">No payments recorded yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {paymentHistory.map((h, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                        <div>
                          <p className="fw-bold mb-0 small">₹{h.amount?.toLocaleString()}</p>
                          <p className="extra-small text-muted mb-0">{new Date(h.paymentDate).toLocaleDateString()} • {h.mode}</p>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success small">SUCCESS</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Form Modal */}
      {showAddForm && (
        <div className="modal-overlay d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass p-0 border-0 rounded-4 overflow-hidden shadow-lg animate-scale-up" style={{ width: '100%', maxWidth: '700px', background: '#fff' }}>
            <div className="p-4 bg-black text-white d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">New EMI Registration</h5>
              <button className="btn btn-link text-white p-0" onClick={() => setShowAddForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-4 overflow-auto" style={{ maxHeight: '80vh' }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Customer Name</label>
                  <input type="text" className="form-control rounded-3" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Mobile Number</label>
                  <input type="tel" className="form-control rounded-3" value={newCustomer.mobile1} onChange={e => setNewCustomer({...newCustomer, mobile1: e.target.value})} required />
                </div>
                <div className="col-12">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Residential Address</label>
                  <input type="text" className="form-control rounded-3" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                </div>
                
                <h6 className="fw-bold mt-4 mb-2 text-primary">Financial Details</h6>
                <div className="col-md-4">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Product Name</label>
                  <input type="text" className="form-control rounded-3" value={newCustomer.productName} onChange={e => setNewCustomer({...newCustomer, productName: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Product Price (₹)</label>
                  <input type="number" className="form-control rounded-3" value={newCustomer.productPrice} onChange={e => setNewCustomer({...newCustomer, productPrice: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Down Payment (₹)</label>
                  <input type="number" className="form-control rounded-3" value={newCustomer.downPayment} onChange={e => setNewCustomer({...newCustomer, downPayment: e.target.value})} />
                </div>

                <div className="col-md-3">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Loan (₹)</label>
                  <input type="number" className="form-control rounded-3 border-primary" value={newCustomer.loanAmount} onChange={e => setNewCustomer({...newCustomer, loanAmount: e.target.value})} required />
                </div>
                <div className="col-md-3">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Months</label>
                  <input type="number" className="form-control rounded-3" value={newCustomer.months} onChange={e => setNewCustomer({...newCustomer, months: e.target.value})} required />
                </div>
                <div className="col-md-3">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">EMI (₹)</label>
                  <input type="number" className="form-control rounded-3 fw-bold" value={newCustomer.emiAmount} onChange={e => setNewCustomer({...newCustomer, emiAmount: e.target.value})} required />
                </div>
                <div className="col-md-3">
                  <label className="extra-small fw-bold text-uppercase text-muted mb-1">Due Date</label>
                  <input type="number" className="form-control rounded-3" min="1" max="31" value={newCustomer.dueDate} onChange={e => setNewCustomer({...newCustomer, dueDate: e.target.value})} />
                </div>

                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-black w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2" disabled={formLoading}>
                    {formLoading ? <Loader2 size={20} className="animate-spin" /> : <><Plus size={20}/> Complete Registration</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass p-0 border-0 rounded-4 overflow-hidden shadow-lg animate-scale-up" style={{ width: '100%', maxWidth: '400px', background: '#fff' }}>
            <div className="p-4 bg-black text-white d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Agent Settings</h5>
              <button className="btn btn-link text-white p-0" onClick={() => setShowSettings(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateSettings} className="p-4">
              <div className="mb-4">
                <label className="extra-small fw-bold text-uppercase text-muted mb-2">Late Fee Per Day (₹)</label>
                <div className="position-relative">
                  <DollarSign className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input 
                    type="number" 
                    className="form-control ps-5 rounded-3 py-2" 
                    value={lateFeePerDay} 
                    onChange={e => setLateFeePerDay(e.target.value)} 
                    required 
                  />
                </div>
                <p className="extra-small text-muted mt-2">This fee is automatically applied to customers who miss their due date.</p>
              </div>
              <button type="submit" className="btn btn-black w-100 rounded-pill py-2 fw-bold" disabled={formLoading}>
                {formLoading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualPayment && (
        <div className="modal-overlay d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div className="glass p-0 border-0 rounded-4 overflow-hidden shadow-lg animate-scale-up" style={{ width: '100%', maxWidth: '400px', background: '#fff' }}>
            <div className="p-4 bg-black text-white d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Record Cash Payment</h5>
              <button className="btn btn-link text-white p-0" onClick={() => setShowManualPayment(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleManualPayment} className="p-4">
              <div className="mb-4">
                <label className="extra-small fw-bold text-uppercase text-muted mb-2">Amount to Receive (₹)</label>
                <div className="position-relative">
                  <DollarSign className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input 
                    type="number" 
                    className="form-control ps-5 rounded-3 py-2" 
                    value={manualPaymentAmount} 
                    onChange={e => setManualPaymentAmount(e.target.value)} 
                    placeholder="Enter amount"
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-black w-100 rounded-pill py-2 fw-bold" disabled={formLoading}>
                {formLoading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentDashboard;

