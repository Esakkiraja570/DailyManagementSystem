import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Loader2, Printer, 
  Droplet, Package, Send
} from 'lucide-react';
import { BASE_URL } from './milkmanApi';

const BillingSummery = ({ customer, onBack }) => {
  const [entries, setEntries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingSms, setSendingSms] = useState(false);

  const displayMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const ROOT_URL = BASE_URL.replace('/api', '');

      const [milkRes, orderRes, prodRes] = await Promise.all([
        axios.get(`${BASE_URL}/milk/${customer.id}`),
        axios.get(`${ROOT_URL}/order/customer/${customer.mobile}`),
        axios.get(`${ROOT_URL}/product/list`)
      ]);

      setEntries(milkRes.data || []);
      setOrders(orderRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  }, [customer.id, customer.mobile]);

  useEffect(() => {
    if (customer) fetchBillingData();
  }, [customer, fetchBillingData]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get unit price: prefer product catalog, fallback to stored unitPrice, then total/qty
  const getUnitPrice = (o) => {
    const prod = products.find(p => p.id === o.productId || p.name === o.productName);
    if (prod && prod.price > 0) return parseFloat(prod.price);
    if (o.unitPrice && parseFloat(o.unitPrice) > 0) return parseFloat(o.unitPrice);
    const t = parseFloat(o.total);
    const q = parseFloat(o.quantity) || 1;
    if (!isNaN(t) && t > 0) return t / q;
    return 0;
  };

  const getLineTotal = (o) => getUnitPrice(o) * (parseFloat(o.quantity) || 1);

  const filteredEntries = entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).sort((a, b) => new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00'));

  const filteredOrders = orders.filter(o => {
    if (o.status !== 'DELIVERED') return false;
    if (!o.date) return true;
    const raw = o.date.includes('T') ? o.date : o.date + 'T00:00:00';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return true;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalLiters    = filteredEntries.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);
  const totalMilkCost  = filteredEntries.reduce((s, e) => s + ((parseFloat(e.total) || 0) * (parseFloat(e.price) || customer.price || 60)), 0);
  const totalProductCost = filteredOrders.reduce((s, o) => s + getLineTotal(o), 0);
  const grandTotal     = totalMilkCost + totalProductCost;

  const handleSendSms = async () => {
    setSendingSms(true);
    try {
      // Build a detailed, professional SMS bill summary
      const productLine = totalProductCost > 0
        ? ` | Products (${filteredOrders.length} items): Rs.${totalProductCost.toFixed(2)}`
        : '';
      const message =
        `*Executive Milk - Monthly Bill*\n` +
        `Customer: ${customer.name}\n` +
        `Month: ${displayMonthName}\n` +
        `----------------------------\n` +
        `Milk (${totalLiters.toFixed(1)}L): Rs.${totalMilkCost.toFixed(2)}${productLine}\n` +
        `----------------------------\n` +
        `*GRAND TOTAL: Rs.${grandTotal.toFixed(2)}*\n` +
        `Please pay at your earliest convenience. Thank you!`;

      await axios.post(`${BASE_URL}/sms/send?mobile=${customer.mobile}&message=${encodeURIComponent(message)}`);
      alert('Bill Summary sent via SMS! ✅');
    } catch (err) {
      alert('Failed to send SMS. Please try again.');
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
                {filteredEntries.length > 0 ? filteredEntries.map((e, i) => (
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
                  <th className="text-center">Unit Price (₹)</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
                <tbody>
                  {filteredOrders.length > 0 ? filteredOrders.map((o, i) => {
                    const qty     = parseFloat(o.quantity) || 1;
                    const uPrice  = getUnitPrice(o);
                    const lTotal  = getLineTotal(o);
                    return (
                    <tr key={i}>
                      <td className="small text-muted">{o.date || 'This Month'}</td>
                      <td>
                        <div className="fw-bold">{o.productName}</div>
                        <small className="text-muted extra-small">Delivered ✓</small>
                      </td>
                      <td className="text-center">₹{uPrice.toFixed(2)}</td>
                      <td className="text-center fw-bold">{qty}</td>
                      <td className="text-end fw-bold text-success">₹{lTotal.toFixed(2)}</td>
                    </tr>
                    );
                  }) : (
                    <tr><td colSpan="5" className="text-center py-4 text-muted small">No additional products purchased this month.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-light fw-bold">
                  <tr>
                    <td colSpan="3" className="text-end">Products Subtotal ({filteredOrders.reduce((s,o)=>s+(parseFloat(o.quantity)||0),0)} items):</td>
                    <td className="text-end text-success fw-bold" colSpan="2">₹{totalProductCost.toFixed(2)}</td>
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
