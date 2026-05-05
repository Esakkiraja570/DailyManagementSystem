import React, { useState } from 'react';
import { Shield, Lock, Phone, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './EmiAgentLogin.css';

const BASE_URL = "http://localhost:1010";

const EmiAgentLogin = () => {

    const [mode, setMode] = useState("login"); // login | forgot
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        mobile: '',
        password: '',
        otp: '',
        newPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ✅ COMMON API CALL
    const callAPI = async (url, body) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: "Server error" };
        }

        if (!res.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    };

    // ================= LOGIN =================
    const handleLogin = async (e) => {
        e.preventDefault();

        if (formData.mobile.length !== 10) {
            return setStatus({ type: 'error', message: 'Enter valid mobile number' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const data = await callAPI(`${BASE_URL}/agent/login`, {
                mobile: formData.mobile,
                password: formData.password
            });

            localStorage.setItem("emiAgent", JSON.stringify(data));

            setStatus({ type: 'success', message: 'Login Successful!' });

            setTimeout(() => navigate('/emi-dashboard'), 1200);

        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    // ================= SEND OTP =================
    const sendOtp = async () => {
        if (formData.mobile.length !== 10) {
            return setStatus({ type: 'error', message: 'Enter valid mobile number' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await callAPI(`${BASE_URL}/agent/send-otp`, {
                mobile: formData.mobile
            });

            setStep(2);
            setStatus({ type: 'success', message: 'OTP sent successfully' });

        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    // ================= VERIFY OTP =================
    const verifyOtp = async () => {
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await callAPI(`${BASE_URL}/agent/verify-otp`, {
                mobile: formData.mobile,
                otp: formData.otp
            });

            setStep(3);
            setStatus({ type: 'success', message: 'OTP verified' });

        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    // ================= RESET PASSWORD =================
    const resetPassword = async () => {
        if (formData.newPassword.length < 4) {
            return setStatus({ type: 'error', message: 'Password must be at least 4 characters' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await callAPI(`${BASE_URL}/agent/reset-password`, {
                mobile: formData.mobile,
                newPassword: formData.newPassword
            });

            setStatus({ type: 'success', message: 'Password reset successful!' });

            setTimeout(() => {
                setMode("login");
                setStep(1);
                setFormData({ mobile: '', password: '', otp: '', newPassword: '' });
            }, 1200);

        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-login-container">
            <div className="login-card animate-scale-in">

                <div className="login-header">
                    <div className="login-badge">
                        <Shield size={32} className="text-black" />
                    </div>
                    <h2>{mode === "login" ? "Agent Login" : "Reset Password"}</h2>
                </div>

                {status.message && (
                    <div className={`status-alert ${status.type}`}>
                        {status.type === 'success'
                            ? <CheckCircle size={18} />
                            : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                {/* ================= LOGIN ================= */}
                {mode === "login" && (
                    <form onSubmit={handleLogin} className="login-form">

                        <div className="input-group-modern">
                            <Phone size={18} />
                            <input
                                name="mobile"
                                placeholder="Mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group-modern">
                            <Lock size={18} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="forgot-pass">
                            <span onClick={() => {
                                setMode("forgot");
                                setStatus({ type: '', message: '' });
                            }}>
                                Forgot Password?
                            </span>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> :
                                <>Login <ArrowRight /></>}
                        </button>

                    </form>
                )}

                {/* ================= FORGOT ================= */}
                {mode === "forgot" && (
                    <div className="login-form">

                        {step === 1 && (
                            <>
                                <div className="input-group-modern">
                                    <Phone size={18} />
                                    <input
                                        name="mobile"
                                        placeholder="Enter Mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button onClick={sendOtp} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="input-group-modern">
                                    <Lock size={18} />
                                    <input
                                        name="otp"
                                        placeholder="Enter OTP"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button onClick={verifyOtp} disabled={loading}>
                                    Verify OTP
                                </button>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="input-group-modern">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="New Password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button onClick={resetPassword} disabled={loading}>
                                    Reset Password
                                </button>
                            </>
                        )}

                        <div style={{ marginTop: "10px" }}>
                            <span
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setMode("login");
                                    setStep(1);
                                    setStatus({ type: '', message: '' });
                                }}>
                                Back to Login
                            </span>
                        </div>

                    </div>
                )}

                {mode === "login" && (
                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/emi-register">Create Account</Link></p>
                    </div>
                )}

            </div>
            
        </div>
    );
};

export default EmiAgentLogin;