import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Lock, ArrowLeft, ShieldCheck, User, MapPin, Eye, EyeOff, LogIn, UserPlus, HelpCircle, AlertCircle } from 'lucide-react';
import './EmiCustomer/EMIAuth.css';

const BASE_URL = "http://localhost:1010";

const EMIAuth = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    area: '',
    otp: '',
    newPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const apiCall = async (url, method, body) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (method !== 'GET' && body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`${BASE_URL}${url}`, options);
      const contentType = res.headers.get("content-type");
      let data = contentType && contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        const errorMsg = typeof data === 'object' ? data.message : data;
        throw new Error(errorMsg || `Error: ${res.status}`);
      }
      return data;
    } catch (err) {
      throw new Error(err.message === "Failed to fetch" ? "Server is offline ❌" : err.message);
    }
  };

  const validate = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.mobile)) return "Enter a valid 10-digit mobile number";
    if (showForgot) {
      if (!formData.otp) return "OTP is required";
      if (formData.newPassword.length < 4) return "Password too short";
    } else if (role === 'agent') {
      if (!formData.password) return "Password required";
      if (!isLogin && !formData.name.trim()) return "Full name is required";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      if (role === 'customer') {
        const data = await apiCall(`/customer/search?mobile=${formData.mobile}`, 'GET');
        if (!data) throw new Error("Customer profile not found ❌");
        alert('Welcome Back! ✅');
        localStorage.setItem('emiCustomer', JSON.stringify(data));
        navigate(`/agent/customer`); 
      } else if (showForgot) {
        await apiCall('/agent/verify-otp', 'POST', { mobile: formData.mobile, otp: formData.otp });
        await apiCall('/agent/reset-password', 'POST', { mobile: formData.mobile, newPassword: formData.newPassword });
        alert('Success! Please login with your new password.');
        setShowForgot(false); setIsLogin(true);
      } else if (isLogin) {
        const data = await apiCall('/agent/login', 'POST', { mobile: formData.mobile, password: formData.password });
        localStorage.setItem('emiAgent', JSON.stringify(data));
        navigate('/agent/admin');
      } else {
        await apiCall('/agent/register', 'POST', { ...formData });
        const loginData = await apiCall('/agent/login', 'POST', { mobile: formData.mobile, password: formData.password });
        localStorage.setItem('emiAgent', JSON.stringify(loginData));
        navigate('/agent/admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(formData.mobile)) return setError("Valid mobile required for OTP");
    setLoading(true);
    try {
      await apiCall('/agent/send-otp', 'POST', { mobile: formData.mobile });
      alert('OTP sent to your mobile.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-master-container">
      {/* Navbar matching Image 2 */}
      <nav className="auth-navbar">
        <div className="nav-brand">EMI Gateway</div>
        <div className="nav-actions">
           <ShieldCheck size={20} />
           <HelpCircle size={20} />
        </div>
      </nav>

      <div className="auth-content">
        <button className="back-link-btn" onClick={() => showForgot ? setShowForgot(false) : navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="auth-card shadow-sm">
          <div className="card-header">
            <div className="secure-tag">
              <ShieldCheck size={14} /> SECURE GATEWAY
            </div>
            <h2>
              {showForgot ? 'Reset Password' : (role === 'customer' ? 'Customer Portal' : (isLogin ? 'Agent Sign In' : 'Agent Join'))}
            </h2>
            <p className="card-subtitle">EMI Management System</p>
          </div>

          {error && (
            <div className="auth-alert error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-main-form">
            {showForgot ? (
              <>
                <label className="form-label">Mobile Number</label>
                <div className="otp-row mb-3">
                  <div className="input-icon-group flex-grow-1">
                    <Phone className="field-icon" size={18} />
                    <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control" placeholder="+1 (555) 000-0000" required />
                  </div>
                  <button type="button" onClick={handleSendOtp} className="btn-send-otp" disabled={loading}>Send OTP</button>
                </div>

                <label className="form-label">Verification Code</label>
                <input name="otp" value={formData.otp} onChange={handleChange} className="form-control text-center tracking-widest mb-3" placeholder="••••" maxLength={4} required />
                
                <label className="form-label">New Password</label>
                <div className="input-icon-group">
                  <Lock className="field-icon" size={18} />
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-control" placeholder="••••••••" required />
                </div>
              </>
            ) : role === 'customer' ? (
              <div className="form-group mb-4">
                <label className="form-label">Registered Mobile Number</label>
                <div className="input-icon-group">
                  <Phone className="field-icon" size={18} />
                  <input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="form-control" placeholder="Enter your mobile number" required />
                </div>
              </div>
            ) : (
              <>
                {!isLogin && (
                  <>
                    <label className="form-label">Full Name</label>
                    <div className="input-icon-group mb-3">
                      <User className="field-icon" size={18} />
                      <input name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="John Doe" required />
                    </div>
                    <label className="form-label">Service Area (Location)</label>
                    <div className="input-icon-group mb-3">
                      <MapPin className="field-icon" size={18} />
                      <input name="area" value={formData.area} onChange={handleChange} className="form-control" placeholder="New York, NY" required />
                    </div>
                  </>
                )}
                <label className="form-label">Mobile Number</label>
                <div className="input-icon-group mb-3">
                  <Phone className="field-icon" size={18} />
                  <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control" placeholder="Enter registered mobile" required />
                </div>
                <div className="d-flex justify-content-between align-items-end mb-1">
                  <label className="form-label mb-0">Password</label>
                  {isLogin && <span className="forgot-text-btn" onClick={() => setShowForgot(true)}>Forgot?</span>}
                </div>
                <div className="input-icon-group">
                  <Lock className="field-icon" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="••••••••" required />
                  <div className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-auth-submit mt-4" disabled={loading}>
              {loading ? 'Processing...' : (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  {showForgot ? 'Reset Password' : (role === 'customer' ? 'Verify Mobile' : (isLogin ? 'Login' : 'Register'))}
                  <LogIn size={18} />
                </span>
              )}
            </button>

            {!showForgot && role !== 'customer' && (
              <>
                <div className="auth-divider">
                  <span>AUTHORIZED ACCESS ONLY</span>
                </div>
                <div className="auth-footer-toggle">
                  {isLogin ? "New Agent? " : "Joined already? "}
                  <span className="toggle-action" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Create Account" : "Sign In"}
                  </span>
                </div>
              </>
            )}

            {role === 'customer' && (
               <div className="mt-4 text-center small text-muted">
                 Need help accessing your account? <span className="text-primary fw-bold pointer">Contact Support</span>
               </div>
            )}
          </form>
        </div>

        {/* Info Boxes based on Screen Type */}
        <div className="bottom-info-area">
          {isLogin && !showForgot ? (
            <div className="security-disclaimer">
              <ShieldCheck size={20} className="text-primary mt-1" />
              <p>By logging in, you agree to comply with EMI Management System security protocols. All sessions are monitored and encrypted for regulatory compliance.</p>
            </div>
          ) : (
            <div className="trust-badges row g-3">
              <div className="col-6">
                <div className="trust-card">
                  <ShieldCheck size={18} className="text-primary" />
                  <span>ISO 27001 Certified Security</span>
                </div>
              </div>
              <div className="col-6">
                <div className="trust-card">
                  <Lock size={18} className="text-primary" />
                  <span>End-to-End Encryption Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="auth-footer">
        <div className="footer-left">EMI Gateway <span>© 2024 EMI Management System. Secure Fidelity Encryption.</span></div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security Whitepaper</a>
        </div>
      </footer>
    </div>
  );
};

export default EMIAuth;