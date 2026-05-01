import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, User, ArrowLeft } from 'lucide-react';
import './Selection.css';

const RoleSelection = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/auth/${moduleId}/${role}`);
  };

  const moduleName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);

  return (
    <div className="selection-page d-flex flex-column min-vh-100 bg-white">
      <main className="container flex-grow-1 py-5 mt-md-5">
        
        {/* HEADER SECTION */}
        <div className="row mb-5 animate-fade-in">
          <div className="col-lg-8">
            <button 
              className="btn btn-link text-muted p-0 mb-4 text-decoration-none d-flex align-items-center gap-2"
              onClick={() => navigate('/select-module')}
            >
              <ArrowLeft size={18} /> Back to Modules
            </button>
            <h1 className="display-3 fw-bold mb-3 tracking-tight">Access {moduleName} Portal</h1>
            <p className="lead text-muted custom-subheading">
              Please identify your role to proceed to the workspace. Admin users have 
              full management capabilities, while customers can view their personal data.
            </p>
          </div>
        </div>

        {/* ROLE CARDS */}
        <div className="row row-cols-1 row-cols-md-2 g-4 justify-content-center mb-5">
          {/* Admin Card */}
          <div className="col col-xl-4 animate-fade-in">
            <div 
              className="card h-100 border-0 shadow-sm rounded-4 selection-card p-4 text-center"
              onClick={() => handleRoleSelect('admin')}
              role="button"
              tabIndex={0}
            >
              <div className="role-icon-wrapper mb-4 mx-auto bg-light-soft rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <Shield size={40} className="text-black" />
              </div>
              <h3 className="h4 fw-bold mb-3">Admin Portal</h3>
              <p className="text-muted small mb-4">
                Manage customers, deliveries, billing, and full business analytics.
              </p>
              <button className="btn btn-black w-100 py-3 mt-auto">Enter as Admin</button>
            </div>
          </div>

          {/* Customer Card */}
          <div className="col col-xl-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div 
              className="card h-100 border-0 shadow-sm rounded-4 selection-card p-4 text-center"
              onClick={() => handleRoleSelect('customer')}
              role="button"
              tabIndex={0}
            >
              <div className="role-icon-wrapper mb-4 mx-auto bg-light-soft rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <User size={40} className="text-black" />
              </div>
              <h3 className="h4 fw-bold mb-3">Customer Portal</h3>
              <p className="text-muted small mb-4">
                Check your delivery history, view current bills, and manage subscriptions.
              </p>
              <button className="btn btn-black w-100 py-3 mt-auto">Enter as Customer</button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer-area py-5 border-top bg-light-soft">
        <div className="container text-center">
          <span className="text-muted small">© 2024 Executive Workspace DMS. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;
