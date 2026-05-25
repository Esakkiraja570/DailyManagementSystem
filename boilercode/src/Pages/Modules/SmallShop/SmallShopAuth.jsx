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
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';

import '../../Modules/SmallShop/SmallShop.css';
import '../../Auth/Auth.css';

import { apiPost, apiGet, getShopId, custApiGet } from './smallshopApi';

const SmallShopAuth = () => {

  const { role = 'admin' } = useParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    shopName: '',
    mobile: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {

    if (!formData.mobile || formData.mobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (role === 'customer') return true;

    if (!formData.password || formData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long');
      return false;
    }

    if (!isLogin && !formData.shopName.trim()) {
      setErrorMsg('Please enter your Store Name');
      return false;
    }

    return true;
  };

  // =====================================================
  // ✅ FIXED SUBMIT
  // =====================================================
  const handleSubmit = async (e) => {

    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    setLoading(true);

    try {

      // ================================
      // CUSTOMER LOGIN FIX
      // ================================
      if (role === 'customer') {

        const phone = formData.mobile;
        const shopId = getShopId();

        if (!shopId) {
          setErrorMsg("Shop not selected");
          return;
        }

        // Use custApiGet to hit /api/customer instead of /api/smallshop
        const fetchRes = await custApiGet(`/fetch/${phone}`);

        // The Java backend returns { success: true, name, customerId, phone }
        if (!fetchRes || fetchRes.success === false) {
          setErrorMsg(fetchRes?.message || "Customer not found");
          return;
        }

        localStorage.setItem('custMobile', phone);

        localStorage.setItem(
          'smallshopCustomer',
          JSON.stringify({
            mobile: phone,
            name: fetchRes.name,
            customerId: fetchRes.id,
            ...fetchRes
          })
        );

        navigate('/smallshop/customer');
        return;
      }

      // ================================
      // ADMIN LOGIN / REGISTER
      // ================================

      const endpoint = isLogin ? '/login' : '/register';

      const payload = isLogin
        ? {
            mobile: formData.mobile,
            password: formData.password
          }
        : {
            shopName: formData.shopName.trim(),
            mobile: formData.mobile,
            password: formData.password
          };

      const response = await apiPost(endpoint, payload);

      const shopId = response.shopId || response.id;

      localStorage.setItem('shopId', shopId);

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      localStorage.setItem('smallshop', JSON.stringify(response));

      try {
        const profile = await apiGet(`/profile/${formData.mobile}`);

        const fullData = {
          ...response,
          ...profile
        };

        localStorage.setItem('smallshop', JSON.stringify(fullData));

      } catch (err) {
        console.warn('Profile fetch skipped');
      }

      navigate('/smallshop/admin');

    } catch (error) {

      console.error('AUTH ERROR : ', error);

      setErrorMsg(
        error.message || 'Authentication failed'
      );

    } finally {
      setLoading(false);
    }
  };

  // 👉 UI SAME (NO CHANGE)
 
  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="merchant-auth-wrapper">

      {/* ================================================= */}
      {/* TOP NAVBAR */}
      {/* ================================================= */}

      <nav className="navbar navbar-light bg-transparent px-4 py-3">

        <button
          className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2"
          onClick={() => navigate('/select-role/smallshop')}
        >
          <ArrowLeft size={20} />
          <span className="fw-semibold">
            Back
          </span>
        </button>

        <span className="navbar-brand fw-bold text-primary fs-4">
          ShopManager
        </span>

      </nav>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="container d-flex flex-column align-items-center justify-content-center flex-grow-1">

        <div className="merchant-card shadow-sm animate-fade-in">

          {/* ============================================= */}
          {/* ICON */}
          {/* ============================================= */}

          <div className="merchant-icon-circle mx-auto">

            <Store
              color="white"
              size={28}
            />

          </div>

          {/* ============================================= */}
          {/* HEADER */}
          {/* ============================================= */}

          <div className="text-center mt-4 mb-4">

            <h2 className="merchant-title">

              {
                role === 'customer'
                  ? 'Customer Login'
                  : isLogin
                    ? 'Merchant Portal'
                    : 'Register Shop'
              }

            </h2>

            <p className="merchant-subtitle">

              {
                role === 'customer'
                  ? 'Access your bills and offers'
                  : 'Access your shop dashboard securely'
              }

            </p>

          </div>

          {/* ============================================= */}
          {/* TABS */}
          {/* ============================================= */}

          {
            role === 'admin' && (

              <div className="merchant-tabs d-flex mb-4">

                <button
                  type="button"
                  className={`flex-fill tab-btn ${
                    isLogin ? 'active' : ''
                  }`}
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMsg('');
                  }}
                >
                  <LogIn
                    size={16}
                    className="me-2"
                  />
                  Login
                </button>

                <button
                  type="button"
                  className={`flex-fill tab-btn ${
                    !isLogin ? 'active' : ''
                  }`}
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMsg('');
                  }}
                >
                  <UserPlus
                    size={16}
                    className="me-2"
                  />
                  Register
                </button>

              </div>
            )
          }

          {/* ============================================= */}
          {/* CUSTOMER INFO */}
          {/* ============================================= */}

          {
            role === 'customer' && (

              <div className="mb-4 text-center">

                <ShieldCheck
                  size={40}
                  className="text-primary mb-2"
                />

                <p className="text-muted small mb-0">
                  Access your bills,
                  rewards and offers
                </p>

              </div>
            )
          }

          {/* ============================================= */}
          {/* ERROR */}
          {/* ============================================= */}

          {
            errorMsg && (

              <div className="alert alert-danger py-2 small border-0 text-center mb-3">

                {errorMsg}

              </div>
            )
          }

          {/* ============================================= */}
          {/* FORM */}
          {/* ============================================= */}

          <form onSubmit={handleSubmit}>

            {/* STORE NAME */}

            {
              !isLogin &&
              role === 'admin' && (

                <div className="form-group mb-3">

                  <label className="form-label-custom">
                    Store Name
                  </label>

                  <div className="input-container">

                    <input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      className="form-control-custom"
                      placeholder="Enter your shop name"
                      required
                    />

                  </div>

                </div>
              )
            }

            {/* MOBILE */}

            <div className="form-group mb-3">

              <label className="form-label-custom">
                Mobile Number
              </label>

              <div className="input-container">

                <Phone
                  className="input-icon-left"
                  size={18}
                />

                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="form-control-custom has-icon-left"
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            {
              role === 'admin' && (

                <div className="form-group mb-4">

                  <div className="d-flex justify-content-between align-items-center">

                    <label className="form-label-custom">
                      Password
                    </label>

                    {
                      isLogin && (
                        <button
                          type="button"
                          className="btn btn-link p-0 small-link"
                        >
                          Forgot?
                        </button>
                      )
                    }

                  </div>

                  <div className="input-container">

                    <Lock
                      className="input-icon-left"
                      size={18}
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control-custom has-icon-left"
                      placeholder="••••••••"
                      required
                    />

                    <button
                      type="button"
                      className="btn-eye"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >

                      {
                        showPassword
                          ? <EyeOff size={18} />
                          : <Eye size={18} />
                      }

                    </button>

                  </div>

                </div>
              )
            }

            {/* ========================================= */}
            {/* SUBMIT */}
            {/* ========================================= */}

            <button
              type="submit"
              className="btn-merchant-primary w-100 mb-3"
              disabled={loading}
            >

              {
                loading ? (

                  <>
                    <Loader2
                      className="spinner"
                      size={20}
                    />
                    Please wait...
                  </>

                ) : (

                  <>
                    {
                      role === 'customer'
                        ? 'Continue'
                        : isLogin
                          ? 'Open Store'
                          : 'Create Shop'
                    }

                    <LogOut
                      size={18}
                      className="ms-2"
                    />

                  </>
                )
              }

            </button>

            {/* ========================================= */}
            {/* FOOTER INFO */}
            {/* ========================================= */}

            <div className="merchant-footer-info d-flex align-items-center justify-content-center gap-2">

              <ShieldCheck size={14} />

              <span>
                Encrypted Merchant Connection
              </span>

            </div>

          </form>

        </div>

      </div>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="w-100 px-5 py-4 mt-auto border-top bg-white">

        <div className="row align-items-center">

          <div className="col-md-6 text-center text-md-start">

            <h5 className="fw-bold mb-0">
              ShopManager
            </h5>

            <p className="text-muted small mb-0">
              © 2024 ShopManager Secure Portal.
              All rights reserved.
            </p>

          </div>

          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">

            <div className="d-flex justify-content-center justify-content-md-end gap-4 small fw-semibold text-muted">

              <span>Security</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Support</span>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default SmallShopAuth;