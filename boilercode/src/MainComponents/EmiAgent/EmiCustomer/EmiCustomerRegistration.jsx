import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Package, Calendar, CreditCard, PlusCircle, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './EmiCustomerRegistration.css';

const BASE_URL = "http://localhost:1010";

const EmiCustomerRegistration = () => {
    const [agent, setAgent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        productName: '',
        productPrice: '',
        downPayment: '',
        totalAmount: '',
        months: '',
        dueDate: '',
        paymentType: 'MONTHLY'
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const storedAgent = JSON.parse(localStorage.getItem('emiAgent') || 'null');
        if (storedAgent) {
            setAgent(storedAgent);
        } else {
            navigate('/emi-login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Auto-calculate total amount if price and downpayment changed
            if (name === 'productPrice' || name === 'downPayment') {
                const price = parseFloat(name === 'productPrice' ? value : prev.productPrice) || 0;
                const down = parseFloat(name === 'downPayment' ? value : prev.downPayment) || 0;
                updated.totalAmount = (price - down).toString();
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agent) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${BASE_URL}/customer/add/${agent.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    productPrice: parseFloat(formData.productPrice),
                    downPayment: parseFloat(formData.downPayment),
                    totalAmount: parseFloat(formData.totalAmount),
                    months: parseInt(formData.months),
                    dueDate: parseInt(formData.dueDate)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Customer added & EMI Schedule generated!' });
                setTimeout(() => navigate('/emi-dashboard'), 2000);
            } else {
                setStatus({ type: 'error', message: typeof data === 'string' ? data : 'Failed to add customer. Mobile might already exist.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error connecting to backend services.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-reg-wrapper">
            <div className="customer-reg-card glass shadow-2xl">
                <div className="header-section">
                    <div className="title-area">
                        <PlusCircle size={32} className="text-black" />
                        <div>
                            <h1>New Customer Enrollment</h1>
                            <p>Register a new client and initialize their EMI schedule</p>
                        </div>
                    </div>
                </div>

                {status.message && (
                    <div className={`status-pill ${status.type} animate-bounce-subtle`}>
                        {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="enrollment-grid">
                    <div className="form-section">
                        <h3 className="section-title"><User size={18} /> Personal Details</h3>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <User size={16} />
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Customer Name" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Mobile Number</label>
                                <div className="input-wrapper">
                                    <Phone size={16} />
                                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="10-digit mobile" />
                                </div>
                            </div>
                        </div>
                        <div className="input-group full-width">
                            <label>Address</label>
                            <div className="input-wrapper">
                                <MapPin size={16} />
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Full residential address" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title"><Package size={18} /> Product & Loan Details</h3>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Product Name</label>
                                <div className="input-wrapper">
                                    <Package size={16} />
                                    <input type="text" name="productName" value={formData.productName} onChange={handleChange} required placeholder="e.g. iPhone 15" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Product Price (₹)</label>
                                <div className="input-wrapper">
                                    <CreditCard size={16} />
                                    <input type="number" name="productPrice" value={formData.productPrice} onChange={handleChange} required placeholder="Selling Price" />
                                </div>
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Down Payment (₹)</label>
                                <div className="input-wrapper">
                                    <TrendingUp size={16} />
                                    <input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} required placeholder="Initial Paid" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Loan Amount (₹)</label>
                                <div className="input-wrapper disabled">
                                    <CreditCard size={16} />
                                    <input type="number" name="totalAmount" value={formData.totalAmount} readOnly placeholder="Auto-calculated" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title"><Calendar size={18} /> EMI Schedule Settings</h3>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Tenure (Months)</label>
                                <div className="input-wrapper">
                                    <Calendar size={16} />
                                    <input type="number" name="months" value={formData.months} onChange={handleChange} required placeholder="e.g. 6, 12, 24" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Monthly Due Date</label>
                                <div className="input-wrapper">
                                    <Calendar size={16} />
                                    <input type="number" min="1" max="31" name="dueDate" value={formData.dueDate} onChange={handleChange} required placeholder="Day of month (1-31)" />
                                </div>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Payment Cycle</label>
                            <select name="paymentType" value={formData.paymentType} onChange={handleChange} className="modern-select">
                                <option value="MONTHLY">Monthly</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section summary-section">
                        <h3 className="section-title"><TrendingUp size={18} /> Loan Summary (Preview)</h3>
                        <div className="summary-card-modern">
                            <div className="summary-item">
                                <span>Monthly Installment</span>
                                <p className="emi-value">₹{formData.totalAmount && formData.months && formData.months > 0 ? (parseFloat(formData.totalAmount) / parseInt(formData.months)).toFixed(2) : '0.00'}</p>
                            </div>
                            <div className="summary-item">
                                <span>Total Loan</span>
                                <p>₹{formData.totalAmount || '0.00'}</p>
                            </div>
                            <div className="summary-item">
                                <span>Tenure</span>
                                <p>{formData.months || '0'} Months</p>
                            </div>
                        </div>
                    </div>

                    <div className="submit-area">
                        <button type="submit" className="btn-enroll" disabled={loading}>
                            {loading ? <Loader2 size={24} className="animate-spin" /> : (
                                <>
                                    Confirm Enrollment & Generate Schedule
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmiCustomerRegistration;
