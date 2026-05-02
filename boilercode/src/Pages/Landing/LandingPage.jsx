import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, CreditCard, BarChart3, ArrowRight } from 'lucide-react';
import Contact from '../Contact/Contact';
import './Landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-md-5">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold fs-3" href="/">DMS</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center">
              <li className="nav-item mx-3"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item mx-3"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item mx-3"><a className="nav-link" href="#contact">Contact</a></li>
              <li className="nav-item ms-3">
                <button className="btn btn-dark px-4 rounded-3 fw-bold" onClick={() => navigate('/select-module')}>
                  Get Started
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="container py-5 mt-md-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-3 fw-bold hero-title mb-4">
              Smart Daily Management for Modern Businesses
            </h1>
            <p className="lead text-muted mb-5 hero-desc">
              Manage milk distribution, track customers, handle billing, and grow your business — 
              all in one powerful platform built for Milkmen, Agents, and Small Shops.
            </p>
            <div className="d-flex gap-3">
              <button className="btn btn-dark btn-lg px-4 d-flex align-items-center gap-2" onClick={() => navigate('/select-module')}>
                Start Free <ArrowRight size={20} />
              </button>
              <button className="btn btn-light btn-lg px-4 border shadow-sm">Learn More</button>
            </div>
          </div>
          <div className="col-lg-6 mt-5 mt-lg-0">
            <div className="hero-img-container shadow-lg animate-fade-in">
               <div className="hero-mockup glass">
                  <div className="mockup-header">
                    <div className="mockup-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div className="mockup-body">
                    <div className="mockup-sidebar"></div>
                    <div className="mockup-content">
                      <div className="mockup-chart-row">
                        <div className="mockup-chart"></div>
                        <div className="mockup-chart small"></div>
                      </div>
                      <div className="mockup-list">
                        <div className="mockup-item"></div>
                        <div className="mockup-item"></div>
                        <div className="mockup-item"></div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="container-fluid bg-light-gray py-5 mt-5">
        <div className="container py-5">
          <h2 className="fw-bold mb-5 border-start border-primary border-4 ps-3">Why Choose DMS?</h2>
          <div className="row g-4">
            <FeatureCard 
              icon={<Truck className="text-primary" />} 
              title="Order Management" 
              desc="Track daily milk orders and deliveries with precision scheduling and real-time updates." 
            />
            <FeatureCard 
              icon={<Users className="text-info" />} 
              title="Customer Tracking" 
              desc="Manage customers and subscriptions effortlessly with automated profile updates." 
            />
            <FeatureCard 
              icon={<CreditCard className="text-secondary" />} 
              title="Billing & EMI" 
              desc="Automatic billing and EMI support to streamline your financial workflows and revenue collection." 
            />
            <FeatureCard 
              icon={<BarChart3 className="text-dark" />} 
              title="Reports & Insights" 
              desc="Deep business insights and data visualization to help you scale your distribution network." 
            />
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section id="about" className="container py-5 my-5">
        <div className="row align-items-center">
          <div className="col-lg-5 position-relative">
            <img 
              src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800" 
              alt="Workspace" 
              className="img-fluid rounded-4 shadow"
            />
            <div className="uptime-badge p-4 text-white shadow-lg">
                <h3 className="fw-bold mb-0">99.9%</h3>
                <small className="opacity-75">Uptime Reliability</small>
            </div>
          </div>
          <div className="col-lg-6 offset-lg-1 mt-5 mt-lg-0">
            <span className="text-uppercase text-primary fw-bold small tracking-widest">Our Mission</span>
            <h2 className="display-5 fw-bold mt-2 mb-4">The Architectural Blueprint for Your Success</h2>
            <p className="text-muted mb-4">
              At DMS, we believe that small-scale businesses are the backbone of the economy. Our mission is to provide the same level of digital sophistication to local milkmen and agents as that enjoyed by global logistics giants.
            </p>
            <div className="row g-4">
                <div className="col-6">
                    <h4 className="fw-bold mb-0">500+</h4>
                    <p className="text-muted small">Active Agents</p>
                </div>
                <div className="col-6">
                    <h4 className="fw-bold mb-0">12k+</h4>
                    <p className="text-muted small">Daily Deliveries</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="container py-5">
        <div className="cta-card p-5 text-white rounded-5 text-center shadow-lg">
            <h2 className="display-5 fw-bold mb-4">Ready to transform your<br/>distribution business?</h2>
            <button className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-primary" onClick={() => navigate('/select-module')}>
                Join DMS Today
            </button>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <Contact />

      {/* FOOTER */}
      <footer className="bg-dark text-white py-5 mt-5">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="fw-bold fs-4 mb-3 mb-md-0">DMS</div>
          <div className="d-flex gap-4 small opacity-75">
            <a href="#!" className="text-white text-decoration-none">Privacy Policy</a>
            <a href="#!" className="text-white text-decoration-none">Terms of Service</a>
            <a href="#!" className="text-white text-decoration-none">Contact Us</a>
          </div>
          <div className="small opacity-50 mt-3 mt-md-0">© 2024 DMS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

// Sub-component for Feature Cards
const FeatureCard = ({ icon, title, desc }) => (
  <div className="col-md-6 col-lg-3">
    <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
      <div className="icon-box mb-4">{icon}</div>
      <h5 className="fw-bold">{title}</h5>
      <p className="text-muted small mb-0">{desc}</p>
    </div>
  </div>
);

export default LandingPage;