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
    <div className="modern-selection-view">
      {/* Background Decor */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div className="selection-content-wrapper">
        <header className="selection-header-premium">
          <button className="btn-back-minimal" onClick={() => navigate('/select-module')}>
            <ArrowLeft size={18} /> Exit Module
          </button>
          <div className="module-info-badge">
             <Globe size={14} /> Global Workspace / {moduleName}
          </div>
        </header>

        <main className="selection-main-grid">
          <div className="hero-text-section">
            <h1 className="animate-slide-up">Identify Your <br/> <span>Access Level</span></h1>
            <p className="animate-slide-up delay-1">
              Select your workspace persona to proceed. Admiinistrators can manage 
              full portfolios, while customers gain secure personal insights.
            </p>
            <div className="system-status-pill animate-slide-up delay-2">
              <Activity size={14} className="pulse-icon" /> Systems are Operational
            </div>
          </div>

          <div className="role-cards-container">
            {/* Admin Persona */}
            <div 
              className="persona-card-premium admin animate-scale-in"
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="persona-icon-hex bg-black text-white">
                <Shield size={32} />
              </div>
              <div className="persona-body">
                <h3>Admin Workspace</h3>
                <p>Manage clients, oversee collections, configure fees, and view deep analytics.</p>
                <div className="persona-footer">
                  <span>Enter Dashboard</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>

            {/* Customer Persona */}
            <div 
              className="persona-card-premium customer animate-scale-in delay-1"
              onClick={() => handleRoleSelect('customer')}
            >
              <div className="persona-icon-hex bg-white text-black border-thin">
                <User size={32} />
              </div>
              <div className="persona-body">
                <h3>Client Portal</h3>
                <p>Track your installments, view repayment plans, and make secure payments.</p>
                <div className="persona-footer">
                  <span>Open Portfolio</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="selection-footer-premium">
          <p>© 2024 Daily Management System • Enterprise Cloud Edition</p>
        </footer>
      </div>
    </div>
  );
};

export default RoleSelection;
