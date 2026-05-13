import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="py-5">
      <div className="container py-5">
        <div className="row g-5">
          {/* Contact Info Left Side */}
          <div className="col-lg-5">
            <h2 className="display-6 fw-bold mb-4">Connect with Us</h2>
            <p className="text-muted mb-5 fs-5 pe-lg-4">
              Have specific questions about our milk, newspaper, or custom EMI modules? 
              Our team is here to help you configure the perfect setup.
            </p>
            
            <div className="d-flex align-items-center mb-4">
              <div className="contact-circle-icon bg-soft-blue text-primary p-3 rounded-circle me-4">
                <Mail size={26}/>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Email Support</h6>
                <p className="text-muted mb-0">support@dmsportal.com</p>
              </div>
            </div>

            <div className="d-flex align-items-center mb-4">
              <div className="contact-circle-icon bg-soft-blue text-primary p-3 rounded-circle me-4">
                <Phone size={26}/>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Call Us</h6>
                <p className="text-muted mb-0">+1 (555) 000-DMS-LOGIC</p>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <div className="contact-circle-icon bg-soft-blue text-primary p-3 rounded-circle me-4">
                <MapPin size={26}/>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Headquarters</h6>
                <p className="text-muted mb-0 small">123 Distribution Way, Suite 400<br/>Logistics Hub, Tech City</p>
              </div>
            </div>
          </div>

          {/* Form Card Right Side */}
          <div className="col-lg-7">
            <div className="contact-form-card border-0 bg-light-soft p-4 p-md-5 rounded-5">
              <form className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="John Doe" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Email</label>
                  <input type="email" className="form-control form-control-lg border-0 shadow-sm" placeholder="john@example.com" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Business Module</label>
                  <select className="form-select form-select-lg border-0 shadow-sm">
                    <option>Milkman</option>
                    <option>Newspaper</option>
                    <option>Small Shop Agent</option>
                    <option>EMI Management</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Message</label>
                  <textarea className="form-control border-0 shadow-sm" rows="4" placeholder="How can we help your business?"></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold py-3 rounded-3 mt-2">
                    Send Message
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