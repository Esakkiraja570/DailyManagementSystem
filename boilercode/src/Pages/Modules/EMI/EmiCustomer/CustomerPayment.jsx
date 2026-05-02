import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../Components/DashboardLayout';
import { 
  CreditCard, ShieldCheck, History, Loader2, CheckCircle, AlertCircle, 
  Download, Receipt, TrendingUp, Calendar, AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';

const BASE_URL = "http://localhost:1010";

// Dynamically load Razorpay SDK
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
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
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ show: false, success: false, msg: '' });

  useEffect(() => {
    const storedCustomer = JSON.parse(localStorage.getItem('emiCustomer') || 'null');
    if (storedCustomer) {
      setCustomer(storedCustomer);
      fetchCustomerData(storedCustomer.id);
      fetchPaymentHistory(storedCustomer.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCustomerData = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/customer/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
        localStorage.setItem('emiCustomer', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to refresh customer data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (id) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/payment/history/${id}`);
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

  const downloadReceipt = (payment) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("PAYMENT RECEIPT", 105, 25, { align: 'center' });
    
    // Receipt Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Receipt No: DMS-${payment.id || Math.floor(Math.random()*100000)}`, 20, 50);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 190, 50, { align: 'right' });
    
    doc.line(20, 55, 190, 55);
    
    // Customer Info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(customer.name, 20, 80);
    doc.text(customer.mobile1 || customer.mobile, 20, 88);
    doc.text(customer.address || "N/A", 20, 96);

    // Payment Summary Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 110, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 117);
    doc.text("Amount", 185, 117, { align: 'right' });
    
    // Table Content
    doc.setFont("helvetica", "normal");
    doc.text(`EMI Payment for ${customer.productName || 'Loan Account'}`, 25, 130);
    doc.text(`Rs. ${payment.amount.toLocaleString()}`, 185, 130, { align: 'right' });
    
    doc.line(20, 140, 190, 140);
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 140, 150);
    doc.text(`Rs. ${payment.amount.toLocaleString()}`, 185, 150, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("This is an electronically generated receipt. No signature required.", 105, 180, { align: 'center' });
    doc.text("Thank you for using Daily Management System!", 105, 190, { align: 'center' });
    
    doc.save(`Receipt_${customer.name}_${payment.id || 'EMI'}.pdf`);
  };

  const handlePayEMI = async () => {
    if (!customer) return;
    setPaying(true);
    setPaymentStatus({ show: false, success: false, msg: '' });

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load. Are you online?");

      const orderRes = await fetch(`${BASE_URL}/payment/create-order/${customer.id}`, { method: 'POST' });
      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(errText || "Failed to create payment order");
      }
      
      const orderData = await orderRes.json();

      const options = {
        key: 'rzp_test_SiUZm0fwjT39g4', 
        amount: orderData.amount, 
        currency: orderData.currency || 'INR',
        name: 'DMS EMI Payment',
        description: `EMI + Late Fee for ${customer.productName || 'Loan'}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${BASE_URL}/payment/verify/${customer.id}`, { method: 'POST' });
            if (!verifyRes.ok) throw new Error("Payment verification failed on server");
            
            const updatedCustomer = await verifyRes.json();
            setCustomer(updatedCustomer);
            localStorage.setItem('emiCustomer', JSON.stringify(updatedCustomer));
            fetchPaymentHistory(customer.id);
            
            setPaymentStatus({ show: true, success: true, msg: `Payment Successful! Your balance is updated.` });
          } catch (err) {
            setPaymentStatus({ show: true, success: false, msg: err.message });
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: customer.name,
          contact: customer.mobile1 || customer.mobile
        },
        theme: { color: '#000000' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentStatus({ show: true, success: false, msg: response.error.description });
        setPaying(false);
      });
      rzp.open();

    } catch (err) {
      setPaymentStatus({ show: true, success: false, msg: err.message });
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Customer EMI Portal" moduleName="agent" role="customer">
        <div className="d-flex justify-content-center p-5"><Loader2 size={40} className="animate-spin text-black" /></div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer EMI Portal" moduleName="agent" role="customer">
        <div className="text-center p-5 glass rounded-4">
          <AlertCircle size={48} className="text-danger mb-3" />
          <h5 className="fw-bold">Session Expired</h5>
          <p className="text-muted">Please log in again to view your EMI details.</p>
          <button className="btn btn-black rounded-pill px-4" onClick={() => window.location.href='/auth/agent/customer'}>Go to Login</button>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercent = customer.totalAmount ? Math.min(100, (customer.totalPaid / customer.totalAmount) * 100).toFixed(1) : 0;
  const isOverdue = customer.lateFee > 0;

  return (
    <DashboardLayout title={`Hello, ${customer.name}`} moduleName="agent" role="customer">
      
      {paymentStatus.show && (
        <div className={`alert border-0 rounded-4 mb-4 d-flex align-items-center gap-3 animate-fade-in ${paymentStatus.success ? 'alert-success bg-success bg-opacity-10 text-success' : 'alert-danger bg-danger bg-opacity-10 text-danger'}`}>
          {paymentStatus.success ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
          <div className="fw-bold">{paymentStatus.msg}</div>
        </div>
      )}

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="glass p-0 border-0 rounded-4 overflow-hidden shadow-sm mb-4">
            <div className="p-4 bg-black text-white">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <p className="extra-small text-white text-opacity-50 text-uppercase fw-bold mb-1">Loan Account</p>
                  <h4 className="fw-bold mb-0">{customer.productName || 'Personal Loan'}</h4>
                </div>
                <div className="text-end">
                  <p className="extra-small text-white text-opacity-50 text-uppercase fw-bold mb-1">Status</p>
                  <span className={`badge rounded-pill ${customer.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} bg-opacity-20 text-white border border-white border-opacity-20`}>
                    {customer.status}
                  </span>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <p className="extra-small text-white text-opacity-50 text-uppercase fw-bold mb-1">Outstanding Balance</p>
                  <h2 className="fw-bold mb-0">₹{(customer.balance + (customer.lateFee || 0)).toLocaleString()}</h2>
                  {isOverdue && <p className="extra-small text-danger fw-bold mt-1">Includes ₹{customer.lateFee} Late Fee</p>}
                </div>
                <div className="col-md-6 text-md-end">
                  <p className="extra-small text-white text-opacity-50 text-uppercase fw-bold mb-1">Next EMI Due</p>
                  <h4 className="fw-bold mb-0">{customer.dueDate}th of Month</h4>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-bold">Repayment Progress</span>
                  <span className="small fw-bold">{progressPercent}%</span>
                </div>
                <div className="progress bg-light rounded-pill" style={{ height: '12px' }}>
                  <div className="progress-bar bg-black rounded-pill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-4 bg-light text-center">
                    <p className="extra-small text-muted mb-1">Total Loan</p>
                    <p className="fw-bold mb-0 small">₹{customer.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-4 bg-light text-center">
                    <p className="extra-small text-muted mb-1">Total Paid</p>
                    <p className="fw-bold mb-0 text-success small">₹{customer.totalPaid?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-4 bg-light text-center">
                    <p className="extra-small text-muted mb-1">EMI Amount</p>
                    <p className="fw-bold mb-0 small">₹{customer.emiAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-4 bg-light text-center">
                    <p className="extra-small text-muted mb-1">Months</p>
                    <p className="fw-bold mb-0 small">{customer.months} Mo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-4 border-0 rounded-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-3 rounded-circle ${isOverdue ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                {isOverdue ? <AlertTriangle size={24}/> : <Calendar size={24}/>}
              </div>
              <div>
                <h6 className="fw-bold mb-1">{isOverdue ? 'Overdue Payment' : 'Upcoming EMI'}</h6>
                <p className="extra-small text-muted mb-0">
                  {isOverdue 
                    ? `You are ${customer.lateDays} days late. Please pay to avoid further fees.` 
                    : `Your next EMI is due on ${customer.dueDate}th. Keep your account funded.`}
                </p>
              </div>
            </div>
            <button 
              className={`btn ${isOverdue ? 'btn-danger' : 'btn-black'} rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 shadow-lg transition-transform hover-scale`}
              onClick={handlePayEMI}
              disabled={paying || customer.balance <= 0}
            >
              {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              {paying ? 'Processing...' : (customer.balance <= 0 ? 'Loan Completed' : `Pay ₹${(customer.emiAmount + (customer.lateFee || 0)).toLocaleString()}`)}
            </button>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass p-4 border-0 rounded-4 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2"><History size={20}/> History</h5>
            </div>

            <div className="history-list d-flex flex-column gap-3">
              {historyLoading ? (
                <div className="text-center py-5"><Loader2 className="animate-spin text-muted" /></div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-5 opacity-50">
                   <Receipt size={32} className="mb-2 opacity-20" />
                   <p className="extra-small">No transaction history found.</p>
                </div>
              ) : (
                paymentHistory.map((h, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center p-3 rounded-4 bg-light border-start border-4 border-success shadow-sm">
                    <div>
                      <p className="fw-bold mb-0 small">₹{h.amount?.toLocaleString()}</p>
                      <p className="extra-small text-muted mb-0">{new Date(h.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-link text-black p-0" title="Download Receipt" onClick={() => downloadReceipt(h)}>
                        <Download size={16}/>
                      </button>
                      <div className="text-end">
                        <span className="extra-small fw-bold text-success d-block">SUCCESS</span>
                        <p className="extra-small text-muted mb-0">{h.mode}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-4 border-top">
              <h6 className="fw-bold small mb-3">Support & Security</h6>
              <div className="d-flex align-items-center gap-3 mb-3">
                <ShieldCheck className="text-success" size={20} />
                <p className="extra-small text-muted mb-0">Payments are 100% secure with Razorpay SSL Encryption.</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <TrendingUp className="text-primary" size={20} />
                <p className="extra-small text-muted mb-0">Timely payments help improve your internal credit score.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerPayment;


