import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../Components/DashboardLayout';
import { Briefcase, Clock, CheckSquare, AlertTriangle, Plus, Trash2, Loader2, Phone } from 'lucide-react';

const BASE_URL = "http://localhost:1010";

const AgentDashboard = () => {
  const [agentData, setAgentData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    mobile1: '',
    address: '',
    productName: '',
    productPrice: '',
    downPayment: '',
    loanAmount: '',
    interest: '',
    months: '',
    emiAmount: '',
    totalAmount: '',
    paymentType: 'MONTHLY',
    dueDate: '1'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const storedAgent = JSON.parse(localStorage.getItem('emiAgent') || 'null');
    if (storedAgent) {
      setAgentData(storedAgent);
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

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: newCustomer.name,
        mobile1: newCustomer.mobile1,
        mobile: newCustomer.mobile1, // Ensure both are sent to match Java getter/setter quirks
        address: newCustomer.address,
        productName: newCustomer.productName,
        productPrice: parseFloat(newCustomer.productPrice || 0),
        downPayment: parseFloat(newCustomer.downPayment || 0),
        loanAmount: parseFloat(newCustomer.loanAmount || 0),
        interest: parseFloat(newCustomer.interest || 0),
        months: parseInt(newCustomer.months || 0),
        emiAmount: parseFloat(newCustomer.emiAmount || 0),
        totalAmount: parseFloat(newCustomer.totalAmount || 0),
        paymentType: newCustomer.paymentType,
        dueDate: parseInt(newCustomer.dueDate || 1)
      };
      
      const res = await fetch(`${BASE_URL}/customer/add/${agentData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`${BASE_URL}/customer/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Deleted successfully ✅");
        fetchCustomers(agentData.id);
      }
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="EMI Collection Agent" moduleName="agent" role="admin">
        <div className="d-flex justify-content-center p-5"><Loader2 size={40} className="animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const totalBalance = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const activeCount = customers.filter(c => c.status === 'ACTIVE').length;

  const stats = [
    { label: 'Total Outstanding', value: `₹${totalBalance.toFixed(2)}`, icon: <Briefcase className="text-primary" />, trend: 'Pending Collection' },
    { label: 'Total Customers', value: customers.length.toString(), icon: <Clock className="text-info" />, trend: 'Registered' },
    { label: 'Active EMI', value: activeCount.toString(), icon: <CheckSquare className="text-success" />, trend: 'Ongoing' },
    { label: 'Defaulted/Closed', value: (customers.length - activeCount).toString(), icon: <AlertTriangle className="text-danger" />, trend: 'Inactive' },
  ];

  return (
    <DashboardLayout title={`Agent Dashboard - ${agentData?.name || 'User'}`} moduleName="agent" role="admin">
      <div className="row g-4 mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="glass p-4 h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {stat.icon}
                </div>
                <span className="small fw-bold text-muted">{stat.trend}</span>
              </div>
              <h3 className="fw-bold mb-1">{stat.value}</h3>
              <p className="text-muted small mb-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <div className="glass p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">My Customers</h5>
              <button 
                className="btn btn-primary rounded-pill px-4 btn-sm d-flex align-items-center gap-2"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancel' : <><Plus size={16}/> Add Customer</>}
              </button>
            </div>

            {showAddForm && (
              <div className="card bg-light border-0 rounded-4 p-4 mb-4 animate-fade-in">
                <h6 className="fw-bold mb-3">Register New EMI Customer</h6>
                <form onSubmit={handleAddCustomer} className="row g-3">
                  <div className="col-md-6">
                    <label className="small text-muted mb-1">Customer Name</label>
                    <input type="text" className="form-control" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted mb-1">Mobile Number</label>
                    <input type="tel" className="form-control" value={newCustomer.mobile1} onChange={e => setNewCustomer({...newCustomer, mobile1: e.target.value})} required />
                  </div>
                  <div className="col-md-12">
                    <label className="small text-muted mb-1">Address</label>
                    <input type="text" className="form-control" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                  </div>
                  
                  <h6 className="fw-bold mt-4 mb-2 w-100 border-bottom pb-2">Product & Loan Details</h6>
                  <div className="col-md-4">
                    <label className="small text-muted mb-1">Product Name</label>
                    <input type="text" className="form-control" value={newCustomer.productName} onChange={e => setNewCustomer({...newCustomer, productName: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted mb-1">Product Price (₹)</label>
                    <input type="number" className="form-control" value={newCustomer.productPrice} onChange={e => setNewCustomer({...newCustomer, productPrice: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted mb-1">Down Payment (₹)</label>
                    <input type="number" className="form-control" value={newCustomer.downPayment} onChange={e => setNewCustomer({...newCustomer, downPayment: e.target.value})} />
                  </div>

                  <div className="col-md-3">
                    <label className="small text-muted mb-1">Loan Amount (₹)</label>
                    <input type="number" className="form-control" value={newCustomer.loanAmount} onChange={e => setNewCustomer({...newCustomer, loanAmount: e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <label className="small text-muted mb-1">Interest (%)</label>
                    <input type="number" className="form-control" value={newCustomer.interest} onChange={e => setNewCustomer({...newCustomer, interest: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label className="small text-muted mb-1">Total Months</label>
                    <input type="number" className="form-control" value={newCustomer.months} onChange={e => setNewCustomer({...newCustomer, months: e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <label className="small text-muted mb-1">EMI Amount (₹)</label>
                    <input type="number" className="form-control" value={newCustomer.emiAmount} onChange={e => setNewCustomer({...newCustomer, emiAmount: e.target.value})} required />
                  </div>

                  <div className="col-md-4">
                    <label className="small text-muted mb-1">Total Payable Amount (₹)</label>
                    <input type="number" className="form-control" value={newCustomer.totalAmount} onChange={e => setNewCustomer({...newCustomer, totalAmount: e.target.value})} required />
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted mb-1">Payment Frequency</label>
                    <select className="form-select" value={newCustomer.paymentType} onChange={e => setNewCustomer({...newCustomer, paymentType: e.target.value})}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted mb-1">Due Date (Day of Month)</label>
                    <input type="number" className="form-control" min="1" max="31" value={newCustomer.dueDate} onChange={e => setNewCustomer({...newCustomer, dueDate: e.target.value})} />
                  </div>
                  <div className="col-12 text-end mt-4">
                    <button type="submit" className="btn btn-black rounded-pill px-5" disabled={formLoading}>
                      {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Customer'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              {customers.length === 0 ? (
                <div className="text-center py-5 opacity-50">No customers registered yet. Click Add Customer above.</div>
              ) : (
                customers.map((c) => (
                  <div key={c.id} className="glass p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar small bg-primary text-white">{c.name ? c.name[0].toUpperCase() : 'U'}</div>
                      <div>
                        <p className="fw-bold mb-0">{c.name}</p>
                        <p className="extra-small text-muted mb-0 d-flex align-items-center gap-1"><Phone size={10}/> {c.mobile1}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                      <div className="text-md-end">
                        <p className="small text-muted mb-0">Balance</p>
                        <p className="fw-bold text-danger mb-0">₹{c.balance?.toFixed(2)}</p>
                      </div>
                      <div className="text-md-end">
                        <p className="small text-muted mb-0">Paid</p>
                        <p className="fw-bold text-success mb-0">₹{c.totalPaid?.toFixed(2)}</p>
                      </div>
                      <span className={`badge rounded-pill ${c.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} bg-opacity-20 text-${c.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                        {c.status}
                      </span>
                      <button className="btn btn-outline-danger btn-sm rounded-circle p-2" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
