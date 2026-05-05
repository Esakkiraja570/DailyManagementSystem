import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Mail, Lock, ArrowLeft, ShieldCheck, User, MapPin, Key, AlertCircle } from 'lucide-react';
import '../../Auth/Auth.css';

const BASE_URL = "http://localhost:1010";

const EMIAuth = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
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
    
    if (method !== 'GET' && body) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${BASE_URL}${url}`, options);
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        // Capture backend error messages properly
        const errorMsg = typeof data === 'object' ? data.message : data;
        throw new Error(errorMsg || `Error: ${res.status}`);
      }

      return data;
    } catch (err) {
      // Catch network errors or throw captured errors
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
        // ✅ Logic Fix: Use Query Parameter to match @RequestParam in Controller
        // Backend: @GetMapping("/search") ResponseEntity<?> searchByMobile(@RequestParam String mobile)
        const data = await apiCall(`/customer/search?mobile=${formData.mobile}`, 'GET');

        if (!data) throw new Error("Customer profile not found ❌");

        alert('Welcome Back! ✅');
        localStorage.setItem('emiCustomer', JSON.stringify(data));
        navigate(`/agent/customer`); 

      } else if (showForgot) {
        await apiCall('/agent/verify-otp', 'POST', { mobile: formData.mobile, otp: formData.otp });
        await apiCall('/agent/reset-password', 'POST', { mobile: formData.mobile, newPassword: formData.newPassword });
        alert('Success! Please login with your new password.');
        setShowForgot(false);
        setIsLogin(true);

      } else if (isLogin) {
        const data = await apiCall('/agent/login', 'POST', {
          mobile: formData.mobile,
          password: formData.password,
        });
        localStorage.setItem('emiAgent', JSON.stringify(data));
        navigate('/agent/admin');

      } else {
        await apiCall('/agent/register', 'POST', {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          area: formData.area
        });
        
        // Auto Login
        const loginData = await apiCall('/agent/login', 'POST', {
          mobile: formData.mobile,
          password: formData.password,
        });
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
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <button className="btn btn-link text-muted p-0 mb-4 text-decoration-none d-flex align-items-center gap-2"
            onClick={() => showForgot ? setShowForgot(false) : navigate(`/select-role/agent`)}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="d-flex align-items-center gap-2 mb-2">
            <ShieldCheck size={24} className="text-black" />
            <span className="fw-bold extra-small tracking-widest text-uppercase">Secure Gateway</span>
          </div>
          <h2>{showForgot ? 'Reset Password' : (role === 'customer' ? 'Customer Portal' : (isLogin ? 'Agent Sign In' : 'Agent Join'))}</h2>
          <p>EMI Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 mb-4 p-2 small">
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {showForgot ? (
            <>
              <div className="form-group mb-3">
                <label className="extra-small fw-bold">Mobile</label>
                <div className="d-flex gap-2">
                   <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control" placeholder="10 digits" required />
                   <button type="button" onClick={handleSendOtp} className="btn btn-black btn-sm" disabled={loading}>OTP</button>
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="extra-small fw-bold">Code</label>
                <input name="otp" value={formData.otp} onChange={handleChange} className="form-control" placeholder="4-digit code" required />
              </div>
              <div className="form-group">
                <label className="extra-small fw-bold">New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-control" placeholder="••••" required />
              </div>
            </>
          ) : role === 'customer' ? (
            <div className="form-group">
              <label className="extra-small fw-bold">Registered Mobile Number</label>
              <div className="position-relative">
                <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="form-control ps-5" placeholder="9876543210" required />
              </div>
            </div>
          ) : (
            <>
              {!isLogin && (
                <>
                  <div className="form-group mb-3">
                    <label className="extra-small fw-bold">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="John Doe" required />
                  </div>
                  <div className="form-group mb-3">
                    <label className="extra-small fw-bold">Service Area</label>
                    <input name="area" value={formData.area} onChange={handleChange} className="form-control" placeholder="Location" required />
                  </div>
                </>
              )}
              <div className="form-group mb-3">
                <label className="extra-small fw-bold">Mobile</label>
                <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control" placeholder="Mobile" required />
              </div>
              <div className="form-group">
                <label className="extra-small fw-bold">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="••••" required />
              </div>
              {isLogin && <p className="text-end small mt-1"><span className="text-primary pointer" onClick={() => setShowForgot(true)}>Forgot?</span></p>}
            </>
          )}

          <button type="submit" className="auth-submit mt-4" disabled={loading}>
            {loading ? 'Wait...' : (showForgot ? 'Reset' : (role === 'customer' ? 'Verify Mobile' : (isLogin ? 'Login' : 'Register')))}
          </button>

          {!showForgot && role !== 'customer' && (
            <div className="text-center mt-3 small">
              {isLogin ? "New Agent? " : "Joined already? "}
              <button type="button" className="btn btn-link p-0 text-primary fw-bold text-decoration-none small" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EMIAuth;