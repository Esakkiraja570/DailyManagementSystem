import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Loader2, PieChart, Calendar, History, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './EmiCustomerDashboard.css';

const BASE_URL = "http://localhost:1010";

const EmiCustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchData = useCallback(async (id) => {
    try {
      setLoading(true);

      const [custRes, histRes, schedRes] = await Promise.all([
        fetch(`${BASE_URL}/customer/${id}`),
        fetch(`${BASE_URL}/payment/history/${id}`),
        fetch(`${BASE_URL}/schedule/customer/${id}`)
      ]);

      if (!custRes.ok) throw new Error("Customer fetch failed");

      const cust = await custRes.json();
      setCustomer(cust);
      localStorage.setItem("emiCustomer", JSON.stringify(cust));

      setPaymentHistory(histRes.ok ? await histRes.json() : []);
      setSchedule(schedRes.ok ? await schedRes.json() : []);

    } catch (err) {
      console.error(err);
      setError("⚠️ Backend not reachable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('emiCustomer') || 'null');

    if (!stored) {
      navigate('/auth/agent/customer/login');
      return;
    }

    fetchData(stored.id);
  }, [fetchData, navigate]);

  // ================= LOAD RAZORPAY =================
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // ================= PAYMENT =================
  const handlePayEMI = async () => {
    try {
      if (!customer?.emiAmount) {
        alert("❌ EMI amount missing");
        return;
      }

      setPaying(true);

      console.log("Loading Razorpay...");
      const loaded = await loadRazorpay();

      if (!loaded) throw new Error("Razorpay SDK failed");

      console.log("Creating order...");
      const orderRes = await fetch(`${BASE_URL}/payment/create-order/${customer.id}`, {
        method: "POST"
      });

      const order = await orderRes.json();
      console.log("Order:", order);

      if (!order.id) throw new Error("Order creation failed");

      const options = {
        key: "rzp_test_SiUZm0fwjT39g4",
        amount: order.amount,
        currency: "INR",
        name: "DMS EMI",
        description: "EMI Payment",
        order_id: order.id,

        // 🔥 FIXED HANDLER
        handler: async function (response) {
          console.log("PAYMENT SUCCESS:", response);
          await verifyPayment(response);
        },

        prefill: {
          name: customer.name,
          contact: customer.mobile
        },

        theme: { color: "#000" }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        console.error(resp);
        alert("❌ Payment Failed: " + resp.error.description);
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  // ================= VERIFY =================
  const verifyPayment = async (response) => {
    try {
      const total = customer.emiAmount + (customer.lateFee || 0);

      console.log("Verifying payment...");

      const res = await fetch(
        `${BASE_URL}/payment/verify/${customer.id}?amount=${total}&mode=ONLINE`,
        { method: "POST" }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      alert("✅ Payment Successful");
      fetchData(customer.id);

    } catch (err) {
      console.error(err);
      alert("❌ Verification Failed");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("emiCustomer");
    navigate('/auth/agent/customer/login');
  };

  // ================= PDF =================
  const generateBill = () => {
    const doc = new jsPDF();

    doc.text("EMI RECEIPT", 80, 20);
    doc.text(`Name: ${customer?.name}`, 20, 40);
    doc.text(`Balance: ₹${customer?.balance}`, 20, 50);

    doc.save("receipt.pdf");
  };

  if (loading) {
    return (
      <div className="loader">
        <Loader2 className="spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) return <div className="error-box">{error}</div>;

  const progress = ((customer.totalPaid / customer.totalAmount) * 100 || 0).toFixed(1);

  return (
    <div className="container">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>EMI Portal</h2>

        <button onClick={() => setActiveTab('summary')}>
          <PieChart /> Summary
        </button>

        <button onClick={() => setActiveTab('schedule')}>
          <Calendar /> Schedule
        </button>

        <button onClick={() => setActiveTab('history')}>
          <History /> History
        </button>

        <button className="logout" onClick={logout}>
          <LogOut /> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="main">
        <h1>Welcome, {customer.name}</h1>

        {activeTab === 'summary' && (
          <div className="card">
            <h2>Outstanding</h2>
            <h1>₹{customer.balance + (customer.lateFee || 0)}</h1>

            <p>Progress: {progress}%</p>

            <button className="pay-btn" onClick={handlePayEMI} disabled={paying}>
              {paying ? <Loader2 className="spin" /> : <CreditCard />}
              Pay EMI
            </button>

            <button onClick={generateBill}>Download Receipt</button>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="list">
            {schedule.map(s => (
              <div key={s.id} className="list-item">
                <span>#{s.installmentNo}</span>
                <span>₹{s.emiAmount}</span>
                <span>{s.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="list">
            {paymentHistory.map(p => (
              <div key={p.id} className="list-item success">
                <span>{new Date(p.paidDate).toLocaleDateString()}</span>
                <span>₹{p.amountPaid}</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default EmiCustomerDashboard;