import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Lock, ArrowLeft, Droplets, AlertCircle, User, MapPin, Key } from 'lucide-react';
import '../../Auth/Auth.css';
import './MilkmanAuth.css';
import { apiPost, apiGet } from './milkmanApi';

const MilkmanAuth = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // ✅ added

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    area: '',
    otp: '',
    newPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomArea, setShowCustomArea] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const apiCall = apiPost;

  // ✅ FIXED VALIDATION
  const validate = () => {
    if (!/^\d{10}$/.test(formData.mobile))
      return "Enter valid 10-digit mobile number";

    if (showForgot) {
      if (!formData.otp) return "OTP is required";
      if (!formData.newPassword) return "New password required";
    } else if (role === 'admin') {
      if (!formData.password) return "Password required";

      if (!isLogin) {
        if (!formData.name) return "Name is required";
        if (!formData.email) return "Email is required";
        if (!formData.area) return "Please select a service area";
      }
    }

    return null;
  };

  // ✅ FIXED SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);

    try {
      if (role === 'customer') {
        // Customer direct login
        const data = await apiGet(`/customer/login/${formData.mobile}`);
        localStorage.setItem('customerData', JSON.stringify(data));
        localStorage.setItem('customerMobile', formData.mobile);
        alert('Login Successful! Welcome to your Portal.');
        navigate(`/milkman/customer?mobile=${formData.mobile}`);

      } else if (showForgot) {
        // Reset password
        await apiCall('/milkman/reset-password', {
          mobile: formData.mobile,
          otp: formData.otp,
          newPassword: formData.newPassword
        });

        alert('Password Reset Successful! ✅');
        setShowForgot(false);
        setIsLogin(true);
        setOtpSent(false);

      } else if (isLogin) {
        // Admin login
        const data = await apiCall('/milkman/login', {
          mobile: formData.mobile,
          password: formData.password,
        });

        if (data && data.mobile) {
          localStorage.setItem('milkman', JSON.stringify(data));
          localStorage.setItem('milkmanMobile', data.mobile);
          navigate('/milkman/admin');
        }

      } else {
        // Admin register
        await apiCall('/milkman/register', {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          area: formData.area || "General"
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

  // ✅ FIXED OTP SEND
  const handleSendOtp = async () => {
    if (!formData.mobile) return setError("Enter mobile number first");

    setLoading(true);
    try {
      await apiCall('/milkman/send-otp', { mobile: formData.mobile });
      setOtpSent(true);
      alert('OTP Sent Successfully! Check console/SMS.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container milkman-auth-page">
      <div className="auth-card milkman-auth-card animate-fade-in">
        <div className="auth-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-link text-muted p-0 d-flex align-items-center gap-2 text-decoration-none"
              onClick={() => {
                if (showForgot) setShowForgot(false);
                else navigate(`/select-role/milkman`);
              }}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div className="milkman-icon">
              <Droplets size={20} />
            </div>
          </div>
          <h2>
            {showForgot ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join Network')}
          </h2>
          <p className="text-muted">
            Milkman {role === 'admin' ? (showForgot ? 'Recovery' : 'Manager') : 'Customer'} Portal
          </p>
        </div>

        {!showForgot && role === 'admin' && (
          <div className="auth-tabs">
            <button onClick={() => setIsLogin(true)} disabled={loading} className={isLogin ? 'active' : ''}>Login</button>
            <button onClick={() => setIsLogin(false)} disabled={loading} className={!isLogin ? 'active' : ''}>Register</button>
          </div>
        )}

        {error && (
          <div className="error-message">
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
                  <button type="button" onClick={handleSendOtp} className="btn btn-black btn-sm px-3" disabled={loading}>
                    Send OTP
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Verification OTP</label>
                <div className="position-relative">
                  <Key className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input name="otp" value={formData.otp} onChange={handleChange} className="form-control ps-5" placeholder="4-digit OTP" required disabled={!otpSent} />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-control ps-5" placeholder="Enter new password" required disabled={!otpSent} />
                </div>
              </div>
            </>
          ) : role === 'customer' ? (

            <div className="form-group">
              <label>Mobile Number</label>
              <div className="position-relative">
                <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input name="mobile" value={formData.mobile} onChange={handleChange} className="form-control ps-5" placeholder="10-digit mobile number" required />
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

                  <div className="form-group mb-4">
                    <label className="mb-2 small fw-bold">Service Area</label>
                    <div className="area-selection-grid d-flex flex-wrap gap-2 mb-2">
                      {['Downtown', 'Suburbs', 'Northside', 'West End'].map((area) => (
                        <button
                          key={area}
                          type="button"
                          className={`btn btn-sm ${formData.area === area ? 'btn-black' : 'btn-outline-dark'}`}
                          onClick={() => { setFormData({ ...formData, area }); setShowCustomArea(false); }}
                        >
                          {area}
                        </button>
                      ))}

                      <button
                        type="button"
                        className={`btn btn-sm ${showCustomArea ? 'btn-black' : 'btn-outline-dark'}`}
                        onClick={() => { setShowCustomArea(true); setFormData({ ...formData, area: '' }); }}
                      >
                        Other
                      </button>
                    </div>

                    {showCustomArea && (
                      <div className="position-relative animate-fade-in">
                        <MapPin className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input name="area" value={formData.area} onChange={handleChange} className="form-control ps-5" placeholder="Custom Area" required />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Mobile Number</label>
                <div className="position-relative">
                  <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="form-control ps-5" placeholder="10-digit mobile number" required />
                </div>
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="position-relative">
                    <User className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control ps-5" placeholder="you@example.com" required />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Password</label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control ps-5" placeholder="••••••••" required />
                </div>
              </div>

              {isLogin && (
                <p className="text-end extra-small mb-0">
                  <span className="text-primary pointer" onClick={() => { setShowForgot(true); setOtpSent(false); }}>
                    Forgot Password?
                  </span>
                </p>
              )}
            </>
          )}

          <button className="auth-submit mt-4" disabled={loading}>
            {loading ? 'Please wait...' : (showForgot ? 'Reset Password' : (role === 'customer' ? 'Login with OTP' : (isLogin ? 'Sign In' : 'Create Account')))}
          </button>

        </form>
      </div>
    </div>
  );
};

export default MilkmanAuth;