// ===============================
// EMI CUSTOMER DASHBOARD
// MERGED UI + API + RAZORPAY
// ===============================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Loader2,
  PieChart,
  Calendar,
  History,
  LogOut,
  Download,
  ShieldCheck,
  Bell,
  FileText,
  Lock
} from 'lucide-react';

import jsPDF from 'jspdf';

const BASE_URL = "http://localhost:1010";

const EmiCustomerDashboard = () => {

  // ===============================
  // STATE
  // ===============================
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const [totalPayable, setTotalPayable] = useState({
    emiAmount: 0,
    lateFee: 0,
    total: 0
  });

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [activeTab, setActiveTab] = useState('summary');

  const navigate = useNavigate();

  // ===============================
  // FETCH CUSTOMER DATA
  // ===============================
  const fetchData = useCallback(async (id) => {

    try {

      setLoading(true);

      const [
        custRes,
        histRes,
        schedRes,
        totalRes
      ] = await Promise.all([
        fetch(`${BASE_URL}/customer/${id}`),
        fetch(`${BASE_URL}/payment/history/${id}`),
        fetch(`${BASE_URL}/schedule/customer/${id}`),
        fetch(`${BASE_URL}/payment/total/${id}`)
      ]);

      // ===============================
      // CUSTOMER
      // ===============================
      if (!custRes.ok) {
        throw new Error("Customer Fetch Failed");
      }

      const cust = await custRes.json();

      setCustomer(cust);

      localStorage.setItem(
        "emiCustomer",
        JSON.stringify(cust)
      );

      // ===============================
      // HISTORY
      // ===============================
      setPaymentHistory(
        histRes.ok
          ? await histRes.json()
          : []
      );

      // ===============================
      // SCHEDULE
      // ===============================
      setSchedule(
        schedRes.ok
          ? await schedRes.json()
          : []
      );

      // ===============================
      // TOTAL PAYABLE
      // ===============================
      setTotalPayable(
        totalRes.ok
          ? await totalRes.json()
          : {
              emiAmount: 0,
              lateFee: 0,
              total: 0
            }
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }, []);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {

    const stored = JSON.parse(
      localStorage.getItem('emiCustomer') || 'null'
    );

    if (!stored) {

      navigate('/auth/agent/customer/login');

      return;
    }

    fetchData(stored.id);

  }, [fetchData, navigate]);

  // ===============================
  // LOAD RAZORPAY SCRIPT
  // ===============================
  const loadRazorpay = () => {

    return new Promise((resolve) => {

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);

    });
  };

  // ===============================
  // PAY EMI
  // ===============================
  const handlePayEMI = async () => {

    try {

      setPaying(true);

      // ===============================
      // LOAD SDK
      // ===============================
      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        throw new Error("Razorpay SDK Failed");
      }

      // ===============================
      // CREATE ORDER
      // ===============================
      const orderRes = await fetch(
        `${BASE_URL}/payment/create-order/${customer.id}`,
        {
          method: "POST"
        }
      );

      const order = await orderRes.json();

      if (!order.id) {
        throw new Error("Order Creation Failed");
      }

      // ===============================
      // RAZORPAY OPTIONS
      // ===============================
      const options = {

        key: "rzp_test_SiUZm0fwjT39g4",

        amount: order.amount,

        currency: "INR",

        name: "DMS ENTERPRISE",

        description:
          `EMI Payment for ${customer.productName || 'Loan'}`,

        order_id: order.id,

        handler: async function (response) {

          await verifyPayment(response);

        },

        prefill: {

          name: customer.name,

          contact: customer.mobile

        },

        theme: {

          color: "#0d6efd"

        }

      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();

    } catch (error) {

      alert("Payment Error : " + error.message);

    } finally {

      setPaying(false);

    }

  };

  // ===============================
  // VERIFY PAYMENT
  // ===============================
  const verifyPayment = async (razorResponse) => {

    try {

      const payload = {

        amount: totalPayable.total,

        mode: "ONLINE",

        razorpayOrderId:
          razorResponse.razorpay_order_id,

        razorpayPaymentId:
          razorResponse.razorpay_payment_id,

        razorpaySignature:
          razorResponse.razorpay_signature

      };

      const response = await fetch(
        `${BASE_URL}/payment/verify/${customer.id}`,
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)

        }
      );

      if (!response.ok) {
        throw new Error("Payment Verification Failed");
      }

      alert("✅ Payment Successful");

      // REFRESH
      fetchData(customer.id);

    } catch (error) {

      alert("Verification Error : " + error.message);

    }

  };

  // ===============================
  // GENERATE PDF RECEIPT
  // ===============================
  const generateBill = () => {

    const doc = new jsPDF();

    doc.setFontSize(20);

    doc.text(
      "DMS ENTERPRISE RECEIPT",
      105,
      20,
      null,
      null,
      "center"
    );

    doc.setFontSize(12);

    doc.text(
      `Customer : ${customer.name}`,
      20,
      50
    );

    doc.text(
      `Customer ID : EMI-${customer.id}`,
      20,
      60
    );

    doc.text(
      `Total Paid : ₹${customer.totalPaid}`,
      20,
      70
    );

    doc.text(
      `Outstanding : ₹${customer.balance}`,
      20,
      80
    );

    doc.text(
      `Status : ${customer.status}`,
      20,
      90
    );

    doc.save(`Receipt_${customer.name}.pdf`);

  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {

    return (

      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">

        <Loader2
          className="animate-spin text-primary mb-3"
          size={50}
        />

        <h6 className="text-muted">
          Loading Dashboard...
        </h6>

      </div>

    );
  }

  // ===============================
  // PROGRESS
  // ===============================
  const progress =
    (
      (customer.totalPaid /
        (customer.totalAmount || 1)) * 100
    ).toFixed(0);

  const paidCount =
    schedule.filter(
      item => item.status === 'PAID'
    ).length;

  return (

    <div className="container-fluid p-0 d-flex bg-light min-vh-100 overflow-hidden">

      {/* ===============================
          SIDEBAR
      =============================== */}
      <aside
        className="bg-white border-end d-flex flex-column"
        style={{ width: '280px' }}
      >

        <div className="p-4">

          <h4 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
            <ShieldCheck size={28} />
            DMS PAY
          </h4>

          <small className="text-muted">
            CUSTOMER PORTAL
          </small>

        </div>

        {/* MENU */}
        <nav className="flex-grow-1 px-3">

          <ul className="nav flex-column gap-2">

            <li>
              <button
                onClick={() => setActiveTab('summary')}
                className={`nav-link w-100 text-start rounded-pill px-4 py-3 border-0 ${
                  activeTab === 'summary'
                    ? 'bg-primary bg-opacity-10 text-primary fw-bold'
                    : 'text-secondary'
                }`}
              >
                <PieChart size={18} className="me-2" />
                Dashboard
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`nav-link w-100 text-start rounded-pill px-4 py-3 border-0 ${
                  activeTab === 'schedule'
                    ? 'bg-primary bg-opacity-10 text-primary fw-bold'
                    : 'text-secondary'
                }`}
              >
                <Calendar size={18} className="me-2" />
                Schedule
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab('history')}
                className={`nav-link w-100 text-start rounded-pill px-4 py-3 border-0 ${
                  activeTab === 'history'
                    ? 'bg-primary bg-opacity-10 text-primary fw-bold'
                    : 'text-secondary'
                }`}
              >
                <History size={18} className="me-2" />
                Transactions
              </button>
            </li>

          </ul>

        </nav>

        {/* PAY BUTTON */}
        <div className="p-4 border-top">

          <button
            className="btn btn-primary w-100 py-3 rounded-3 fw-bold"
            onClick={handlePayEMI}
            disabled={paying || customer.balance <= 0}
          >

            {paying ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CreditCard size={18} className="me-2" />
                {customer.balance <= 0
                  ? 'Loan Completed'
                  : 'Pay EMI'}
              </>
            )}

          </button>

        </div>

      </aside>

      {/* ===============================
          MAIN
      =============================== */}
      <main className="flex-grow-1 overflow-auto">

        {/* HEADER */}
        <header className="bg-white border-bottom px-5 py-3 d-flex justify-content-between align-items-center">

          <div>
            <h4 className="fw-bold mb-0">
              Welcome, {customer.name}
            </h4>

            <small className="text-muted">
              EMI ID : #{customer.id}
            </small>
          </div>

          <div className="d-flex align-items-center gap-3">

            <button
              className="btn btn-outline-dark rounded-3"
              onClick={generateBill}
            >
              <Download size={16} className="me-2" />
              PDF
            </button>

            <Bell className="text-muted" />

            <button
              className="btn btn-outline-danger"
              onClick={() => {

                localStorage.removeItem('emiCustomer');

                navigate('/auth/agent/customer/login');

              }}
            >
              <LogOut size={16} className="me-2" />
              Logout
            </button>

          </div>

        </header>

        {/* CONTENT */}
        <div className="p-5">

          {/* SUMMARY */}
          {activeTab === 'summary' && (

            <>
              <div className="row g-4 mb-5">

                {/* PAYABLE */}
                <div className="col-md-4">

                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                    <small className="text-muted fw-bold">
                      CURRENT PAYABLE
                    </small>

                    <h2 className="fw-bold text-primary mt-2">
                      ₹{totalPayable.total?.toLocaleString()}
                    </h2>

                    <div className="small text-muted mt-3">
                      EMI :
                      ₹{totalPayable.emiAmount}
                    </div>

                    {totalPayable.lateFee > 0 && (
                      <div className="small text-danger">
                        Late Fee :
                        ₹{totalPayable.lateFee}
                      </div>
                    )}

                  </div>

                </div>

                {/* PROGRESS */}
                <div className="col-md-4">

                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-primary text-white">

                    <small>
                      REPAYMENT PROGRESS
                    </small>

                    <h1 className="fw-bold mt-2">
                      {progress}%
                    </h1>

                    <div className="progress mt-3">
                      <div
                        className="progress-bar bg-white"
                        style={{
                          width: `${progress}%`
                        }}
                      />
                    </div>

                    <small className="mt-3">
                      {paidCount} of {schedule.length} Paid
                    </small>

                  </div>

                </div>

                {/* BALANCE */}
                <div className="col-md-4">

                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                    <small className="text-muted fw-bold">
                      OUTSTANDING
                    </small>

                    <h2 className="fw-bold mt-2 text-danger">
                      ₹{customer.balance?.toLocaleString()}
                    </h2>

                  </div>

                </div>

              </div>

            </>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

              <div className="card-header bg-white border-0 p-4">
                <h5 className="fw-bold mb-0">
                  EMI Schedule
                </h5>
              </div>

              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead className="bg-light">

                    <tr>
                      <th className="px-4 py-3">
                        Installment
                      </th>

                      <th>Amount</th>

                      <th>Due Date</th>

                      <th>Status</th>

                      <th className="text-end px-4">
                        Action
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {schedule.map((s, index) => (

                      <tr key={s.id}>

                        <td className="px-4 py-3 fw-bold">
                          {s.installmentNo}
                        </td>

                        <td>
                          ₹{s.emiAmount}
                        </td>

                        <td>
                          {new Date(
                            s.dueDate
                          ).toLocaleDateString()}
                        </td>

                        <td>

                          <span
                            className={`badge rounded-pill ${
                              s.status === 'PAID'
                                ? 'bg-success'
                                : s.status === 'PENDING'
                                ? 'bg-warning text-dark'
                                : 'bg-secondary'
                            }`}
                          >
                            {s.status}
                          </span>

                        </td>

                        <td className="text-end px-4">

                          {s.status === 'PENDING' && (

                            <button
                              className="btn btn-primary btn-sm rounded-pill"
                              onClick={handlePayEMI}
                            >
                              Pay Now
                            </button>

                          )}

                          {s.status === 'PAID' && (
                            <FileText size={18} />
                          )}

                          {s.status === 'FUTURE' && (
                            <Lock size={18} />
                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* HISTORY */}
          {activeTab === 'history' && (

            <div className="card border-0 shadow-sm rounded-4 p-4">

              <h5 className="fw-bold mb-4">
                Transaction History
              </h5>

              {paymentHistory.length === 0 ? (

                <div className="text-center text-muted py-5">
                  No Transactions Found
                </div>

              ) : (

                paymentHistory.map((payment) => (

                  <div
                    key={payment.id}
                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                  >

                    <div>

                      <h6 className="fw-bold mb-1">
                        ₹{payment.amountPaid}
                      </h6>

                      <small className="text-muted">
                        {new Date(
                          payment.paidDate
                        ).toLocaleString()}
                      </small>

                    </div>

                    <span className="badge bg-light text-dark">
                      {payment.paymentMode}
                    </span>

                  </div>

                ))

              )}

            </div>

          )}

        </div>

      </main>

      {/* CUSTOM CSS */}
      <style>{`

        .rounded-4 {
          border-radius: 1rem;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {

          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }

        }

      `}</style>

    </div>

  );
};

export default EmiCustomerDashboard;