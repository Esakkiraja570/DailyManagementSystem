import React, { useState } from 'react';
import {
  CheckCircle, XCircle, Loader2,
  ShieldCheck, Zap, IndianRupee
} from 'lucide-react';
import { BASE_URL } from '../milkmanApi';

const RAZORPAY_KEY = 'rzp_test_SiUZm0fwjT39g4';

/**
 * RazorpayPayment Component
 *
 * Props:
 *  - amount       : number  — total amount in rupees (e.g. 1200)
 *  - customerName : string  — customer's name
 *  - customerMobile: string — customer's mobile (prefill)
 *  - description  : string  — payment description shown in modal
 *  - onSuccess    : fn(paymentId, orderId, signature) — called on success
 *  - onFailure    : fn(error) — called on failure
 */
const RazorpayPayment = ({
  amount = 0,
  customerName = '',
  customerMobile = '',
  description = 'Milk Bill Payment',
  onSuccess,
  onFailure
}) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | failed
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    if (amount <= 0) {
      setErrorMsg('No amount due. Your bill is clear! ✅');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load. Check your connection.');

      // 2. Create order from Spring Boot backend
      const res = await fetch(`${BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!res.ok) throw new Error('Failed to create payment order. Please try again.');
      const orderText = await res.text();
      const order = JSON.parse(orderText);

      // 3. Open Razorpay checkout modal
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Dairy Management System',
        description,
        order_id: order.id,
        prefill: {
          name: customerName,
          contact: customerMobile,
        },
        theme: { color: '#3b82f6' },
        modal: {
          ondismiss: () => setStatus('idle')
        },
        handler: async (response) => {
          setPaymentId(response.razorpay_payment_id);
          setStatus('success');

          // Send SMS Notification for successful payment
          if (customerMobile) {
            try {
              const msg = `Dear ${customerName || 'Customer'}, your payment of Rs.${amount} was successful. Ref: ${response.razorpay_payment_id}. Thank you!`;
              await fetch(`${BASE_URL}/sms/send?mobile=${customerMobile}&message=${encodeURIComponent(msg)}`, {
                method: 'POST'
              });
            } catch (err) {
              console.error('Failed to send SMS notification', err);
            }
          }

          if (onSuccess) onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setErrorMsg(response.error.description || 'Payment failed.');
        setStatus('failed');
        if (onFailure) onFailure(response.error);
      });

      setStatus('idle');
      rzp.open();

    } catch (err) {
      setErrorMsg(err.message);
      setStatus('failed');
    }
  };

  // ── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white animate-fade-in" style={{maxWidth:480,margin:'0 auto'}}>
        <CheckCircle size={72} className="text-success mx-auto mb-4" />
        <h3 className="fw-bold mb-2">Payment Successful! 🎉</h3>
        <p className="text-muted mb-1">Your milk bill has been paid successfully.</p>
        <div className="bg-success bg-opacity-10 rounded-3 p-3 my-4 text-start">
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small fw-bold">AMOUNT PAID</span>
            <span className="fw-bold text-success">₹{parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small fw-bold">PAYMENT ID</span>
            <span className="fw-bold small text-success">{paymentId}</span>
          </div>
        </div>
        <button className="btn btn-outline-dark rounded-pill px-5 py-2" onClick={() => setStatus('idle')}>
          Done
        </button>
      </div>
    );
  }

  // ── MAIN PAYMENT UI ───────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">Pay with Razorpay</h3>
      <p className="text-muted small mb-5">Secure online payment via Credit/Debit card, UPI, Net Banking & Wallets.</p>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-6">

          {/* Amount Card */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 text-center">
            <div className="bg-primary bg-opacity-10 rounded-4 p-4 mb-4">
              <p className="text-muted small fw-bold text-uppercase mb-1">Total Amount Due</p>
              <h1 className="fw-bold text-primary mb-0" style={{fontSize:'3rem'}}>
                <IndianRupee size={28} className="mb-1" />
                {parseFloat(amount).toFixed(2)}
              </h1>
              <p className="text-muted extra-small mb-0 mt-1">{description}</p>
            </div>

            {/* Accepted methods */}
            <p className="text-muted small mb-3 fw-bold">Accepted Payment Methods</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
              {[
                {emoji: '💳', label: 'Card'},
                {emoji: '📱', label: 'UPI'},
                {emoji: '🏦', label: 'Net Banking'},
                {emoji: '👛', label: 'Wallet'},
                {emoji: '📋', label: 'EMI'},
              ].map(m => (
                <div key={m.label} className="d-flex flex-column align-items-center gap-1">
                  <div className="bg-light rounded-3 p-2" style={{fontSize:'1.4rem'}}>{m.emoji}</div>
                  <small className="text-muted" style={{fontSize:'10px'}}>{m.label}</small>
                </div>
              ))}
            </div>

            {/* Error */}
            {(status === 'failed' || errorMsg) && (
              <div className="alert border-0 rounded-3 d-flex align-items-center gap-2 text-danger bg-danger bg-opacity-10 mb-4">
                <XCircle size={18} /><span className="small">{errorMsg || 'Payment failed. Please try again.'}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              className="btn btn-primary w-100 py-3 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 shadow"
              style={{fontSize:'1.05rem'}}
              onClick={handlePay}
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? <><Loader2 size={20} className="animate-spin" /> Creating Order...</>
                : <><Zap size={20} /> Pay ₹{parseFloat(amount).toFixed(2)} Now</>
              }
            </button>
          </div>

          {/* Trust Badge */}
          <div className="d-flex align-items-center justify-content-center gap-3 text-muted small">
            <ShieldCheck size={18} className="text-success" />
            <span>256-bit SSL encrypted · Powered by Razorpay</span>
          </div>
        </div>

        {/* Side Info */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h6 className="fw-bold mb-4">Payment Info</h6>
            <div className="d-flex flex-column gap-3">
              {[
                ['Customer', customerName || '—'],
                ['Mobile', customerMobile || '—'],
                ['Description', description],
                ['Amount', `₹${parseFloat(amount).toFixed(2)}`],
                ['Gateway', 'Razorpay (Test Mode)'],
              ].map(([k, v]) => (
                <div key={k} className="d-flex flex-column border-bottom pb-2">
                  <span className="text-muted extra-small fw-bold text-uppercase">{k}</span>
                  <span className="fw-bold small">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-warning bg-opacity-10 rounded-3">
              <p className="extra-small text-warning fw-bold mb-1">⚠️ Test Mode Active</p>
              <p className="extra-small text-muted mb-0">Use card <strong>4111 1111 1111 1111</strong> with any future expiry and CVV to test.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
