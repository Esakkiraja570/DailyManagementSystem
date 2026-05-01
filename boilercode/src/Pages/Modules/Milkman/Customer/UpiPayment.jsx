import React, { useState } from 'react';
import {
  Smartphone, Copy, CheckCircle, ExternalLink,
  Zap, AlertCircle, QrCode, IndianRupee
} from 'lucide-react';

/**
 * UpiPayment Component
 * 
 * Props:
 *  - amount      : number  — total amount to pay (e.g. 1200)
 *  - upiId       : string  — milkman's UPI ID (e.g. "milkman@upi")
 *  - payeeName   : string  — milkman's name shown in the UPI app
 *  - description : string  — payment note (e.g. "Milk Bill - May 2025")
 *  - onSuccess   : fn      — called when customer confirms payment
 */
const UpiPayment = ({ amount = 0, upiId = '', payeeName = 'Milkman', description = 'Milk Bill Payment', onSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const roundedAmount = parseFloat(amount).toFixed(2);

  // UPI deep link — works with GPay, PhonePe, Paytm, BHIM etc.
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${roundedAmount}&cu=INR&tn=${encodeURIComponent(description)}`;

  // QR code via free public API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=1a1a2e&qzone=2`;

  // App-specific deep links
  const apps = [
    { name: 'GPay',    icon: '🟢', link: `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${roundedAmount}&cu=INR` },
    { name: 'PhonePe', icon: '🟣', link: `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${roundedAmount}&cu=INR` },
    { name: 'Paytm',   icon: '🔵', link: `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${roundedAmount}&cu=INR` },
    { name: 'BHIM',    icon: '🟠', link: `bhim://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${roundedAmount}&cu=INR` },
  ];

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = () => {
    setConfirmed(true);
    if (onSuccess) onSuccess();
  };

  if (!upiId) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <AlertCircle size={48} className="text-warning mx-auto mb-3" />
        <h5 className="fw-bold">UPI Not Configured</h5>
        <p className="text-muted small">Your milkman hasn't added a UPI ID yet. Please contact them directly.</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white animate-scale-up">
        <CheckCircle size={72} className="text-success mx-auto mb-3" />
        <h3 className="fw-bold mb-2">Payment Initiated!</h3>
        <p className="text-muted mb-0">Please complete the payment in your UPI app.</p>
        <p className="text-muted small">Your milkman will confirm receipt of <strong>₹{roundedAmount}</strong>.</p>
        <button className="btn btn-outline-dark rounded-pill px-5 py-2 mt-4" onClick={() => setConfirmed(false)}>
          Pay Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h3 className="fw-bold mb-1">Pay Your Bill</h3>
      <p className="text-muted small mb-5">Scan the QR code or tap an app to pay instantly via UPI.</p>

      <div className="row g-4">

        {/* LEFT — Amount + QR */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 text-center h-100">
            {/* Amount Display */}
            <div className="bg-primary bg-opacity-10 rounded-4 p-4 mb-4">
              <p className="text-muted small fw-bold text-uppercase mb-1">Amount Due</p>
              <h1 className="fw-bold text-primary mb-0" style={{fontSize:'2.8rem'}}>
                <IndianRupee size={28} className="mb-1" />{roundedAmount}
              </h1>
              <p className="text-muted extra-small mb-0 mt-1">{description}</p>
            </div>

            {/* QR Code */}
            <div className="mb-4">
              <p className="text-muted small fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                <QrCode size={16}/> Scan with any UPI App
              </p>
              <div className="d-inline-block p-3 border rounded-4 shadow-sm bg-white">
                <img
                  src={qrUrl}
                  alt="UPI QR Code"
                  style={{width:200,height:200,display:'block'}}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            {/* UPI ID copy */}
            <div className="bg-light rounded-3 p-3 d-flex align-items-center justify-content-between gap-3">
              <div className="text-start">
                <p className="extra-small text-muted fw-bold text-uppercase mb-0">UPI ID</p>
                <p className="fw-bold mb-0 small">{upiId}</p>
              </div>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={handleCopyUpiId}>
                {copied ? <CheckCircle size={14}/> : <Copy size={14}/>}
                {copied ? ' Copied!' : ' Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — App shortcuts + confirm */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Smartphone size={20} className="text-primary"/> Pay via App
            </h5>
            <div className="row g-3">
              {apps.map(app => (
                <div key={app.name} className="col-6">
                  <a
                    href={app.link}
                    className={`card border rounded-4 p-3 text-center text-decoration-none d-block transition-all ${selectedApp === app.name ? 'border-primary shadow' : 'border-light'}`}
                    onClick={() => setSelectedApp(app.name)}
                  >
                    <div className="fs-2 mb-1">{app.icon}</div>
                    <div className="fw-bold small">{app.name}</div>
                    <small className="text-muted extra-small d-flex align-items-center justify-content-center gap-1 mt-1">
                      Open App <ExternalLink size={10}/>
                    </small>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Or use direct UPI link */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
            <h6 className="fw-bold mb-3">Or Use Direct UPI Link</h6>
            <a
              href={upiLink}
              className="btn btn-outline-dark w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            >
              <Zap size={18}/> Open UPI Payment
            </a>
          </div>

          {/* Confirmation */}
          <div className="card border-0 shadow-sm rounded-4 p-4" style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)'}}>
            <p className="text-white fw-bold mb-1">✅ Done with payment?</p>
            <p className="text-white opacity-75 small mb-4">
              After completing the UPI payment in your app, click below to notify your milkman.
            </p>
            <button
              className="btn btn-light w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={handleConfirmPayment}
            >
              <CheckCircle size={18}/> I've Paid ₹{roundedAmount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpiPayment;
