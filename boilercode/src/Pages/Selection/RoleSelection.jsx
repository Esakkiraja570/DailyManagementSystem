import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, User, MoveLeft, Settings, UserCircle, ArrowRight } from 'lucide-react';
import './Selection.css';

const RoleSelection = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/auth/${moduleId}/${role}`);
  };

  // Logic to determine display name from route param
  const moduleName = moduleId ? moduleId.charAt(0).toUpperCase() + moduleId.slice(1) : "Access Control";

  return (
    <div className="selection-page-wrapper">
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 px-4">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <span className="fw-bold text-primary fs-5 me-3">Daily Management System</span>
            <div className="d-none d-md-flex align-items-center text-muted small breadcrumb-text">
              <span>Global Workspace</span>
              <span className="mx-2">›</span>
              <span className="text-dark fw-medium">{moduleName}</span>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-exit-module d-flex align-items-center gap-2"
              onClick={() => navigate('/select-module')}
            >
              <MoveLeft size={16} /> Exit Module
            </button>
            <Settings size={20} className="text-muted cursor-pointer action-icon" />
            <UserCircle size={24} className="text-muted cursor-pointer action-icon" />
          </div>
        </div>
      </nav>

<div className="text-center mb-5">
          <div className="status-pill mb-4 mt-4">
            <span className="dot-green"></span> SYSTEMS ARE OPERATIONAL
          </div>
          <h1 className="display-4 fw-bold main-headline mb-3">
            Identify Your <span className="text-primary">Access Level</span>
          </h1>
          <p className="text-muted mx-auto lead-subtext">
            Select your designated workspace to continue. Administrators manage the ecosystem while Customers oversee their individual financial profiles.
          </p>
        </div>

      <main className="container py-5 mt-3">
        {/* HEADER */}
        
        {/* ROLE CARDS */}
        <div className="row g-4 justify-content-center">
          {/* Admin Persona */}
          <div className="col-md-6 col-lg-5">
            <div className="persona-card admin-variant p-5 h-100" onClick={() => handleRoleSelect('admin')}>
              <div className="persona-icon-box bg-primary mb-4">
                <Shield size={32} />
              </div>
              <h2 className="fw-bold h3 mb-3">Admin Workspace</h2>
              <p className="text-muted mb-5">
                Manage clients, oversee collections, configure fees, and view deep analytics. Dedicated tools for system-wide governance and control.
              </p>
              <button className="btn btn-primary btn-round d-flex align-items-center gap-2">
                Enter Dashboard <ArrowRight size={18} />
              </button>
              
              {/* Background Watermark Icon */}
              <div className="persona-ghost-icon">
                <Shield size={180} />
              </div>
            </div>
          </div>

          {/* Customer Persona */}
          <div className="col-md-6 col-lg-5">
            <div className="persona-card client-variant p-5 h-100" onClick={() => handleRoleSelect('customer')}>
              <div className="persona-icon-box bg-light-blue mb-4">
                <User size={32} />
              </div>
              <h2 className="fw-bold h3 mb-3">Client Portal</h2>
              <p className="text-muted mb-5">
                Track your installments, view repayment plans, and make secure payments. Simplified view of your personal financial journey.
              </p>
              <button className="btn btn-dark btn-round d-flex align-items-center gap-2">
                Open Portfolio <ArrowRight size={18} />
              </button>

              {/* Background Watermark Icon */}
              <div className="persona-ghost-icon">
                <User size={180} />
              </div>
            </div>
          </div>
        </div>

        {/* INFRASTRUCTURE BANNER */}
        <div className="infra-banner-container mt-5 pt-4">
           <div className="infra-card">
              <div className="infra-overlay">
                 <span className="text-uppercase tracking-widest fw-bold small">Enterprise Infrastructure</span>
                 <div className="infra-accent-line"></div>
              </div>
           </div>
        </div>
      </main>

      <footer className="py-4 mt-auto">
        <div className="container-fluid text-center">
          <span className="text-muted small text-uppercase tracking-wider">
            © 2024 Daily Management System • Enterprise Cloud Edition • Security Verified
          </span>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;