import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Phone, MapPin, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import './Dashboard.css';

const AddCustomers = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const storedMilkman = JSON.parse(localStorage.getItem('milkman') || '{}');
  const milkmanMobile = storedMilkman?.mobile || localStorage.getItem("mobile");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // API call to match your backend logic
      // POST /api/customer/add/{milkmanMobile}
      const response = await axios.post(`http://localhost:1010/api/customer/add/${milkmanMobile}`, {
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      setError(err.response?.data?.message || 'Failed to add customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="add-customer-success d-flex flex-column align-items-center justify-content-center p-5 animate-scale-up">
        <div className="success-icon mb-4"><CheckCircle size={80} className="text-success" /></div>
        <h2 className="fw-bold">Success!</h2>
        <p className="text-muted text-center">New customer <strong>{formData.name}</strong> has been registered to your route.</p>
        <button className="btn btn-dark rounded-pill px-4 py-2 mt-3" onClick={onBack}>Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="add-customer-view animate-fade-in">
      <header className="d-flex align-items-center gap-3 mb-5">
        <button className="btn btn-light rounded-circle p-2" onClick={onBack}><ArrowLeft size={20}/></button>
        <h3 className="fw-bold mb-0">Add New Customer</h3>
      </header>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg p-5 rounded-4 bg-white">
            <div className="text-center mb-5">
              <div className="icon-badge bg-primary-subtle text-primary mx-auto mb-3"><UserPlus size={30}/></div>
              <h4 className="fw-bold">Customer Registration</h4>
              <p className="text-muted small">Enter the details to register a new house to your delivery path.</p>
            </div>

            {error && <div className="alert alert-danger border-0 rounded-3 small mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="custom-form">
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Full Name</label>
                <div className="input-group-modern">
                  <UserPlus size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="name"
                    className="form-control-modern" 
                    placeholder="Enter customer's name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Mobile Number</label>
                <div className="input-group-modern">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    name="mobile"
                    className="form-control-modern" 
                    placeholder="+91 00000 00000"
                    value={formData.mobile}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="form-label fw-bold small text-muted text-uppercase">Delivery Address</label>
                <div className="input-group-modern align-items-start pt-2">
                  <MapPin size={18} className="input-icon" />
                  <textarea 
                    name="address"
                    className="form-control-modern border-0" 
                    rows="3"
                    placeholder="House No, Street, Landmark..."
                    value={formData.address}
                    onChange={handleChange}
                    required
                    style={{ background: 'transparent', width: '100%', outline: 'none' }}
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                {loading ? 'Processing...' : 'Register Customer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomers;
