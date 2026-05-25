import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, CreditCard, BarChart3, ArrowRight, X, Globe, CheckCircle2 } from 'lucide-react';
import Contact from '../Contact/Contact';
import './Landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top py-3 border-bottom border-light">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold fs-4 text-primary-dark" href="/">
            Daily Management System
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item"><a className="nav-link fw-semibold px-3" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold px-3" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold px-3" href="#contact">Contact</a></li>
              <li className="nav-item ms-lg-3">
                <button className="btn btn-primary px-4 rounded-3 fw-bold" onClick={() => navigate('/select-module')}>
                  Get Started
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero-section py-5 ">
        <div className="container py-lg-5 ">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0  text-center text-lg-start">
              <span className="badge rounded-pill bg-soft-blue text-primary px-3 py-2 mb-4 text-uppercase fw-bold ls-1">
                Transforming Logistics
              </span>
              <h1 className="display-4 fw-bold main-headline mb-4">
                Smart Daily Management for <span className="text-primary">Modern Businesses</span>
              </h1>
              <p className="lead text-secondary mb-5 pe-lg-5">
                Streamline your milk distribution, optimize routes, and scale your delivery business with DMS Solutions. 
                The all-in-one platform for daily service tracking.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <button className="btn btn-primary btn-lg px-4 py-3 d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm" onClick={() => navigate('/select-module')}>
                  Start Free <ArrowRight size={20} />
                </button>
                <button className="btn btn-light-gray btn-lg px-4 py-3 rounded-3">Learn More</button>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="hero-mockup-card shadow-lg p-4 bg-white rounded-4 border">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-2">
                     <div className="bg-primary p-2 text-white rounded-2"><BarChart3 size={18}/></div>
                     <span className="fw-bold text-dark">Live Overview</span>
                  </div>
                  <div className="d-flex gap-1">
                    <span className="dot bg-danger"></span><span className="dot bg-warning"></span><span className="dot bg-primary"></span>
                  </div>
                </div>
                <div className="mockup-row d-flex justify-content-between p-3 bg-light rounded-3 mb-3 border-start border-primary border-4">
                   <div className="text-muted small d-flex align-items-center gap-2"><Truck size={16}/> Daily Deliveries</div>
                   <span className="fw-bold">1,248</span>
                </div>
                <div className="mockup-row d-flex justify-content-between p-3 bg-light rounded-3 mb-4 border-start border-primary border-4">
                   <div className="text-muted small d-flex align-items-center gap-2"><CreditCard size={16}/> Revenue Today</div>
                   <span className="fw-bold text-primary">$4,820</span>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="small text-muted mb-1">New Orders</div>
                      <div className="h5 fw-bold mb-0 text-success">+12%</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="small text-muted mb-1">Success Rate</div>
                      <div className="h5 fw-bold mb-0">99.8%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* WHY CHOOSE SECTION */}
      <div className="text-center mb-5">
            <h2 className="fw-bold display-6 mb-3">Why Choose DMS?</h2>
            <h4 className="text-muted mx-auto max-w-600">
              Purpose-built tools to handle the unique complexities of subscription-based distribution models.
            </h4>
          </div>
      <section id="features" className="py-5 bg-soft">
        <div className="container-fluid py-5">
          
          <div className="row g-4">
            <FeatureCard icon={<Truck />} title="Order Management" desc="Automate daily order adjustments, cancellations, and renewals with a few clicks." />
            <FeatureCard icon={<Users />} title="Customer Tracking" desc="Detailed customer profiles with history, preferences, and geo-tagged delivery points." />
            <FeatureCard icon={<CreditCard />} title="Billing & EMI" desc="Seamlessly generate invoices and manage recurring payments or EMI options for customers." />
            <FeatureCard icon={<BarChart3 />} title="Reports & Insights" desc="Deep analytics on route efficiency, product demand, and financial health metrics." />
          </div>
        </div>
      </section>

      {/* MISSION/BLUEPRINT SECTION */}
      <section id="about" className="py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 position-relative mb-5 mb-lg-0">
              <div className="blueprint-img-container rounded-4 overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000" alt="Dashboard" className="img-fluid" />
              </div>
              <div className="uptime-badge p-3 bg-dark text-white rounded-3 shadow position-absolute">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary p-2 rounded-circle"><CheckCircle2 size={18}/></div>
                  <div>
                    <small className="d-block opacity-75 text-uppercase fw-bold ls-1" style={{fontSize:'0.65rem'}}>Infrastructure</small>
                    <span className="fw-bold">99.9% Uptime Reliability</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5">
              <h2 className="display-5 fw-bold mb-4">The Architectural Blueprint for Your Success</h2>
              <p className="text-muted mb-5 fs-5 lh-base">
                We don't just provide software; we provide a foundation. Our systems are built to withstand the rigors of heavy daily distribution, ensuring that every drop counts and every customer is satisfied.
              </p>
              <div className="row g-4">
                <div className="col-6">
                  <div className="border-start border-primary border-4 ps-4">
                    <h3 className="fw-bold mb-0">500+</h3>
                    <p className="text-muted mb-0">Active Agents</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border-start border-primary border-4 ps-4">
                    <h3 className="fw-bold mb-0">12k+</h3>
                    <p className="text-muted mb-0">Daily Deliveries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-5">
        <div className="container" style={{textAlign:"center"}}>
          <div className="cta-box rounded-5 text-white text-center p-5 shadow-lg">
            <h2 className="display-5 fw-bold mb-4">Ready to transform your<br/>distribution business?</h2>
            <button className="btn btn-light btn-lg px-5 py-3 fw-bold text-primary rounded-3 shadow" onClick={() => navigate('/select-module')}>
              Join DMS Today
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <Contact />

      {/* FOOTER */}
      <footer className="py-5 border-top bg-white mt-5">
        <div className="container-fluid">
          <div className="row align-items-center text-center text-md-start">
            <div className="col-md-4 mb-4 mb-md-0">
              <h4 className="fw-bold text-primary-dark">Daily Management System</h4>
              <p className="text-muted small mb-0">© 2024 Daily Management System. Empowering local distribution.</p>
            </div>
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="d-flex justify-content-center gap-4 small fw-bold text-muted">
                <a href="#!" className="text-inherit text-decoration-none hover-primary">Privacy Policy</a>
                <a href="#!" className="text-inherit text-decoration-none hover-primary">Terms of Service</a>
                <br></br><br></br>
                <a href="#!" className="text-inherit text-decoration-none hover-primary">Support</a>
                <a href="#!" className="text-inherit text-decoration-none hover-primary">Contact</a>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3 text-muted">
                <a href="#!" className="text-inherit"><X size={20}/></a>
                <a href="#!" className="text-inherit"><Globe size={20}/></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="col-lg-3 col-md-6">
    <div className="card h-100 border-0 shadow-sm p-4 rounded-4 feature-item">
      <div className="icon-wrapper mb-4 text-primary bg-soft-blue d-flex align-items-center justify-content-center rounded-3" style={{width:'50px', height:'50px'}}>
        {icon}
      </div>
      <h5 className="fw-bold mb-3">{title}</h5>
      <p className="text-muted small mb-0 lh-base">{desc}</p>
    </div>
  </div>
);

export default LandingPage;