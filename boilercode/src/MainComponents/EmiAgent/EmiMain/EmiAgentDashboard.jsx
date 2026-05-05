import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../Components/DashboardLayout';
import { 
  Users, Briefcase, CheckSquare, AlertTriangle, Search, Plus, 
  Settings, DollarSign, Loader2, X, History, Trash2, Calendar, UserCheck
} from 'lucide-react';

const BASE_URL = "http://localhost:1010";

const EmiAgentDashboard = () => {
  // Agent & Stats State
  const [agentData, setAgentData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [todayDues, setTodayDues] = useState([]);
  const [overdue, setOverdue] = useState([]);
  
  // UI Control State
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Specific Customer Data (for Modal)
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerSchedule, setCustomerSchedule] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form States
  const [formLoading, setFormLoading] = useState(false);
  const [lateFee, setLateFee] = useState(0);
  const [newCustomer, setNewCustomer] = useState({
    name: '', mobile: '', address: '', productName: '', productPrice: '',
    downPayment: '', totalAmount: '', months: '', dueDate: '1', paymentType: 'MONTHLY'
  });

  const navigate = useNavigate();

  // ================= DATA FETCHING =================
  const fetchDashboardData = useCallback(async (id) => {
    try {
      setLoading(true);
      const [custRes, todayRes, overdueRes] = await Promise.all([
        fetch(`${BASE_URL}/customer/all/${id}`),
        fetch(`${BASE_URL}/dashboard/today/${id}`),
        fetch(`${BASE_URL}/dashboard/overdue/${id}`)
      ]);

      setCustomers(custRes.ok ? await custRes.json() : []);
      setTodayDues(todayRes.ok ? await todayRes.json() : []);
      setOverdue(overdueRes.ok ? await overdueRes.json() : []);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedAgent = JSON.parse(localStorage.getItem('emiAgent') || 'null');
    if (!storedAgent) {
      navigate('/auth/agent/admin');
      return;
    }
    setAgentData(storedAgent);
    setLateFee(storedAgent.lateFeePerDay || 0);
    fetchDashboardData(storedAgent.id);
  }, [navigate, fetchDashboardData]);

  // ================= AGENT ACTIONS =================
  const handleUpdateLateFee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/agent/late-fee/${agentData.id}?fee=${lateFee}`, { method: 'POST' });
      if (res.ok) {
        alert("Global Late Fee Updated! ⚙️");
        const updated = { ...agentData, lateFeePerDay: lateFee };
        setAgentData(updated);
        localStorage.setItem('emiAgent', JSON.stringify(updated));
        setShowSettings(false);
      }
    } catch (err) { alert("Error updating fee"); }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/customer/add/${agentData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });

      if (res.ok) {
        alert("Customer Registered & Schedule Generated! ✅");
        setShowAddForm(false);
        setNewCustomer({ name: '', mobile: '', address: '', productName: '', productPrice: '', downPayment: '', totalAmount: '', months: '', dueDate: '1' });
        fetchDashboardData(agentData.id);
      } else {
        alert(await res.text());
      }
    } catch (err) { console.error(err); } finally { setFormLoading(false); }
  };

  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setDetailsLoading(true);
    try {
      const [histRes, schedRes, sumRes] = await Promise.all([
        fetch(`${BASE_URL}/payment/history/${cust.id}`),
        fetch(`${BASE_URL}/schedule/customer/${cust.id}`),
        fetch(`${BASE_URL}/customer/summary/${cust.id}`)
      ]);

      setCustomerHistory(histRes.ok ? await histRes.json() : []);
      setCustomerSchedule(schedRes.ok ? await schedRes.json() : []);
      setCustomerDetails(sumRes.ok ? await sumRes.json() : null);
    } catch (err) { console.error(err); } finally { setDetailsLoading(false); }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Permanent Delete? This will wipe all schedules and payments.")) return;
    const res = await fetch(`${BASE_URL}/customer/delete/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert("Customer Removed.");
      setSelectedCustomer(null);
      fetchDashboardData(agentData.id);
    }
  };

  // ================= CALCULATIONS =================
  const totalOutstanding = customers.reduce((a, c) => a + (c.balance || 0), 0);
  const totalCollected = customers.reduce((a, c) => a + (c.totalPaid || 0), 0);

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.mobile?.includes(searchQuery)
  );

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <DashboardLayout title={activeView === 'profile' ? 'Agent Profile' : 'EMI Dashboard'} role="admin">
      
      {/* HEADER ACTIONS */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <button className="btn btn-light rounded-pill px-4" onClick={() => setActiveView(activeView === 'dashboard' ? 'profile' : 'dashboard')}>
            {activeView === 'dashboard' ? <><UserCheck size={18} className="me-2"/> Profile</> : 'Dashboard'}
        </button>
        <button className="btn btn-light rounded-pill px-4" onClick={() => setShowSettings(true)}><Settings size={18} className="me-2"/> Settings</button>
      </div>

      {activeView === 'dashboard' ? (
        <>
          {/* STATS GRID */}
          <div className="row g-4 mb-4">
            {[
                { label: 'Outstanding', val: `₹${totalOutstanding.toLocaleString()}`, color: 'primary', icon: <Briefcase /> },
                { label: 'Collected', val: `₹${totalCollected.toLocaleString()}`, color: 'success', icon: <CheckSquare /> },
                { label: 'Today Dues', val: todayDues.length, color: 'warning', icon: <Calendar /> },
                { label: 'Overdue', val: overdue.length, color: 'danger', icon: <AlertTriangle /> }
            ].map((s, i) => (
                <div key={i} className="col-md-3">
                    <div className={`glass p-4 border-start border-4 border-${s.color} shadow-sm rounded-4`}>
                        <div className="d-flex justify-content-between">
                            <h6 className="text-muted small fw-bold text-uppercase">{s.label}</h6>
                            <div className={`text-${s.color}`}>{s.icon}</div>
                        </div>
                        <h3 className="fw-bold mb-0">{s.val}</h3>
                    </div>
                </div>
            ))}
          </div>

          {/* CUSTOMER LIST */}
          <div className="glass p-4 border-0 shadow-sm rounded-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <h5 className="fw-bold mb-0">Manage Customers</h5>
              <div className="d-flex gap-2">
                <div className="position-relative">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <input type="text" className="form-control ps-5 rounded-pill" placeholder="Search mobile/name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button className="btn btn-black rounded-pill px-4" onClick={() => setShowAddForm(true)}><Plus size={18} /> Add</button>
              </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr className="text-muted small text-uppercase">
                            <th>Customer</th>
                            <th>EMI Amount</th>
                            <th>Balance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(c => (
                            <tr key={c.id} className="align-middle pointer" onClick={() => handleViewCustomer(c)} style={{cursor: 'pointer'}}>
                                <td>
                                    <div className="fw-bold">{c.name}</div>
                                    <div className="extra-small text-muted">{c.mobile}</div>
                                </td>
                                <td>₹{c.emiAmount?.toLocaleString()}</td>
                                <td className="text-danger fw-bold">₹{c.balance?.toLocaleString()}</td>
                                <td><span className={`badge rounded-pill ${c.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>{c.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </>
      ) : (
        /* AGENT PROFILE VIEW */
        <div className="row justify-content-center animate-fade-in">
           <div className="col-md-6 glass p-5 rounded-4 shadow-sm">
                <h4 className="fw-bold mb-4">Agent Information</h4>
                <div className="mb-3"><label className="small text-muted">Full Name</label><input className="form-control" value={agentData.name} /></div>
                <div className="mb-3"><label className="small text-muted">Mobile</label><input className="form-control" value={agentData.mobile} disabled /></div>
                <div className="mb-3"><label className="small text-muted">Service Area</label><input className="form-control" value={agentData.area} /></div>
                <button className="btn btn-black w-100 rounded-pill mt-3">Update Profile</button>
           </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {showAddForm && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.6)', position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div className="glass p-4 rounded-4 shadow-lg animate-scale-up" style={{width: '90%', maxWidth: '600px', background: '#fff'}}>
                <div className="d-flex justify-content-between mb-4">
                    <h5 className="fw-bold">New Customer Enrollment</h5>
                    <button className="btn p-0" onClick={() => setShowAddForm(false)}><X/></button>
                </div>
                <form onSubmit={handleAddCustomer}>
                    <div className="row g-3">
                        <div className="col-md-6"><label className="small fw-bold">Name</label><input className="form-control" required onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} /></div>
                        <div className="col-md-6"><label className="small fw-bold">Mobile</label><input className="form-control" required onChange={e => setNewCustomer({...newCustomer, mobile: e.target.value})} /></div>
                        <div className="col-md-6"><label className="small fw-bold">Total Loan (Principal)</label><input type="number" className="form-control" required onChange={e => setNewCustomer({...newCustomer, totalAmount: e.target.value})} /></div>
                        <div className="col-md-3"><label className="small fw-bold">Months</label><input type="number" className="form-control" required onChange={e => setNewCustomer({...newCustomer, months: e.target.value})} /></div>
                        <div className="col-md-3"><label className="small fw-bold">Due Date (1-31)</label><input type="number" className="form-control" required onChange={e => setNewCustomer({...newCustomer, dueDate: e.target.value})} /></div>
                        <div className="col-12"><button type="submit" className="btn btn-black w-100 py-3 rounded-pill" disabled={formLoading}>{formLoading ? <Loader2 className="animate-spin" /> : 'Register & Generate Schedule'}</button></div>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL: CUSTOMER DETAILS */}
      {selectedCustomer && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.6)', position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div className="glass p-0 rounded-4 shadow-lg overflow-hidden" style={{width: '90%', maxWidth: '800px', maxHeight: '90vh', background: '#fff'}}>
                <div className="p-4 bg-black text-white d-flex justify-content-between">
                    <div><h5 className="mb-0">{selectedCustomer.name}</h5><small>{selectedCustomer.mobile}</small></div>
                    <button className="btn text-white" onClick={() => setSelectedCustomer(null)}><X/></button>
                </div>
                <div className="p-4 overflow-auto" style={{maxHeight: '70vh'}}>
                    {detailsLoading ? <Loader2 className="animate-spin mx-auto d-block" /> : (
                        <>
                            <div className="row mb-4 text-center">
                                <div className="col-4 border-end"><div className="small text-muted">Paid</div><h5 className="fw-bold">₹{customerDetails?.totalPaid}</h5></div>
                                <div className="col-4 border-end"><div className="small text-muted">Remaining</div><h5 className="fw-bold text-danger">₹{customerDetails?.balance}</h5></div>
                                <div className="col-4"><div className="small text-muted">Next EMI</div><h5 className="fw-bold">₹{customerDetails?.emiAmount}</h5></div>
                            </div>
                            <h6 className="fw-bold mb-3"><Calendar size={18} className="me-2"/> Upcoming Schedule</h6>
                            <div className="list-group mb-4">
                                {customerSchedule.slice(0, 5).map((s, i) => (
                                    <div key={i} className="list-group-item d-flex justify-content-between small">
                                        <span>Inst. #{s.installmentNo} - {new Date(s.dueDate).toLocaleDateString()}</span>
                                        <span className={`fw-bold ${s.status === 'PAID' ? 'text-success' : 'text-warning'}`}>{s.status}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline-danger w-100 rounded-pill" onClick={() => handleDeleteCustomer(selectedCustomer.id)}><Trash2 size={16} className="me-2"/> Terminate Account</button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* MODAL: SETTINGS (LATE FEE) */}
      {showSettings && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.6)', position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div className="glass p-4 rounded-4 shadow-lg" style={{width: '400px', background: '#fff'}}>
                <h5 className="fw-bold mb-4">Global Preferences</h5>
                <form onSubmit={handleUpdateLateFee}>
                    <div className="mb-4">
                        <label className="small fw-bold text-muted">Daily Late Fee (₹)</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><DollarSign size={16}/></span>
                            <input type="number" className="form-control border-start-0" value={lateFee} onChange={e => setLateFee(e.target.value)} />
                        </div>
                        <p className="extra-small text-muted mt-2">Applied automatically for every day after the due date.</p>
                    </div>
                    <button className="btn btn-black w-100 py-2 rounded-pill">Update Policy</button>
                </form>
            </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default EmiAgentDashboard;