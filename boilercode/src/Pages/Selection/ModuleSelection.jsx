import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MoveLeft, User, Box, CreditCard, Newspaper, Store } from 'lucide-react';
import '../Selection/ModuleSelection.css'

const modules = [
  {
    id: 'milkman',
    name: 'Milkman Management',
    img: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b?q=80&w=800',
    icon: <Box size={20} />,
    desc: 'Streamline dairy distribution with automated route planning, subscription billing, and real-time inventory tracking for delivery fleets.',
    badge: 'POPULAR'
  },
  {
    id: 'agent',
    name: 'EMI Collection',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=500',
    icon: <CreditCard size={20} />,
    desc: 'Manage loan disbursements, automated payment reminders, and digital collection tracking with integrated financial analytics and reporting.'
  },
  {
    id: 'distributor',
    name: 'Newspaper Distribution',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=500',
    icon: <Newspaper size={20} />,
    desc: 'Coordinate large-scale publication logistics, vendor commissions, and circulation management with dynamic delivery zone optimization.'
  },
  {
    id: 'smallshop',
    name: 'Small Shop Hub',
    img:'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=800',
    icon: <Store size={20} />,
    desc: 'Unified POS system for retail stores featuring customer loyalty programs, vendor management, and intuitive daily sales tracking.'
  }
];

const ModuleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = useCallback((moduleId) => {
    navigate(`/select-role/${moduleId}`);
  }, [navigate]);

  return (
    <div className="module-page-wrapper">
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <a className="navbar-brand fw-bold text-primary-dms me-4" href="/">Executive DMS</a>
            <div className="nav-links d-none d-md-block">
                <a href="/" className="nav-link-item active">Home</a>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-back-home d-flex align-items-center gap-2"
              onClick={() => navigate('/')}
            >
              <MoveLeft size={18} /> Back to Home
            </button>
            <div className="profile-icon-circle">
                <User size={20} />
            </div>
          </div>
        </div>
      </nav>

      <main className="container-fluid py-5">
        {/* HEADER */}
        <div className="row mb-5 justify-content-center text-center header-section">
          <div className="col-lg-8">
            <h1 className="display-4 fw-bold mb-3">Select Your Module</h1>
            <p className="text-muted fs-5">
              Choose the architectural framework that best suits your daily business operations.
            </p>
          </div>
        </div>

        {/* MODULE GRID */}
        <div className="row g-4 justify-content-center">
          {modules.map((mod) => (
            <div key={mod.id} className="col-sm-12 col-md-6 col-lg-3">
              <div className="module-card shadow-sm h-100" onClick={() => handleSelect(mod.id)}>
                <div className="module-image-container">
                  <img src={mod.img} alt={mod.name} className="module-img" />
                  {mod.badge && <span className="module-badge">{mod.badge}</span>}
                </div>

                <div className="card-body-custom p-4">
                  <div className="icon-container-blue mb-3">
                    {mod.icon}
                  </div>
                  <h5 className="fw-bold mb-3 module-title">{mod.name}</h5>
                  <p className="module-description text-muted">
                    {mod.desc}
                  </p>
                  <button className="btn btn-select-module w-100 mt-auto">
                    Select Module <ArrowRight size={18} className="ms-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="footer-simple mt-auto py-5">
        <div className="container-fluid border-top pt-5">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                <h6 className="fw-bold mb-1">Executive DMS</h6>
                <p className="text-muted small mb-0">© 2024 Daily Management System. Enterprise Cloud Edition.</p>
            </div>
            <div className="col-md-6">
                <div className="d-flex justify-content-center justify-content-md-end gap-4 small footer-links">
                    <a href="#!">Privacy</a>
                    <a href="#!">Terms</a>
                    <a href="#!">Support</a>
                </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModuleSelection;