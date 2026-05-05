import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Loader2, PieChart, Calendar, History, 
  LogOut, Download, AlertTriangle, CheckCircle, 
  ArrowRight, ShieldCheck, Info, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import './EmiCustomerDashboard.css';

const BASE_URL = "http://localhost:1010";

const EmiCustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [totalPayable, setTotalPayable] = useState({ emiAmount: 0, lateFee: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const navigate = useNavigate();

  // ================= FETCH DATA =================
  const fetchData = useCallback(async (id) => {
    try {
      setLoading(true);
      const [custRes, histRes, schedRes, totalRes] = await Promise.all([
        fetch(`${BASE_URL}/customer/${id}`),
        fetch(`${BASE_URL}/payment/history/${id}`),
        fetch(`${BASE_URL}/schedule/customer/${id}`),
        fetch(`${BASE_URL}/payment/total/${id}`)
      ]);

      if (!custRes.ok) throw new Error("Sync failed");

      const cust = await custRes.json();
      setCustomer(cust);
      localStorage.setItem("emiCustomer", JSON.stringify(cust));

      setPaymentHistory(histRes.ok ? await histRes.json() : []);
      setSchedule(schedRes.ok ? await schedRes.json() : []);
      setTotalPayable(totalRes.ok ? await totalRes.json() : { total: 0 });
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('emiCustomer') || 'null');
    if (!stored) {
      navigate('/auth/agent/customer/login');
      return;
    }
    fetchData(stored.id);
  }, [fetchData, navigate]);

  // ================= RAZORPAY INTEGRATION =================
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayEMI = async () => {
    try {
      setPaying(true);
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay failed to load");

      // 1. Create Order on Backend (matches /payment/create-order/{id})
      const orderRes = await fetch(`${BASE_URL}/payment/create-order/${customer.id}`, { method: "POST" });
      const order = await orderRes.json();
      
      if (!order.id) throw new Error("Order creation failed");

      const options = {
        key: "rzp_test_SiUZm0fwjT39g4", // 👈 Enter your Razorpay Key ID here
        amount: order.amount,
        currency: "INR",
        name: "DMS ENTERPRISE",
        description: `EMI Payment for ${customer.productName || 'Loan'}`,
        order_id: order.id,
        handler: async (response) => {
          await verifyPayment(response);
        },
        prefill: {
          name: customer.name,
          contact: customer.mobile
        },
        theme: { color: "#000000" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Error: " + err.message);
    } finally {
      setPaying(false);
    }
  };

  const verifyPayment = async (razorResponse) => {
    try {
      // ✅ Matches @RequestBody Map<String, Object> in your Java Controller
      const payload = {
        amount: totalPayable.total,
        mode: "ONLINE",
        razorpayOrderId: razorResponse.razorpay_order_id,
        razorpayPaymentId: razorResponse.razorpay_payment_id,
        razorpaySignature: razorResponse.razorpay_signature
      };

      const res = await fetch(`${BASE_URL}/payment/verify/${customer.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Verification Failed");

      alert("✅ Payment Successful! Dashboard updated.");
      fetchData(customer.id); // Refresh data
    } catch (err) {
      alert("❌ Verification Error: " + err.message);
    }
  };

  // ================= PDF & LOGOUT =================
  const generateBill = () => {
    const doc = new jsPDF();
    doc.text("DMS ENTERPRISE - RECEIPT", 105, 20, null, null, "center");
    doc.text(`Customer: ${customer.name}`, 20, 40);
    doc.text(`Total Paid: INR ${customer.totalPaid}`, 20, 50);
    doc.text(`Outstanding: INR ${customer.balance}`, 20, 60);
    doc.save(`Receipt_${customer.name}.pdf`);
  };

  if (loading) return <div className="p-5 text-center"><Loader2 className="animate-spin" /></div>;

  const progress = ((customer.totalPaid / customer.totalAmount) * 100 || 0).toFixed(1);

  return (
    <div className="dashboard-wrapper">
      <nav className="dashboard-sidebar">
        <div className="sidebar-brand"><ShieldCheck /> <span>DMS PAY</span></div>
        <div className="sidebar-menu">
          <button className={activeTab === 'summary' ? 'active' : ''} onClick={() => setActiveTab('summary')}><PieChart /> Dashboard</button>
          <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}><Calendar /> Schedule</button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}><History /> Transactions</button>
        </div>
        <button className="logout-btn" onClick={() => navigate('/auth/agent/customer/login')}><LogOut /> Logout</button>
      </nav>

      <main className="dashboard-main">
        <header className="main-header">
          <div><h2>Welcome, {customer.name}</h2><p className="text-muted small">ID: #EMI-{customer.id}</p></div>
          <span className={`status-badge ${customer.status.toLowerCase()}`}>{customer.status}</span>
        </header>

        {activeTab === 'summary' && (
          <div className="animate-fade-in">
            <div className="row g-4">
              <div className="col-md-8">
                <div className="stats-card balance-card">
                  <p className="label">Current Payable Amount</p>
                  <h1 className="amount">₹{totalPayable.total?.toLocaleString()}</h1>
                  <div className="details">
                    <span>EMI: ₹{totalPayable.emiAmount}</span>
                    {totalPayable.lateFee > 0 && <span className="text-warning ms-2">+ Late Fee: ₹{totalPayable.lateFee}</span>}
                  </div>
                  <div className="actions mt-4">
                    <button className="btn-pay" onClick={handlePayEMI} disabled={paying || customer.balance <= 0}>
                      {paying ? <Loader2 className="animate-spin" /> : <CreditCard size={18} />}
                      {customer.balance <= 0 ? 'Loan Completed' : 'Pay Now'}
                    </button>
                    <button className="btn-download" onClick={generateBill}><Download size={18} /> Receipt</button>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stats-card progress-card text-center">
                  <h5>Loan Progress</h5>
                  <h2 className="progress-text text-primary">{progress}%</h2>
                  <div className="progress mt-3"><div className="progress-bar" style={{width: `${progress}%`}}></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
           <div className="list-container mt-4 glass-card p-4">
             <table className="table">
               <thead><tr><th>Installment</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
               <tbody>
                 {schedule.map(s => (
                   <tr key={s.id}>
                     <td>#{s.installmentNo}</td>
                     <td>₹{s.emiAmount}</td>
                     <td>{new Date(s.dueDate).toLocaleDateString()}</td>
                     <td><span className={`badge-status ${s.status.toLowerCase()}`}>{s.status}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'history' && (
           <div className="list-container mt-4 glass-card p-4">
             {paymentHistory.map(p => (
               <div key={p.id} className="transaction-item d-flex justify-content-between p-3 border-bottom">
                 <div><h6 className="mb-0">₹{p.amountPaid}</h6><small>{new Date(p.paidDate).toLocaleString()}</small></div>
                 <span className="method-tag px-2 py-1 bg-light rounded">{p.paymentMode}</span>
               </div>
             ))}
           </div>
        )}
      </main>
    </div>
  );
};

export default EmiCustomerDashboard;