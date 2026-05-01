import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, ArrowLeft, Loader2, Printer, 
  Droplet, Package, CreditCard, Send
} from 'lucide-react';
import './Dashboard.css';

const BillingSummery = ({ customer, onBack }) => {
  const [entries, setEntries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingSms, setSendingSms] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2024-05"
  const displayMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (customer) {
      fetchBillingData();
    }
  }, [customer]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const milkRes = await axios.get(`http://localhost:1010/api/milk/${customer.id}`);
      const allEntries = milkRes.data || [];
      setEntries(allEntries);

      const orderRes = await axios.get(`http://localhost:1010/api/order/customer/${customer.mobile}`);
      const allOrders = orderRes.data || [];
      setOrders(allOrders);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalLiters = entries.reduce((sum, e) => sum + (parseFloat(e.total) || 0), 0);
  const totalMilkCost = entries.reduce((sum, e) => sum + ((parseFloat(e.total) || 0) * (parseFloat(e.price) || customer.price || 60)), 0);
  
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalProductCost = validOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  
  const grandTotal = totalMilkCost + totalProductCost;

  const handleSendSms = async () => {
    setSendingSms(true);
    try {
      const message = `Dear ${customer.name}, your Executive Milk bill for ${displayMonthName} is Rs.${grandTotal.toFixed(2)}. Milk: Rs.${totalMilkCost.toFixed(2)}, Products: Rs.${totalProductCost.toFixed(2)}. Thank you!`;
      await axios.post(`http://localhost:1010/api/sms/send?mobile=${customer.mobile}&message=${encodeURIComponent(message)}`);
      alert("Bill Summary sent via SMS! ✅");
    } catch (err) {
      alert("Failed to send SMS.");
      console.error(err);
    } finally {
      setSendingSms(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-scale-up">
      {onBack && (
        <div className="d-flex justify-content-between align-items-center mb-4 hide-on-print">
          <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={onBack}>
            <ArrowLeft size={20}/>
          </button>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold" onClick={handleSendSms} disabled={sendingSms}>
              {sendingSms ? <Loader2 size={16} className="animate-spin me-2"/> : <Send size={16} className="me-2"/>}
              {sendingSms ? 'SENDING...' : 'SEND VIA SMS'}
            </button>
            <button className="btn btn-outline-dark btn-sm rounded-pill px-4 fw-bold" onClick={() => window.print()}>
              <Printer size={16} className="me-2"/> PRINT INVOICE
            </button>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-lg rounded-4 bg-white p-5 printable-invoice" id="invoice-area">
        {/* Invoice Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="bg-primary text-white p-2 rounded-3"><Droplet size={24}/></div>
              <h3 className="fw-bold mb-0">Executive Milk</h3>
            </div>
            <p className="text-muted small mb-0">Monthly Billing Statement</p>
          </div>
          <div className="text-end">
            <h5 className="fw-bold text-uppercase text-primary mb-1">INVOICE</h5>
            <p className="fw-bold mb-0">{displayMonthName}</p>
            <p className="text-muted small mb-0">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="row mb-5">
          <div className="col-sm-6">
            <p className="small text-uppercase text-muted fw-bold mb-1">Billed To:</p>
            <h5 className="fw-bold mb-1">{customer.name}</h5>
            <p className="text-muted mb-0">{customer.mobile}</p>
            <p className="text-muted mb-0">{customer.address}</p>
          </div>
          <div className="col-sm-6 text-end">
            <p className="small text-uppercase text-muted fw-bold mb-1">Total Amount Due:</p>
            <h2 className="fw-bold text-success mb-0">₹{grandTotal.toFixed(2)}</h2>
          </div>
        </div>

        {/* Milk Consumption Table */}
        <div className="mb-5">
          <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
            <Droplet size={18} className="text-primary"/> Milk Consumption
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="bg-light">
                <tr className="small text-uppercase text-muted">
                  <th>Date</th>
                  <th className="text-center">Morning</th>
                  <th className="text-center">Evening</th>
                  <th className="text-center">Total (L)</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? entries.map((e, i) => (
                  <tr key={i}>
                    <td className="fw-bold small">{e.date}</td>
                    <td className="text-center">{e.morning || 0}L</td>
                    <td className="text-center">{e.evening || 0}L</td>
                    <td className="text-center fw-bold bg-light">{e.total}L</td>
                    <td className="text-end">{(e.total * (e.price || customer.price || 60)).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center py-3 text-muted small">No milk entries for this month.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-light fw-bold">
                <tr>
                  <td colSpan="3" className="text-end">Milk Subtotal:</td>
                  <td className="text-center text-primary">{totalLiters.toFixed(1)}L</td>
                  <td className="text-end text-primary">₹{totalMilkCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Product Orders Table */}
        <div className="mb-5">
          <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
            <Package size={18} className="text-success"/> Additional Products
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="bg-light">
                <tr className="small text-uppercase text-muted">
                  <th>Date</th>
                  <th>Item Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {validOrders.length > 0 ? validOrders.map((o, i) => (
                  <tr key={i}>
                    <td className="small">{o.date}</td>
                    <td className="fw-bold">{o.productName}</td>
                    <td className="text-center">{o.quantity}</td>
                    <td className="text-end">{(o.total).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-3 text-muted small">No product purchases this month.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-light fw-bold">
                <tr>
                  <td colSpan="3" className="text-end">Products Subtotal:</td>
                  <td className="text-end text-success">₹{totalProductCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Grand Total */}
        <div className="row justify-content-end">
          <div className="col-md-5">
            <div className="bg-light p-4 rounded-4 border">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-bold">Milk Cost:</span>
                <span className="fw-bold">₹{totalMilkCost.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                <span className="text-muted fw-bold">Product Cost:</span>
                <span className="fw-bold">₹{totalProductCost.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-uppercase">Grand Total:</span>
                <h3 className="fw-bold text-primary mb-0">₹{grandTotal.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center text-muted extra-small opacity-50 hide-on-print">
          <p className="mb-0">This is a system generated statement.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default BillingSummery;
