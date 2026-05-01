import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Selection.css';

// Import images (keeping your logic)
import milkmanImg from '../../assets/milkman.png';
import agentImg from '../../assets/agent.png';
import distributorImg from '../../assets/distributor.png';
import smallshopImg from '../../assets/smallshop.png';

const modules = [
  {
    id: 'milkman',
    name: 'Milkman',
    img: milkmanImg,
    desc: 'Manage milk deliveries, customers, and payments.',
    badge: 'POPULAR'
  },
  {
    id: 'agent',
    name: 'Collection Agent',
    img: agentImg,
    desc: 'Track EMI collections and customer records.'
  },
  {
    id: 'distributor',
    name: 'Newspaper Distributor',
    img: distributorImg,
    desc: 'Manage newspaper routes and daily billing.'
  },
  {
    id: 'smallshop',
    name: 'Small Shop Owner',
    img: smallshopImg,
    desc: 'Inventory control and daily sales tracking.'
  }
];

const ModuleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = useCallback((moduleId) => {
    navigate(`/select-role/${moduleId}`);
  }, [navigate]);

  return (
    <div className="selection-page d-flex flex-column min-vh-100 bg-white">
      <main className="container flex-grow-1 py-5 mt-md-5">
        
        {/* HEADER SECTION */}
        <div className="row mb-5 animate-fade-in">
          <div className="col-lg-8">
            <h1 className="display-3 fw-bold mb-3 tracking-tight">Select Your Module</h1>
            <p className="lead text-muted custom-subheading">
              Choose the workspace that best fits your daily operations. Each module is 
              custom-tailored to streamline your specific business workflow.
            </p>
          </div>
        </div>

        {/* GRID SECTION */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-5">
          {modules.map((mod, index) => (
            <div key={mod.id} className="col animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div 
                className="card h-100 border-0 shadow-sm rounded-4 selection-card overflow-hidden"
                onClick={() => handleSelect(mod.id)}
                role="button"
                tabIndex={0}
              >
                {/* POPULAR BADGE */}
                {mod.badge && (
                  <div className="popular-badge px-3 py-1 text-white fw-bold">
                    {mod.badge}
                  </div>
                )}

                {/* IMAGE AREA */}
                <div className="card-img-top-wrapper">
                  <img src={mod.img} className="card-img-top" alt={mod.name} />
                </div>

                {/* BODY CONTENT */}
                <div className="card-body p-4 d-flex flex-column">
                  <h3 className="h4 fw-bold mb-2">{mod.name}</h3>
                  <p className="text-muted small mb-4 flex-grow-1">
                    {mod.desc}
                  </p>
                  
                  <button 
                    className="btn btn-black w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(mod.id);
                    }}
                  >
                    Select <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer-area py-5 border-top bg-light-soft">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <span className="text-muted small">© 2024 Executive Workspace DMS. All rights reserved.</span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-links d-flex justify-content-center justify-content-md-end gap-4 small">
                <a href="/privacy" className="text-muted text-decoration-none">Privacy Policy</a>
                <a href="/terms" className="text-muted text-decoration-none">Terms of Service</a>
                <a href="/support" className="text-muted text-decoration-none">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModuleSelection;