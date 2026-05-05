import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, User, ArrowLeft, ChevronRight, Activity, Globe } from 'lucide-react';
import './Selection.css';

const RoleSelection = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/auth/${moduleId}/${role}`);
  };

  const moduleName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
        <div className="container">
          <div className="d-flex align-items-center gap-2">
            <Globe size={20} style={{ color: '#00A8CC' }} />
            <span className="fw-bold" style={{ fontSize: '1.1rem', color: '#333' }}>
              Global Workspace / {moduleName}
            </span>
          </div>
          <button 
            className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
            onClick={() => navigate('/select-module')}
          >
            <ArrowLeft size={16} /> Exit Module
          </button>
        </div>
      </nav>

      <main className="container py-5 mt-lg-4">
        {/* HEADER */}
        <div className="row mb-5 justify-content-center text-center">
          <div className="col-lg-7">
            <h1 className="fw-bold mb-3 animate-fade-in" style={{ fontSize: '2.5rem' }}>
              Identify Your <span style={{ color: '#00A8CC' }}>Access Level</span>
            </h1>
            <p className="text-muted fs-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Select your workspace persona to proceed. Administrators can manage 
              full portfolios, while customers gain secure personal insights.
            </p>
            <div 
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mt-3 animate-fade-in"
              style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.85rem', fontWeight: '600', animationDelay: '0.2s' }}
            >
              <Activity size={14} /> Systems are Operational
            </div>
          </div>
        </div>

        {/* ROLE CARDS */}
        <div className="row g-4 justify-content-center">
          {/* Admin Persona */}
          <div className="col-md-6 col-lg-5">
            <div 
              className="card h-100 border-0 shadow-sm overflow-hidden animate-fade-in" 
              style={{ borderRadius: '1.5rem', transition: 'transform 0.3s ease', cursor: 'pointer', animationDelay: '0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="card-body p-5 text-center">
                <div 
                  className="d-flex align-items-center justify-content-center mb-4 mx-auto rounded-circle" 
                  style={{ width: '80px', height: '80px', backgroundColor: '#000', color: '#fff' }}
                >
                  <Shield size={40} />
                </div>
                <h3 className="fw-bold mb-3">Admin Workspace</h3>
                <p className="text-muted mb-4" style={{ minHeight: '60px' }}>
                  Manage clients, oversee collections, configure fees, and view deep analytics.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2 text-primary fw-bold">
                  Enter Dashboard <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Persona */}
          <div className="col-md-6 col-lg-5">
            <div 
              className="card h-100 border-0 shadow-sm overflow-hidden animate-fade-in" 
              style={{ borderRadius: '1.5rem', transition: 'transform 0.3s ease', cursor: 'pointer', animationDelay: '0.4s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => handleRoleSelect('customer')}
            >
              <div className="card-body p-5 text-center">
                <div 
                  className="d-flex align-items-center justify-content-center mb-4 mx-auto rounded-circle" 
                  style={{ width: '80px', height: '80px', backgroundColor: '#F8F9FA', color: '#000', border: '1px solid #E9ECEF' }}
                >
                  <User size={40} />
                </div>
                <h3 className="fw-bold mb-3">Client Portal</h3>
                <p className="text-muted mb-4" style={{ minHeight: '60px' }}>
                  Track your installments, view repayment plans, and make secure payments.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2 text-primary fw-bold">
                  Open Portfolio <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container py-5 mt-5 border-top">
        <div className="row align-items-center text-center text-md-start">
          <div className="col-md-6 mb-3 mb-md-0">
            <span className="text-muted small">© 2024 Daily Management System. Enterprise Cloud Edition.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;
