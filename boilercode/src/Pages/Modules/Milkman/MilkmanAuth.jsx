import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Phone, Lock, ArrowLeft, Droplets, AlertCircle, 
  User, Key, Eye, EyeOff, Truck, ArrowRight 
} from 'lucide-react';
import './MilkmanAuth.css';
import { apiPost, apiGet } from './milkmanApi';

const MilkmanAuth = () => {
  const { role = 'admin' } = useParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCustomArea, setShowCustomArea] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    mobile: '', otp: '', newPassword: '', area: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ INPUT HANDLER (OTP FIX INCLUDED)
  const handleChange = (e) => {
    let { name, value } = e.target;

    // OTP only numbers, max 4
    if (name === 'otp') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    // Mobile only numbers, max 10
    if (name === 'mobile') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData({ ...formData, [name]: value });
  };

  // ✅ VALIDATION (FIXED OTP)
  const validate = () => {
    const { name, email, password, mobile, otp, newPassword, area } = formData;

    if (!/^[6-9]\d{9}$/.test(mobile))
      return "Enter valid 10-digit mobile number";

    if (showForgot) {
      if (!otp) return "OTP is required";
      if (!/^\d{4}$/.test(otp)) return "OTP must be exactly 4 digits";

      if (!newPassword || newPassword.length < 8)
        return "Password must be at least 8 characters";
    }

    if (role === 'admin') {
      if (!password) return "Password required";

      if (!isLogin) {
        if (!name) return "Name required";
        if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter valid email";
        if (!area) return "Select service area";
      }
    }

    return null;
  };

  // ✅ SEND OTP
  const handleSendOtp = async () => {
    if (!formData.mobile) return setError("Enter mobile first");

    setLoading(true);
    try {
      await apiPost('/milkman/send-otp', { mobile: formData.mobile });
      setOtpSent(true);
      alert('OTP Sent Successfully ✅');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errMsg = validate();
    if (errMsg) return setError(errMsg);

    setLoading(true);

    try {
      if (role === 'customer') {
        const data = await apiGet(`/customer/login/${formData.mobile}`);
        localStorage.setItem('customerData', JSON.stringify(data));
        navigate(`/milkman/customer?mobile=${formData.mobile}`);
      } 
      else if (showForgot) {
        await apiPost('/milkman/reset-password', {
          mobile: formData.mobile,
          otp: formData.otp,
          newPassword: formData.newPassword
        });

        alert('Password Reset Successful ✅');
        setShowForgot(false);
        setOtpSent(false);
        setIsLogin(true);
      } 
      else if (isLogin) {
        const data = await apiPost('/milkman/login', {
          mobile: formData.mobile,
          password: formData.password
        });

        localStorage.setItem('milkman', JSON.stringify(data));
        navigate('/milkman/admin');
      } 
      else {
        await apiPost('/milkman/register', {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          area: formData.area || "General"
        });

        alert('Registration Successful ✅');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="df-page-wrapper">

      {/* NAVBAR */}
      <nav className="df-navbar d-flex justify-content-between align-items-center px-lg-5 px-3 py-3">
        <div className="d-flex align-items-center gap-2">
          <div className="back-btn" onClick={() => {
              if(showForgot) setShowForgot(false);
              else navigate(-1);
          }}>
            <ArrowLeft size={18} /> <span>Back</span>
          </div>
          <div className="nav-divider mx-2"></div>
          <span className="brand-logo">DairyFlow</span>
        </div>
      </nav>

      <div className="df-main-content">
        <div className="df-auth-card animate-slide-up">

          {/* HEADER */}
          <div className="text-center mb-4">
            <div className={`brand-icon-box ${role === 'admin' ? 'admin-theme' : 'customer-theme'}`}>
              {role === 'admin' ? <Truck size={24} /> : <Droplets size={24} />}
            </div>
            <h2 className="card-main-title">
              {showForgot ? 'Reset Password' :
                (role === 'customer' ? 'Customer Login' : 'Milkman Manager')}
            </h2>
          </div>

          {/* ERROR */}
          {error && (
            <div className="error-message">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* TABS */}
          {!showForgot && role === 'admin' && (
            <div className="df-custom-tabs">
              <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
              <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">

            {/* FORGOT PASSWORD */}
            {showForgot ? (
              <div className="form-stack">

                <div className="form-group mb-3">
                  <label className="input-label">Mobile Number</label>
                  <div className="input-group-custom action-group">
                    <Phone className="icon-left" size={18} />
                    <input name="mobile" className="form-control" onChange={handleChange} required />
                    <button type="button" className="btn-send-otp" onClick={handleSendOtp}>Send OTP</button>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="input-label">Verification OTP</label>
                  <div className="input-group-custom">
                    <Key className="icon-left" size={18} />
                    <input name="otp" className="form-control" onChange={handleChange} disabled={!otpSent} />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="input-label">New Password</label>
                  <div className="input-group-custom">
                    <Lock className="icon-left" size={18} />
                    <input type="password" name="newPassword" className="form-control" onChange={handleChange} disabled={!otpSent} />
                  </div>
                </div>

              </div>
            ) : role === 'customer' ? (
              <div className="form-group">
                <label className="input-label">Mobile Number</label>
                <div className="input-group-custom">
                  <Phone className="icon-left" size={18} />
                  <input name="mobile" className="form-control" onChange={handleChange} required />
                </div>
              </div>
            ) : (
              <div className="form-stack">

                {!isLogin && (
                  <>
                    <div className="form-group mb-3">
                      <label className="input-label">Full Name</label>
                      <div className="input-group-custom">
                        <User className="icon-left" size={18} />
                        <input name="name" className="form-control" onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="input-label">Email</label>
                      <div className="input-group-custom">
                        <User className="icon-left" size={18} />
                        <input name="email" className="form-control" onChange={handleChange} required />
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
                        <button type="button" className={`btn btn-sm ${showCustomArea ? 'btn-black' : 'btn-outline-dark'}`} onClick={() => setShowCustomArea(true)}>
                          Custom...
                        </button>
                      </div>

                      {showCustomArea && (
                        <div className="input-group-custom mt-2">
                          <input name="area" className="form-control" onChange={handleChange} required />
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="form-group mb-3">
                  <label className="input-label">Mobile Number</label>
                  <div className="input-group-custom">
                    <Phone className="icon-left" size={18} />
                    <input name="mobile" className="form-control" onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="input-label">Password</label>
                  <div className="input-group-custom">
                    <Lock className="icon-left" size={18} />
                    <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" onChange={handleChange} required />
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </div>
                  </div>
                </div>

                {isLogin && (
                  <span className="forgot-pw-link" onClick={() => setShowForgot(true)}>Forgot Password?</span>
                )}

              </div>
            )}

            <button type="submit" className="df-btn-submit w-100 mt-4" disabled={loading}>
              {loading ? 'Please wait...' : 'Continue'} <ArrowRight size={16} />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default MilkmanAuth;