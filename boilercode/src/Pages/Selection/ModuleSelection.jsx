import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, CreditCard, Layout, Users } from 'lucide-react';

// Import images (keeping your logic)
import milkmanImg from '../../assets/milkman.png';
import agentImg from '../../assets/agent.png';
import distributorImg from '../../assets/distributor.png';
import smallshopImg from '../../assets/smallshop.png';

const modules = [
  {
    id: 'milkman',
    name: 'Milkman Management',
    img: milkmanImg,
    icon: <Box style={{ color: '#00A8CC' }} />,
    desc: 'Automate daily milk distribution, track deliveries, and manage customer subscriptions with ease.',
    badge: 'POPULAR'
  },
  {
    id: 'agent',
    name: 'EMI Collection',
    img: agentImg,
    icon: <CreditCard style={{ color: '#00A8CC' }} />,
    desc: 'Streamline payment collections, track installments, and manage borrower portfolios professionally.'
  },
  {
    id: 'distributor',
    name: 'Newspaper Distribution',
    img: distributorImg,
    icon: <Layout style={{ color: '#00A8CC' }} />,
    desc: 'Organize distribution routes, handle daily billing, and manage multi-publication subscriptions.'
  },
  {
    id: 'smallshop',
    name: 'Small Shop Hub',
    img: smallshopImg,
    icon: <Users style={{ color: '#00A8CC' }} />,
    desc: 'Integrated inventory control, sales tracking, and customer billing for small retail enterprises.'
  }
];

const ModuleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = useCallback((moduleId) => {
    navigate(`/select-role/${moduleId}`);
  }, [navigate]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/" style={{ fontSize: '1.25rem' }}>Executive DMS</a>
          <button 
            className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </nav>

      <main className="container py-5 mt-lg-4">
        {/* HEADER */}
        <div className="row mb-5 justify-content-center text-center">
          <div className="col-lg-7">
            <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Select Your Module</h1>
            <p className="text-muted fs-5">
              Choose the architectural framework that best suits your daily business operations.
            </p>
          </div>
        </div>

        {/* MODULE GRID */}
        <div className="row g-4">
          {modules.map((mod, index) => (
            <div key={mod.id} className="col-md-6 col-lg-3">
              <div 
                className="card h-100 border-0 shadow-sm overflow-hidden" 
                style={{ borderRadius: '2rem', transition: 'transform 0.3s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => handleSelect(mod.id)}
              >
                {/* Image Placeholder/Area */}
                <div style={{ height: '160px', backgroundColor: '#E9ECEF', position: 'relative' }}>
                  <img 
                    src={mod.img} 
                    alt={mod.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {mod.badge && (
                    <span 
                      className="position-absolute top-0 end-0 m-3 badge rounded-pill" 
                      style={{ backgroundColor: '#00A8CC', padding: '0.5rem 1rem' }}
                    >
                      {mod.badge}
                    </span>
                  )}
                </div>

                <div className="card-body p-4">
                  <div 
                    className="d-flex align-items-center justify-content-center mb-3 rounded-3" 
                    style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5' }}
                  >
                    {mod.icon}
                  </div>
                  <h5 className="fw-bold mb-2">{mod.name}</h5>
                  <p className="text-muted small mb-4" style={{ lineHeight: '1.6', minHeight: '60px' }}>
                    {mod.desc}
                  </p>
                  <button 
                    className="btn btn-dark w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    Select Module <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="container py-5 mt-5 border-top">
        <div className="row align-items-center text-center text-md-start">
          <div className="col-md-6 mb-3 mb-md-0">
            <span className="text-muted small">© 2024 Daily Management System. Enterprise Cloud Edition.</span>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-4 small text-muted">
              <a href="#!" className="text-decoration-none text-muted">Privacy</a>
              <a href="#!" className="text-decoration-none text-muted">Terms</a>
              <a href="#!" className="text-decoration-none text-muted">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModuleSelection;