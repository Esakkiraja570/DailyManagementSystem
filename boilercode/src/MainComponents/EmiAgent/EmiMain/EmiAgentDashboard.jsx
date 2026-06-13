import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckSquare,
  AlertTriangle,
  Search,
  Plus,
  Settings,
  Loader2,
  X,
  Trash2,
  Calendar,
  Bell,
  HelpCircle,
} from 'lucide-react';

const BASE_URL = 'http://localhost:1010';

const EmiAgentDashboard = () => {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [agentData, setAgentData] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [todayDues, setTodayDues] = useState([]);
  const [overdue, setOverdue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customerDetails, setCustomerDetails] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerSchedule, setCustomerSchedule] = useState([]);

  const [lateFee, setLateFee] = useState(0);

  // =========================
  // ADD CUSTOMER FORM STATE
  // =========================
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    mobile: '',
    address: '',
    productName: '',
    productPrice: '',
    downPayment: '',
    totalAmount: '',
    months: '',
    dueDate: '1',
    paymentType: 'MONTHLY',
  });

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  const fetchDashboardData = useCallback(async (id) => {
    try {
      setLoading(true);

      const [custRes, todayRes, overdueRes] = await Promise.all([
        fetch(`${BASE_URL}/customer/all/${id}`),
        fetch(`${BASE_URL}/dashboard/today/${id}`),
        fetch(`${BASE_URL}/dashboard/overdue/${id}`),
      ]);

      setCustomers(custRes.ok ? await custRes.json() : []);
      setTodayDues(todayRes.ok ? await todayRes.json() : []);
      setOverdue(overdueRes.ok ? await overdueRes.json() : []);
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const storedAgent = JSON.parse(
      localStorage.getItem('emiAgent') || 'null'
    );

    if (!storedAgent) {
      navigate('/auth/agent/admin');
      return;
    }

    setAgentData(storedAgent);
    setLateFee(storedAgent.lateFeePerDay || 0);

    fetchDashboardData(storedAgent.id);
  }, [navigate, fetchDashboardData]);

  // =========================
  // ADD CUSTOMER
  // =========================
  const handleAddCustomer = async (e) => {
    e.preventDefault();

    setFormLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/customer/add/${agentData.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCustomer),
        }
      );

      if (response.ok) {
        alert('Customer Added Successfully ✅');

        setShowAddForm(false);

        setNewCustomer({
          name: '',
          mobile: '',
          address: '',
          productName: '',
          productPrice: '',
          downPayment: '',
          totalAmount: '',
          months: '',
          dueDate: '1',
          paymentType: 'MONTHLY',
        });

        fetchDashboardData(agentData.id);
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      console.error('Add Customer Error:', error);
      alert('Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // VIEW CUSTOMER
  // =========================
  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setDetailsLoading(true);

    try {
      const [historyRes, scheduleRes, summaryRes] = await Promise.all([
        fetch(`${BASE_URL}/payment/history/${customer.id}`),
        fetch(`${BASE_URL}/schedule/customer/${customer.id}`),
        fetch(`${BASE_URL}/customer/summary/${customer.id}`),
      ]);

      setCustomerHistory(
        historyRes.ok ? await historyRes.json() : []
      );

      setCustomerSchedule(
        scheduleRes.ok ? await scheduleRes.json() : []
      );

      setCustomerDetails(
        summaryRes.ok ? await summaryRes.json() : null
      );
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================
  // DELETE CUSTOMER
  // =========================
  const handleDeleteCustomer = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}/customer/delete/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        alert('Customer Deleted');

        setSelectedCustomer(null);

        fetchDashboardData(agentData.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // UPDATE LATE FEE
  // =========================
  const handleUpdateLateFee = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${BASE_URL}/agent/late-fee/${agentData.id}?fee=${lateFee}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        alert('Late Fee Updated');

        const updatedAgent = {
          ...agentData,
          lateFeePerDay: lateFee,
        };

        setAgentData(updatedAgent);

        localStorage.setItem(
          'emiAgent',
          JSON.stringify(updatedAgent)
        );

        setShowSettings(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // CALCULATIONS
  // =========================
  const totalOutstanding = customers.reduce(
    (acc, customer) => acc + (customer.balance || 0),
    0
  );

  const totalCollected = customers.reduce(
    (acc, customer) => acc + (customer.totalPaid || 0),
    0
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.mobile?.includes(searchQuery)
  );

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 p-0 d-flex">

      {/* =========================
          SIDEBAR
      ========================== */}
      <div
        className="bg-white border-end d-none d-lg-flex flex-column"
        style={{ width: '260px' }}
      >
        <div className="p-4 border-bottom d-flex align-items-center gap-3">
          <div className="bg-primary text-white p-2 rounded">
            <Briefcase size={20} />
          </div>

          <div>
            <h5 className="fw-bold mb-0">EMI Portal</h5>
            <small className="text-muted">
              Collection Dashboard
            </small>
          </div>
        </div>

        <div className="flex-grow-1 p-3">
          <button className="btn btn-primary w-100 rounded-pill mb-3">
            Dashboard
          </button>

          <button
            className="btn btn-light w-100 rounded-pill mb-3"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={16} className="me-2" />
            Settings
          </button>

          <button
            className="btn btn-dark w-100 rounded-pill"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} className="me-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <div className="flex-grow-1">

        {/* =========================
            HEADER
        ========================== */}
        <div className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">

          <div>
            <h3 className="fw-bold mb-0">EMI Dashboard</h3>
            <small className="text-muted">
              Welcome back {agentData?.name}
            </small>
          </div>

          <div className="d-flex align-items-center gap-3">

            <div className="position-relative">
              <Search
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                size={16}
              />

              <input
                type="text"
                className="form-control rounded-pill ps-5"
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>

            <Bell className="text-muted" />
            <HelpCircle className="text-muted" />

          </div>
        </div>

        {/* =========================
            BODY
        ========================== */}
        <div className="p-4">

          {/* =========================
              STATS
          ========================== */}
          <div className="row g-4 mb-4">

            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted">
                      Outstanding
                    </small>

                    <h4 className="fw-bold mt-2">
                      ₹{totalOutstanding.toLocaleString()}
                    </h4>
                  </div>

                  <Briefcase className="text-primary" />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted">
                      Collected
                    </small>

                    <h4 className="fw-bold mt-2">
                      ₹{totalCollected.toLocaleString()}
                    </h4>
                  </div>

                  <CheckSquare className="text-success" />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted">
                      Today Dues
                    </small>

                    <h4 className="fw-bold mt-2">
                      {todayDues.length}
                    </h4>
                  </div>

                  <Calendar className="text-warning" />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted">
                      Overdue
                    </small>

                    <h4 className="fw-bold mt-2">
                      {overdue.length}
                    </h4>
                  </div>

                  <AlertTriangle className="text-danger" />
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              CUSTOMER TABLE
          ========================== */}
          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">
                Manage Customers
              </h5>

              <button
                className="btn btn-primary rounded-pill"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} className="me-2" />
                Add Customer
              </button>
            </div>

            <div className="table-responsive">

              <table className="table align-middle table-hover mb-0">

                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th>EMI Amount</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th className="text-end px-4">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>

                      <td className="px-4 py-3">
                        <div className="fw-bold">
                          {customer.name}
                        </div>

                        <small className="text-muted">
                          {customer.mobile}
                        </small>
                      </td>

                      <td>
                        ₹
                        {customer.emiAmount?.toLocaleString()}
                      </td>

                      <td className="text-danger fw-bold">
                        ₹
                        {customer.balance?.toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill ${
                            customer.status === 'ACTIVE'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td className="text-end px-4">
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill"
                          onClick={() =>
                            handleViewCustomer(customer)
                          }
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          </div>
        </div>
      </div>

      {/* =========================
          ADD CUSTOMER MODAL
      ========================== */}
      {showAddForm && (
        <div className="modal-overlay">

          <div className="modal-box">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                Add New Customer
              </h5>

              <button
                className="btn btn-light rounded-circle"
                onClick={() => setShowAddForm(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* =========================
                FORM
            ========================== */}
            <form onSubmit={handleAddCustomer}>

              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newCustomer.mobile}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        mobile: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Address
                  </label>

                  <textarea
                    className="form-control"
                    rows="2"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Product Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={newCustomer.productName}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        productName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Product Price
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    value={newCustomer.productPrice}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        productPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Down Payment
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    value={newCustomer.downPayment}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        downPayment: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Loan Amount
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    required
                    value={newCustomer.totalAmount}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        totalAmount: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Months
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    required
                    value={newCustomer.months}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        months: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Due Date
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="31"
                    value={newCustomer.dueDate}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Payment Type
                  </label>

                  <select
                    className="form-select"
                    value={newCustomer.paymentType}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        paymentType: e.target.value,
                      })
                    }
                  >
                    <option value="MONTHLY">
                      Monthly
                    </option>

                    <option value="WEEKLY">
                      Weekly
                    </option>

                    <option value="DAILY">
                      Daily
                    </option>
                  </select>
                </div>

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 rounded-pill py-3 fw-bold"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Register Customer'
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          CUSTOMER DETAILS MODAL
      ========================== */}
      {selectedCustomer && (
        <div className="modal-overlay">

          <div className="modal-box">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0">
                  {selectedCustomer.name}
                </h5>

                <small className="text-muted">
                  {selectedCustomer.mobile}
                </small>
              </div>

              <button
                className="btn btn-light rounded-circle"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center py-5">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="row text-center mb-4">

                  <div className="col-4">
                    <small className="text-muted">
                      Paid
                    </small>

                    <h5 className="fw-bold text-success">
                      ₹{customerDetails?.totalPaid}
                    </h5>
                  </div>

                  <div className="col-4">
                    <small className="text-muted">
                      Balance
                    </small>

                    <h5 className="fw-bold text-danger">
                      ₹{customerDetails?.balance}
                    </h5>
                  </div>

                  <div className="col-4">
                    <small className="text-muted">
                      EMI
                    </small>

                    <h5 className="fw-bold">
                      ₹{customerDetails?.emiAmount}
                    </h5>
                  </div>

                </div>

                <h6 className="fw-bold mb-3">
                  Upcoming Schedule
                </h6>

                <div className="list-group mb-4">

                  {customerSchedule
                    .slice(0, 5)
                    .map((schedule, index) => (
                      <div
                        key={index}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>
                          Installment #
                          {schedule.installmentNo}
                        </span>

                        <span>
                          {schedule.status}
                        </span>
                      </div>
                    ))}

                </div>

                <button
                  className="btn btn-outline-danger w-100 rounded-pill"
                  onClick={() =>
                    handleDeleteCustomer(
                      selectedCustomer.id
                    )
                  }
                >
                  <Trash2 size={16} className="me-2" />
                  Delete Customer
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================
          SETTINGS MODAL
      ========================== */}
      {showSettings && (
        <div className="modal-overlay">

          <div
            className="modal-box"
            style={{ maxWidth: '450px' }}
          >

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                EMI Settings
              </h5>

              <button
                className="btn btn-light rounded-circle"
                onClick={() => setShowSettings(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateLateFee}>

              <label className="form-label fw-semibold">
                Daily Late Fee
              </label>

              <div className="input-group mb-4">

                <span className="input-group-text">
                  <DollarSign size={16} />
                </span>

                <input
                  type="number"
                  className="form-control"
                  value={lateFee}
                  onChange={(e) =>
                    setLateFee(e.target.value)
                  }
                />

              </div>

              <button className="btn btn-dark w-100 rounded-pill py-2">
                Update Settings
              </button>

            </form>
          </div>
        </div>
      )}

      {/* =========================
          CUSTOM CSS
      ========================== */}
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-box {
          background: white;
          width: 100%;
          max-width: 700px;
          border-radius: 24px;
          padding: 30px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
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

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default EmiAgentDashboard;