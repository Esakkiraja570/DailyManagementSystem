import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Mail, Lock, ArrowLeft, ShieldCheck, User, MapPin, Key, AlertCircle } from 'lucide-react';
import '../../Auth/Auth.css';

// ✅ FIX: removed /api
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

    // ✅ debug (safe)
    console.log("API CALL:", method, `${BASE_URL}${url}`);

    const res = await fetch(`${BASE_URL}${url}`, options);

    if (res.status === 401) {
      throw new Error('Invalid mobile number or password. Please try again.');
    }

    let data;
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      throw new Error(data.message || data || 'Something went wrong');
    }

    return data;
  };

  const validate = () => {
    if (role === 'customer') {
      if (!/^\d{10}$/.test(formData.mobile)) return "Enter valid 10-digit mobile number";
    } else if (showForgot) {
      if (!formData.mobile) return "Mobile number required";
      if (!formData.otp) return "OTP is required";
      if (!formData.newPassword) return "New password required";
    } else {
      if (!formData.password) return "Password required";
      if (!formData.mobile) return "Mobile number required";
      
      if (!isLogin) {
        if (!formData.name) return "Name is required";
      }
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

        // ✅ FIXED URL ONLY
        const data = await apiCall(`/customer/search/${formData.mobile}`, 'GET');

        // ✅ safe check
        if (!data || !data.id) {
          throw new Error("Customer not found ❌");
        }

        alert('Login Successful! ✅');
        localStorage.setItem('emiCustomer', JSON.stringify(data));
        navigate(`/agent/customer`);

      } else if (showForgot) {

        await apiCall('/agent/verify-otp', 'POST', { mobile: formData.mobile, otp: formData.otp });
        await apiCall('/agent/reset-password', 'POST', { mobile: formData.mobile, newPassword: formData.newPassword });

        alert('Password Reset Successful! ✅');
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

        alert('Registration Successful! ✅ Please Login.');
        setIsLogin(true);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.mobile) return setError("Enter mobile number first");

    setLoading(true);

    try {
      await apiCall('/agent/send-otp', 'POST', { mobile: formData.mobile });
      alert('OTP Sent Successfully! Check your SMS.');
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
          <button 
            className="btn btn-link text-muted p-0 mb-4 text-decoration-none d-flex align-items-center gap-2"
            onClick={() => {
              if (showForgot) setShowForgot(false);
              else navigate(`/select-role/agent`);
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="d-flex align-items-center gap-2 mb-2">
            <ShieldCheck size={24} className="text-black" />
            <span className="fw-bold extra-small tracking-widest text-uppercase">Secure Gateway</span>
          </div>

          <h2>
            {showForgot ? 'Reset Password' : (role === 'customer' ? 'Customer Login' : (isLogin ? 'Agent Login' : 'Agent Onboarding'))}
          </h2>

          <p>EMI & Collection Management</p>
        </div>

        {error && (
          <div className="error-message alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 mb-4 p-2 small">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {showForgot ? (
            <>
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="d-flex gap-2">
                   <div className="position-relative flex-grow-1">
                      <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                      <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control ps-5" placeholder="Enter mobile" required />
                   </div>
                   <button type="button" onClick={handleSendOtp} className="btn btn-black btn-sm px-3" disabled={loading}>Send OTP</button>
                </div>
              </div>

              <div className="form-group">
                <label>Verification OTP</label>
                <div className="position-relative">
                  <Key className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input name="otp" value={formData.otp} onChange={handleChange} className="form-control ps-5" placeholder="4-digit OTP" required />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-control ps-5" placeholder="Enter new password" required />
                </div>
              </div>
            </>
          ) : role === 'customer' ? (
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="position-relative">
                <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="form-control ps-5" placeholder="Enter mobile number" required />
              </div>
            </div>
          ) : (
            <>
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="position-relative">
                      <User className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                      <input name="name" value={formData.name} onChange={handleChange} className="form-control ps-5" placeholder="Your Name" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="position-relative">
                      <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                      <input name="email" type="email" value={formData.email} onChange={handleChange} className="form-control ps-5" placeholder="agent@dms.com" required />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label>Service Area</label>
                    <div className="position-relative">
                      <MapPin className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                      <input name="area" value={formData.area} onChange={handleChange} className="form-control ps-5" placeholder="Operating Area" required />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Mobile Number</label>
                <div className="position-relative">
                  <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control ps-5" placeholder="Mobile Number" required />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control ps-5" placeholder="••••••••" required />
                </div>
              </div>

              {isLogin && (
                <p className="text-end extra-small mb-0">
                  <span className="text-primary pointer" style={{cursor: 'pointer'}} onClick={() => setShowForgot(true)}>Forgot Password?</span>
                </p>
              )}
            </>
          )}

          <button type="submit" className="auth-submit mt-4" disabled={loading}>
            {loading ? 'Processing...' : (showForgot ? 'Reset Password' : (role === 'customer' ? 'Verify & Access EMI' : (isLogin ? 'Sign In to Dashboard' : 'Join Agency')))}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EMIAuth;