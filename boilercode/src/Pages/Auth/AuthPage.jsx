import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Auth.css';

const AuthPage = () => {
  const { moduleId, role } = useParams();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Authenticating as ${role} for ${moduleId}`);
    // Real-world logic would involve API calls here
    
    // Navigating to the appropriate dashboard
    navigate(`/${moduleId}/${role}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{role.toUpperCase()} Portal | {moduleId.toUpperCase()}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="btn-primary auth-submit">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p onClick={() => navigate(`/select-role/${moduleId}`)}>
            ← Back to Role Selection
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
