import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Phone,
  Lock,
  ArrowLeft,
  Store,
  Loader2,
  UserPlus,
  LogIn,
  ShieldCheck
} from 'lucide-react';

import '../../Auth/Auth.css';
import { apiPost, apiGet } from './smallshopApi';

const SmallShopAuth = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    shopName: '',
    mobile: '',
    password: ''
  });

  // ---------------------------------------------------
  // HANDLE INPUT CHANGE (With Logic for numeric only)
  // ---------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Logic: Force numeric only for mobile
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------------------
  // VALIDATION LOGIC
  // ---------------------------------------------------
  const validateForm = () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (role === 'admin') {
      if (!formData.password || formData.password.length < 4) {
        setErrorMsg('Password must be at least 4 characters long');
        return false;
      }

      if (!isLogin && !formData.shopName.trim()) {
        setErrorMsg('Please enter your Store Name to register');
        return false;
      }
    }
    return true;
  };

  // ---------------------------------------------------
  // HANDLE SUBMIT LOGIC
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;
    setLoading(true);

    try {
      // -------------------------------------------------
      // CUSTOMER LOGIN LOGIC
      // -------------------------------------------------
      if (role === 'customer') {
        // Use keys that match the ShopCustomerDashboard
        localStorage.setItem('custMobile', formData.mobile);
        localStorage.setItem('smallshopCustomer', JSON.stringify({ mobile: formData.mobile }));
        
        navigate('/smallshop/customer');
        return;
      }

      // -------------------------------------------------
      // ADMIN AUTH LOGIC (Login / Register)
      // -------------------------------------------------
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin 
        ? { mobile: formData.mobile, password: formData.password }
        : { shopName: formData.shopName.trim(), mobile: formData.mobile, password: formData.password };

      const response = await apiPost(endpoint, payload);

      // Save credentials immediately
      const shopId = response.shopId || response.id;
      localStorage.setItem('shopId', shopId);
      if (response.token) localStorage.setItem('token', response.token);
      localStorage.setItem('smallshop', JSON.stringify(response));

      // Attempt to enrich the profile data
      try {
        const profile = await apiGet(`/profile/${formData.mobile}`);
        const fullData = { ...response, ...profile };
        localStorage.setItem('smallshop', JSON.stringify(fullData));
      } catch (e) {
        console.warn('Profile enrichment skipped - using auth response');
      }

      navigate('/smallshop/admin');

    } catch (error) {
      console.error("Auth Error:", error);
      setErrorMsg(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        
        {/* HEADER */}
        <div className="auth-header">
          <button
            type="button"
            className="btn btn-link text-muted p-0 mb-4 text-decoration-none d-flex align-items-center gap-2"
            onClick={() => navigate('/select-role/smallshop')}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="d-flex align-items-center gap-2 mb-2 text-black">
            <Store size={24} />
            <span className="fw-bold extra-small tracking-widest text-uppercase">
              Merchant Portal
            </span>
          </div>

          <h2 className="fw-bold">
            {role === 'customer' ? 'Customer Login' : isLogin ? 'Shop Login' : 'Register Shop'}
          </h2>
          <p className="text-muted">Small Business Management System</p>
        </div>

        {/* LOGIN / REGISTER TABS */}
        {role === 'admin' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? 'active' : ''}
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            >
              <LogIn size={16} className="me-2" /> Login
            </button>
            <button
              type="button"
              className={!isLogin ? 'active' : ''}
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            >
              <UserPlus size={16} className="me-2" /> Register
            </button>
          </div>
        )}

        {/* CUSTOMER INFO ICON */}
        {role === 'customer' && (
          <div className="mb-4 text-center">
            <ShieldCheck size={40} className="text-primary mb-2" />
            <p className="text-muted small mb-0">
              Access your bills, rewards, purchase history and offers.
            </p>
          </div>
        )}

        {/* ERROR BOX */}
        {errorMsg && (
          <div className="alert alert-danger border-0 rounded-4 small fw-bold">
            {errorMsg}
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* REGISTER ONLY FIELDS */}
          {!isLogin && role === 'admin' && (
            <div className="form-group">
              <label className="fw-bold small">Store Name</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your shop name"
                required
              />
            </div>
          )}

          {/* MOBILE INPUT */}
          <div className="form-group">
            <label className="fw-bold small">Mobile Number</label>
            <div className="position-relative">
              <Phone
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                size={18}
              />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="form-control ps-5"
                placeholder="9876543210"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          {role === 'admin' && (
            <div className="form-group">
              <label className="fw-bold small">Password</label>
              <div className="position-relative">
                <Lock
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control ps-5"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          {/* SUBMIT ACTION */}
          <button
            type="submit"
            className="auth-submit d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Please wait...
              </>
            ) : (
              <>
                {role === 'customer' ? 'Continue' : isLogin ? 'Open Store' : 'Create Shop'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmallShopAuth;