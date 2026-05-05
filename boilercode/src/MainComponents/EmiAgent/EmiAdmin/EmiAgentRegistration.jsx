import React, { useState } from 'react';
import { User, Phone, Mail, Lock, MapPin, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './EmIAgentRegsitration.css';

const BASE_URL = "http://localhost:1010";

const EmiAgentRegistration = () => {
    const [formData, setFormData] = useState({
        name: '', mobile: '', email: '', password: '', area: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.mobile.length !== 10) {
            return setStatus({ type: 'error', message: 'Enter valid 10-digit mobile number' });
        }

        if (formData.password.length < 4) {
            return setStatus({ type: 'error', message: 'Password must be at least 4 characters' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${BASE_URL}/agent/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            setStatus({ type: 'success', message: 'Registration Successful! Redirecting...' });

            setFormData({
                name: '', mobile: '', email: '', password: '', area: ''
            });

            setTimeout(() => navigate('/emi-login'), 1500);

        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-reg-container">
            <div className="reg-card animate-fade-in">

                <div className="reg-header">
                    <div className="reg-logo">
                        <CheckCircle size={40} className="text-black" />
                    </div>
                    <h2>Join DMS EMI</h2>
                    <p>Create your agent account to start managing loans</p>
                </div>

                {status.message && (
                    <div className={`status-alert ${status.type}`}>
                        {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="reg-form">

                    <div className="input-group-modern">
                        <User size={18} />
                        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="input-group-modern">
                        <Phone size={18} />
                        <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
                    </div>

                    <div className="input-group-modern">
                        <Mail size={18} />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group-modern">
                        <MapPin size={18} />
                        <input name="area" placeholder="Area" value={formData.area} onChange={handleChange} required />
                    </div>

                    <div className="input-group-modern">
                        <Lock size={18} />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Register <ArrowRight /></>}
                    </button>

                </form>

                <div className="reg-footer">
                    <Link to="/emi-login">Back to Login</Link>
                </div>

            </div>
        </div>
    );
};

export default EmiAgentRegistration;