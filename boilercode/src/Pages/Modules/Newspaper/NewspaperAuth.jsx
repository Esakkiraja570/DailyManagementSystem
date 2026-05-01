import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Mail, Lock, ArrowLeft } from 'lucide-react';
import '../../Auth/Auth.css';

const NewspaperAuth = () => {
  const { role } = useParams();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/distributor/${role}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <button 
            className="btn btn-link text-muted p-0 mb-4 text-decoration-none d-flex align-items-center gap-2"
            onClick={() => navigate(`/select-role/distributor`)}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>Newspaper {role === 'admin' ? 'Distributor' : 'Subscriber'} Portal</p>
        </div>

        {role === 'admin' ? (
          <div className="auth-tabs">
            <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
          </div>
        ) : (
          <div className="mb-4 text-center">
             <p className="text-muted small fw-bold">LOGIN WITH YOUR REGISTERED MOBILE</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {role === 'customer' ? (
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="position-relative">
                <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input type="tel" className="form-control ps-5" placeholder="Enter mobile number" required />
              </div>
            </div>
          ) : (
            <>
              {!isLogin && (
                <div className="form-group">
                  <label>Business Name</label>
                  <input type="text" className="form-control" placeholder="Enter Agency Name" required />
                </div>
              )}
              <div className="form-group">
                <label>Email Address</label>
                <div className="position-relative">
                  <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="email" className="form-control ps-5" placeholder="agency@mail.com" required />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input type="password" className="form-control ps-5" placeholder="••••••••" required />
                </div>
              </div>
            </>
          )}
          
          <button type="submit" className="auth-submit">
            {role === 'customer' ? 'Login via OTP' : (isLogin ? 'Admin Login' : 'Register Agency')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewspaperAuth;
