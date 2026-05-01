import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../Components/DashboardLayout';
import { CreditCard, ShieldCheck, History, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ show: false, success: false, msg: '' });

  useEffect(() => {
    const storedCustomer = JSON.parse(localStorage.getItem('emiCustomer') || 'null');
    if (storedCustomer) {
      setCustomer(storedCustomer);
    }
    setLoading(false);
  }, []);

  const handlePayEMI = async () => {
    if (!customer) return;
    setPaying(true);
    setPaymentStatus({ show: false, success: false, msg: '' });

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load. Are you online?");

      // Step 1: Create Order
      const orderRes = await fetch(`${BASE_URL}/payment/create-order/${customer.id}`, { method: 'POST' });
      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(errText || "Failed to create payment order");
      }
      
      const orderData = await orderRes.json();

      // Step 2: Initialize Razorpay
      const options = {
        key: 'rzp_test_SiUZm0fwjT39g4', // Using the valid test key from backend config
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'DMS EMI Payment',
        description: `EMI Payment for ${customer.productName || 'Loan'}`,
        order_id: orderData.id,
        handler: async function (response) {
          // Step 3: Verify Payment
          try {
            const verifyRes = await fetch(`${BASE_URL}/payment/verify/${customer.id}`, { method: 'POST' });
            if (!verifyRes.ok) throw new Error("Payment verification failed on server");
            
            const updatedCustomer = await verifyRes.json();
            setCustomer(updatedCustomer);
            localStorage.setItem('emiCustomer', JSON.stringify(updatedCustomer));
            
            setPaymentStatus({ show: true, success: true, msg: `Payment of ₹${customer.emiAmount} successful!` });
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
        theme: {
          color: '#0d6efd'
        }
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
      <DashboardLayout title="EMI & Payments" moduleName="agent" role="customer">
        <div className="d-flex justify-content-center p-5"><Loader2 size={40} className="animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="EMI & Payments" moduleName="agent" role="customer">
        <div className="text-center p-5">
          <AlertCircle size={48} className="text-danger mb-3" />
          <h5>Not Logged In</h5>
          <p className="text-muted">Please log in to view your EMI details.</p>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercent = customer.totalAmount ? Math.min(100, (customer.totalPaid / customer.totalAmount) * 100).toFixed(1) : 0;

  return (
    <DashboardLayout title={`Welcome, ${customer.name}`} moduleName="agent" role="customer">
      
      {paymentStatus.show && (
        <div className={`alert border-0 rounded-4 mb-4 d-flex align-items-center gap-3 ${paymentStatus.success ? 'alert-success bg-success bg-opacity-10 text-success' : 'alert-danger bg-danger bg-opacity-10 text-danger'}`}>
          {paymentStatus.success ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
          <div className="fw-bold">{paymentStatus.msg}</div>
        </div>
      )}

      <div className="row g-4 mb-5">
        <div className="col-lg-7">
          <div className="glass p-4 h-100 d-flex flex-column">
            <h5 className="fw-bold mb-4">Active EMI Details</h5>
            
            {customer.productName && (
              <div className="mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold mb-2">{customer.productName}</span>
              </div>
            )}

            <div className="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-20 mb-4">
              <div className="row g-4">
                <div className="col-6">
                  <p className="extra-small text-muted text-uppercase fw-bold mb-1">Total Payable</p>
                  <h4 className="fw-bold mb-0">₹{customer.totalAmount?.toFixed(2) || '0.00'}</h4>
                </div>
                <div className="col-6 text-end">
                  <p className="extra-small text-muted text-uppercase fw-bold mb-1">Paid Amount</p>
                  <h4 className="fw-bold mb-0 text-success">₹{customer.totalPaid?.toFixed(2) || '0.00'}</h4>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="extra-small fw-bold">Repayment Progress</span>
                    <span className="extra-small fw-bold text-primary">{progressPercent}%</span>
                  </div>
                  <div className="progress bg-dark bg-opacity-10 rounded-pill" style={{ height: '8px' }}>
                    <div className="progress-bar bg-primary rounded-pill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-auto border border-white border-opacity-20">
              <div className="mb-3 mb-md-0">
                <h6 className="fw-bold mb-1">Next EMI Due</h6>
                <p className="extra-small text-muted mb-0">Due Date: {customer.dueDate ? `${customer.dueDate} of the month` : 'N/A'}</p>
                <span className={`badge rounded-pill mt-2 ${customer.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} bg-opacity-20 text-${customer.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                  Status: {customer.status}
                </span>
              </div>
              <div className="text-md-end">
                <p className="extra-small text-muted mb-1 text-uppercase fw-bold">EMI Amount</p>
                <h3 className="fw-bold mb-3 text-primary">₹{customer.emiAmount?.toFixed(2) || '0.00'}</h3>
                <button 
                  className="btn btn-primary px-5 rounded-pill shadow-sm d-flex align-items-center gap-2 fw-bold" 
                  onClick={handlePayEMI}
                  disabled={paying || customer.status !== 'ACTIVE' || customer.balance <= 0}
                >
                  {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                  {paying ? 'Processing...' : (customer.balance <= 0 ? 'Loan Cleared' : 'Pay EMI Now')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass p-4 h-100">
            <h5 className="fw-bold mb-4">Account Summary</h5>
            
            <div className="d-flex flex-column gap-3 mb-5">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Principal Loan Amount</span>
                <span className="fw-bold small">₹{customer.loanAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Total Interest</span>
                <span className="fw-bold small">{customer.interest}%</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Total Months</span>
                <span className="fw-bold small">{customer.months || 0} Months</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted small">Outstanding Balance</span>
                <span className="fw-bold small text-danger">₹{customer.balance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <h5 className="fw-bold mb-4">Payment Protection</h5>
            <div className="d-flex align-items-start gap-3 mb-4">
              <ShieldCheck className="text-success" size={24} />
              <div>
                <p className="small fw-bold mb-1">Secure Transactions</p>
                <p className="extra-small text-muted mb-0">Your payments are protected with industry-standard 256-bit encryption by Razorpay.</p>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <History className="text-info" size={24} />
              <div>
                <p className="small fw-bold mb-1">Instant Settlement</p>
                <p className="extra-small text-muted mb-0">Your agent's dashboard is updated instantly the moment your payment succeeds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerPayment;
