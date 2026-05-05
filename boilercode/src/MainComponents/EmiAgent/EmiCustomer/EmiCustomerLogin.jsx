import React, { useState } from 'react';
import { Phone, ArrowRight, Loader2, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './EmiCustomerLogin.css';

const BASE_URL = "http://localhost:1010";

const EmiCustomerLogin = () => {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Customer search API as a form of "login"
            const response = await fetch(`${BASE_URL}/customer/search?mobile=${mobile}`);
            const data = await response.json();

            if (response.ok && data) {
                localStorage.setItem('emiCustomer', JSON.stringify(data));
                setStatus({ type: 'success', message: 'Welcome back! Redirecting to portal...' });
                setTimeout(() => navigate('/agent/customer'), 1500);
            } else {
                setStatus({ type: 'error', message: 'Customer record not found. Please contact your agent.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Connection lost. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-login-container">
            <div className="cust-login-card animate-fade-in">
                <div className="cust-login-header">
                    <div className="cust-icon">
                        <UserCircle size={48} className="text-black" />
                    </div>
                    <h2>Customer Portal</h2>
                    <p>Enter your registered mobile number to view your EMI schedule and make payments</p>
                </div>

                {status.message && (
                    <div className={`status-alert ${status.type}`}>
                        {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="cust-login-form">
                    <div className="input-group-modern">
                        <Phone className="input-icon" size={18} />
                        <input
                            type="tel"
                            placeholder="Registered Mobile Number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-cust-submit" disabled={loading}>
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                Access My Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="cust-login-footer">
                    <p>Having trouble? Contact your EMI Agent for support.</p>
                </div>
            </div>
        </div>
    );
};

export default EmiCustomerLogin;
