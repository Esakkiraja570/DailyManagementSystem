import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../../Components/DashboardLayout';
import { 
  CreditCard, ShieldCheck, History, Loader2, CheckCircle, AlertCircle, 
  Download, Receipt, TrendingUp, Calendar, AlertTriangle, ChevronRight,
  Wallet, ArrowRight, Smartphone, Clock, PieChart
} from 'lucide-react';
import jsPDF from 'jspdf';
import './CustomerPayment.css';

const BASE_URL = "http://localhost:1010";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CustomerPayment = () => {
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ show: false, success: false, msg: '' });

  const fetchData = useCallback(async (id) => {
    try {
      const [custRes, histRes, schedRes] = await Promise.all([
        fetch(`${BASE_URL}/customer/${id}`),
        fetch(`${BASE_URL}/payment/history/${id}`),
        fetch(`${BASE_URL}/schedule/customer/${id}`)
      ]);

      if (custRes.ok) {
        const data = await custRes.json();
        setCustomer(data);
        localStorage.setItem('emiCustomer', JSON.stringify(data));
      }
      if (histRes.ok) setPaymentHistory(await histRes.json());
      if (schedRes.ok) setSchedule(await schedRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('emiCustomer') || 'null');
    if (stored) fetchData(stored.id);
    else setLoading(false);
  }, [fetchData]);

  const handlePayEMI = async () => {
    if (!customer) return;
    setPaying(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Payment gateway offline. Please check your internet.");

      const orderRes = await fetch(`${BASE_URL}/payment/create-order/${customer.id}`, { method: 'POST' });
      if (!orderRes.ok) throw new Error(await orderRes.text());
      const orderData = await orderRes.json();

      const options = {
        key: 'rzp_test_SiUZm0fwjT39g4',
        amount: orderData.amount,
        currency: 'INR',
        name: 'DMS EMI Service',
        description: `Installment Payment - ${customer.productName}`,
        order_id: orderData.id,
        handler: async function (response) {
          const totalToPay = customer.emiAmount + (customer.lateFee || 0);
          const verifyRes = await fetch(`${BASE_URL}/payment/verify/${customer.id}?amount=${totalToPay}&mode=UPI`, { method: 'POST' });
          if (verifyRes.ok) {
            setPaymentStatus({ show: true, success: true, msg: 'EMI Payment Successful! Ledger updated.' });
            fetchData(customer.id);
          } else throw new Error("Payment verification failed.");
          setPaying(false);
        },
        prefill: { name: customer.name, contact: customer.mobile },
        theme: { color: '#000000' }
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setPaymentStatus({ show: true, success: false, msg: err.message });
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="cust-portal-loading">
      <Loader2 size={40} className="animate-spin" />
      <p>Loading your financial summary...</p>
    </div>
  );

  if (!customer) return (
    <div className="cust-error-state">
      <AlertCircle size={64} />
      <h2>Session Expired</h2>
      <button onClick={() => window.location.href='/auth/agent/customer/login'}>Log In Again</button>
    </div>
  );

  const progress = ((customer.totalPaid / customer.totalAmount) * 100).toFixed(0);
  const nextEmi = schedule.find(s => s.status === 'PENDING');

  return (
    <div className="customer-portal-premium">
      <div className="portal-container">
        
        {/* Header Section */}
        <header className="portal-header">
          <div className="user-profile">
            <div className="avatar-hex">{customer.name[0]}</div>
            <div className="welcome">
              <p>Welcome back,</p>
              <h1>{customer.name}</h1>
            </div>
          </div>
          <div className="header-status">
            <span className={`status-tag ${customer.status?.toLowerCase()}`}>{customer.status}</span>
          </div>
        </header>

        {paymentStatus.show && (
          <div className={`notification-banner ${paymentStatus.success ? 'success' : 'error'}`}>
             {paymentStatus.success ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
             <p>{paymentStatus.msg}</p>
             <button onClick={() => setPaymentStatus({ ...paymentStatus, show: false })}><ArrowRight size={16}/></button>
          </div>
        )}

        <div className="portal-grid">
          {/* Main Financial Card */}
          <section className="main-stats-card">
            <div className="card-top">
              <div className="stat-main">
                <p>Outstanding Balance</p>
                <h2>₹{(customer.balance + (customer.lateFee || 0)).toLocaleString()}</h2>
                {customer.lateFee > 0 && <span className="late-fee-tag">+ ₹{customer.lateFee} Late Penalty</span>}
              </div>
              <div className="stat-secondary">
                <p>Next Installment</p>
                <h3>₹{customer.emiAmount?.toLocaleString()}</h3>
                <p className="date">Due: {nextEmi ? new Date(nextEmi.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="progress-bar-section">
              <div className="progress-meta">
                <span>Repayment Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="quick-info-row">
              <div className="q-item">
                <p>Total Loan</p>
                <strong>₹{customer.totalAmount?.toLocaleString()}</strong>
              </div>
              <div className="q-item">
                <p>Total Paid</p>
                <strong>₹{customer.totalPaid?.toLocaleString()}</strong>
              </div>
              <div className="q-item">
                <p>Tenure</p>
                <strong>{customer.months} Months</strong>
              </div>
            </div>

            <button className="pay-now-btn" onClick={handlePayEMI} disabled={paying || customer.balance <= 0}>
              {paying ? <Loader2 className="animate-spin" /> : <Wallet size={20} />}
              {paying ? 'Connecting to Gateway...' : (customer.balance <= 0 ? 'Loan Fully Paid' : `Pay ₹${(customer.emiAmount + (customer.lateFee || 0)).toLocaleString()}`)}
            </button>
          </section>

          {/* Right Column: Schedule & History */}
          <div className="side-column">
            {/* Upcoming Schedule */}
            <section className="glass-section">
              <h3 className="section-title"><Clock size={18}/> Upcoming Schedule</h3>
              <div className="mini-schedule-list">
                {schedule.filter(s => s.status === 'PENDING').slice(0, 3).map(s => (
                  <div className="mini-item" key={s.id}>
                    <div className="date-box">
                      <p className="month">{new Date(s.dueDate).toLocaleString('default', { month: 'short' })}</p>
                      <p className="day">{new Date(s.dueDate).getDate()}</p>
                    </div>
                    <div className="item-info">
                      <p className="inst">Installment #{s.installmentNo}</p>
                      <p className="amt">₹{s.emiAmount}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                ))}
              </div>
            </section>

            {/* Recent History */}
            <section className="glass-section mt-4">
              <h3 className="section-title"><History size={18}/> Payment History</h3>
              <div className="mini-history-list">
                {paymentHistory.slice(0, 5).map(h => (
                  <div className="history-item" key={h.id}>
                    <div className="h-icon"><Receipt size={18}/></div>
                    <div className="h-info">
                      <p className="h-amt">₹{h.amountPaid}</p>
                      <p className="h-date">{new Date(h.paidDate).toLocaleDateString()}</p>
                    </div>
                    <span className="h-mode">{h.paymentMode}</span>
                  </div>
                ))}
                {paymentHistory.length === 0 && <p className="empty-txt">No transactions found.</p>}
              </div>
            </section>
          </div>
        </div>

        {/* Security Badge */}
        <footer className="portal-footer">
          <div className="security-tag">
             <ShieldCheck size={16} />
             <span>Secure Payments by Razorpay • SSL Encrypted</span>
          </div>
          <p>© 2024 Daily Management System • Dedicated EMI Portal</p>
        </footer>
      </div>
    </div>
  );
};

export default CustomerPayment;
