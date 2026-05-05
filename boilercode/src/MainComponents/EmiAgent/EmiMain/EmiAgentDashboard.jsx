import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, LogOut, Settings,
  DollarSign, Loader2, MapPin, ChevronRight,
  AlertTriangle, CheckCircle, Send, CreditCard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './EmiAgentDashboard.css';

const BASE_URL = "http://localhost:1010";

const EmiAgentDashboard = () => {

  const [agent, setAgent] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [todayDues, setTodayDues] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [lateFee, setLateFee] = useState(0);

  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchDashboardData = async (id) => {
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
      console.log("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= INIT =================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('emiAgent') || 'null');

    if (!stored) {
      navigate('/emi-login');
      return;
    }

    setAgent(stored);
    fetchDashboardData(stored.id);

  }, [navigate]);

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem('emiAgent');
    navigate('/emi-login');
  };

  // ================= UPDATE LATE FEE =================
  const updateLateFee = async () => {
    try {
      const res = await fetch(`${BASE_URL}/agent/late-fee/${agent.id}?fee=${Number(lateFee)}`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setAgent(data);
        localStorage.setItem("emiAgent", JSON.stringify(data));
        alert("Late fee updated ✅");
      }
    } catch {
      alert("Error updating fee");
    }
  };

  // ================= FILTER =================
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile?.includes(searchTerm)
  );

  // ================= STATS =================
  const totalOutstanding = customers.reduce((a, c) => a + (c.balance || 0), 0);
  const totalCollected = customers.reduce((a, c) => a + (c.totalPaid || 0), 0);

  if (loading) return (
    <div className="loader">
      <Loader2 className="spin" /> Loading...
    </div>
  );

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>DMS EMI</h2>

        <button onClick={() => setActiveTab('overview')}>Dashboard</button>
        <button onClick={() => setActiveTab('customers')}>Customers</button>
        <button onClick={() => setActiveTab('settings')}>Settings</button>

        <div className="user">
          <p>{agent?.name}</p>
          <small>{agent?.area}</small>
          <button onClick={logout}><LogOut size={16} /></button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <div className="header">
          <input
            placeholder="Search customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link to="/emi-add-customer" className="btn">+ Add</Link>
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid">

            <div className="card">
              <h3>Outstanding</h3>
              <p>₹{totalOutstanding}</p>
            </div>

            <div className="card">
              <h3>Collected</h3>
              <p>₹{totalCollected}</p>
            </div>

            <div className="card">
              <h3>Today Dues</h3>
              <p>{todayDues.length}</p>
            </div>

            <div className="card">
              <h3>Overdue</h3>
              <p>{overdue.length}</p>
            </div>

          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="table">

            {filteredCustomers.map(c => (
              <div className="row" key={c.id}>
                <div>{c.name}</div>
                <div>{c.mobile}</div>
                <div>₹{c.balance}</div>
                <div>{c.status}</div>
              </div>
            ))}

          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="settings">

            <h3>Late Fee</h3>
            <input
              type="number"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
            />
            <button onClick={updateLateFee}>Update</button>

          </div>
        )}

      </main>
    </div>
  );
};

export default EmiAgentDashboard;