import React, { useState } from 'react';
import {
  CheckCircle,
  Loader2,
  IndianRupee,
  ShieldCheck,
  XCircle
} from 'lucide-react';

import { BASE_URL } from './smallshopApi';

const RAZORPAY_KEY = 'rzp_test_SiUZm0fwjT39g4';

const ShopRazorpayPayment = ({
  amount = 0,
  customerName = '',
  customerMobile = '',
  description = 'Store Bill Payment',
  onSuccess
}) => {

  const [status, setStatus] = useState('idle');
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ---------------------------------------------------
  // LOAD RAZORPAY SDK
  // ---------------------------------------------------
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      // already loaded check
      if (window.Razorpay) {
        return resolve(true);
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ---------------------------------------------------
  // HANDLE PAYMENT
  // ---------------------------------------------------
  const handlePay = async () => {
    setErrorMsg('');
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      return setErrorMsg('Invalid bill amount');
    }

    setStatus('loading');

    try {
      // 1. Load SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      // 2. Create Order from Backend
      const response = await fetch(
        `http://localhost:1010/api/smallshop/payment/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: numericAmount // Backend will multiply by 100
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create payment order');
      }

      // Backend returns stringified JSON, we need to parse it if it's a string
      const rawData = await response.json();
      const orderData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      // 3. Razorpay Options
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Small Shop Payment',
        description,
        order_id: orderData.id,
        prefill: {
          name: customerName || 'Customer',
          contact: customerMobile || ''
        },
        notes: {
          customerName,
          customerMobile
        },
        theme: {
          color: '#2563eb'
        },
        handler: async function (response) {
          try {
            setPaymentId(response.razorpay_payment_id);
            setStatus('success');

            if (onSuccess) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              });
            }
          } catch (err) {
            console.error("Verification Error:", err);
            setStatus('failed');
            setErrorMsg('Payment verification failed');
          }
        },
        modal: {
            ondismiss: function() {
                setStatus('idle');
            }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        setStatus('failed');
        setErrorMsg(response?.error?.description || 'Payment failed');
      });

      razorpay.open();

    } catch (err) {
      console.error("Payment Process Error:", err);
      setStatus('failed');
      setErrorMsg(err.message || 'Payment initiation failed');
    }
  };

  // ---------------------------------------------------
  // SUCCESS UI
  // ---------------------------------------------------
  if (status === 'success') {
    return (
      <div
        className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white animate-fade-in"
        style={{ maxWidth: 500, margin: '0 auto' }}
      >
        <CheckCircle size={72} className="text-success mx-auto mb-4" />
        <h2 className="fw-bold mb-2">Payment Successful 🎉</h2>
        <p className="text-muted mb-4">Your payment was completed successfully.</p>

        <div className="bg-success bg-opacity-10 rounded-4 p-4 text-start">
          <div className="d-flex justify-content-between mb-3">
            <span className="small text-muted fw-bold">AMOUNT</span>
            <span className="fw-bold text-success">₹{parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="small text-muted fw-bold">PAYMENT ID</span>
            <span className="fw-bold small text-success">{paymentId}</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------
  return (
    <div className="animate-fade-in">
      <div
        className="card border-0 shadow-sm rounded-4 bg-white p-4"
        style={{ maxWidth: 500, margin: '0 auto' }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-primary" />
              <span className="small fw-bold text-uppercase text-primary">Secure Payment</span>
            </div>
            <p className="small text-muted mb-1">Total Bill Amount</p>
            <h1 className="fw-bold text-primary mb-0" style={{ fontSize: '3rem' }}>
              <IndianRupee size={28} className="mb-1" />
              {parseFloat(amount || 0).toFixed(2)}
            </h1>
          </div>
        </div>

        {/* ERROR */}
        {(status === 'failed' || errorMsg) && (
          <div className="alert alert-danger border-0 rounded-4 d-flex align-items-center gap-2">
            <XCircle size={18} />
            <span className="small fw-bold">{errorMsg}</span>
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          className="btn btn-primary w-100 py-3 rounded-pill fw-bold d-flex justify-content-center align-items-center gap-2"
          onClick={handlePay}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay ₹{parseFloat(amount || 0).toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShopRazorpayPayment;