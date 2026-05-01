import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="row mb-5 animate-fade-in">
          <div className="col-lg-7">
            <h6 className="text-uppercase fw-bold text-muted small mb-2 tracking-widest">Connect with Us</h6>
            <h2 className="display-4 fw-bold mb-4">Let's build your distribution empire together.</h2>
            <p className="lead text-muted">
              Have questions about our modules? Our team of experts is here to help you 
              scale your daily operations with precision and ease.
            </p>
          </div>
        </div>

        <div className="row g-5">
          {/* Contact Info */}
          <div className="col-lg-5 animate-fade-in">
            <div className="contact-info-list mt-4">
              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <Mail size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Email Us</h5>
                  <p className="text-muted">support@dmsportal.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <Phone size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Call Anytime</h5>
                  <p className="text-muted">+1 (555) 000-DMS-123</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <MapPin size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Our Headquarters</h5>
                  <p className="text-muted">123 Executive Plaza, New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-7 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="contact-card p-5 rounded-4 shadow-sm h-100">
              <form className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Full Name</label>
                  <input type="text" className="form-control contact-input" placeholder="Enter your name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Email Address</label>
                  <input type="email" className="form-control contact-input" placeholder="name@company.com" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Which module are you interested in?</label>
                  <select className="form-select contact-input">
                    <option defaultValue>Select a module</option>
                    <option>Milkman Management</option>
                    <option>Newspaper Distribution</option>
                    <option>EMI / Collection Agency</option>
                    <option>Small Shop Management</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Message</label>
                  <textarea className="form-control contact-input" rows="4" placeholder="How can we help you?"></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-contact w-100 d-flex align-items-center justify-content-center gap-2">
                    Send Inquiry <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
