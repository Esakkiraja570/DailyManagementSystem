import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL, getMilkmanMobile } from './milkmanApi';
import { 
  Calendar as CalendarIcon, ArrowLeft, Loader2, Save, 
  Edit3, Droplet, Package, Plus, Minus, ShoppingCart, 
  CheckCircle, AlertCircle, FileText, Trash2
} from 'lucide-react';

const AddEntry = ({ customer, globalPrice, onBack, onViewBill }) => {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  
  // Milk Entry Form State
  const [date, setDate] = useState(today);
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [existingEntryId, setExistingEntryId] = useState(null);

  // Product Order State
  const [quantities, setQuantities] = useState({});

  const milkmanMobile = getMilkmanMobile();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch milk entries for customer
      const entriesRes = await axios.get(`${BASE_URL}/milk/${customer.id}`);
      setEntries(entriesRes.data || []);

      // Fetch available products for this milkman
      const ROOT_URL = BASE_URL.replace('/api', '');
      const prodRes = await axios.get(`${ROOT_URL}/product/list`);
      setProducts((prodRes.data || []).filter(p => p.milkmanMobile === milkmanMobile || !p.milkmanMobile));
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [customer.id, milkmanMobile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Check if an entry exists for the selected date
    const existingEntry = entries.find(e => e.date === date);
    if (existingEntry) {
      setMorning(existingEntry.morning || '');
      setEvening(existingEntry.evening || '');
      setExistingEntryId(existingEntry.id);
    } else {
      setMorning('');
      setEvening('');
      setExistingEntryId(null);
    }
  }, [date, entries]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMilkSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const mornVal = parseFloat(morning || 0);
    const eveVal = parseFloat(evening || 0);
    const total = mornVal + eveVal;

    try {
      if (existingEntryId) {
        // Edit Mode
        await axios.put(`${BASE_URL}/milk/update/${existingEntryId}`, {
          morning: mornVal,
          evening: eveVal,
          total: total,
          edited: true
        });
        showNotification("Milk entry updated successfully!");
      } else {
        // Add Mode
        await axios.post(`${BASE_URL}/milk/add/${customer.id}`, {
          date: date,
          morning: mornVal,
          evening: eveVal,
          total: total,
          price: globalPrice
        });
        showNotification("New milk entry saved!");
      }
      
      // Refresh entries
const entriesRes = await axios.get(`${BASE_URL}/milk/${customer.id}`);
      setEntries(entriesRes.data || []);
      
    } catch (err) {
      console.error(err);
      showNotification("Failed to save milk data.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!existingEntryId) return;
    if (window.confirm("Are you sure you want to delete this milk entry? This cannot be undone.")) {
      setSaving(true);
      try {
        await axios.delete(`${BASE_URL}/milk/delete/${existingEntryId}`);
        showNotification("Milk entry deleted successfully!");
        setMorning('');
        setEvening('');
        setExistingEntryId(null);
        
        // Refresh entries
        const entriesRes = await axios.get(`${BASE_URL}/milk/${customer.id}`);
        setEntries(entriesRes.data || []);
      } catch (err) {
        console.error(err);
        showNotification("Failed to delete entry.", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRegularEntry = async () => {
    setSaving(true);
    try {
      if (existingEntryId) {
        await axios.put(`${BASE_URL}/milk/update/${existingEntryId}`, {
          morning: 0,
          evening: 0,
          total: 0,
          edited: true
        });
        showNotification("Today's entry already exists and has been refreshed.");
      } else {
        await axios.post(`${BASE_URL}/milk/regular/${customer.id}`);
        showNotification("Regular entry added successfully!");
      }
      
      // Refresh entries
      const entriesRes = await axios.get(`${BASE_URL}/milk/${customer.id}`);
      setEntries(entriesRes.data || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to add regular entry.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleOrder = async (product) => {
    const qty = quantities[product.id] || 1;
    setOrderLoading(product.id);
    try {
      const ROOT_URL = BASE_URL.replace('/api', '');
      await axios.post(`${ROOT_URL}/order/place`, {
        productId: product.id,
        customerMobile: customer.mobile,
        quantity: qty,
        total: product.price * qty,
        status: 'PENDING'
      });
      showNotification(`Order placed for ${qty}x ${product.name}!`);
      setQuantities(prev => ({ ...prev, [product.id]: 1 })); // Reset qty
    } catch (err) {
      showNotification("Failed to place order.", "error");
    } finally {
      setOrderLoading(null);
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
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={onBack}>
          <ArrowLeft size={20}/>
        </button>
        <button className="btn btn-black rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={onViewBill}>
          <FileText size={16}/> View Final Bill
        </button>
      </div>

      {/* Header Info */}
      <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 p-4">
        <div className="d-flex align-items-center gap-3">
          <div className="avatar-small-text bg-primary text-white fs-4" style={{width: '60px', height: '60px'}}>
            {customer.name.charAt(0)}
          </div>
          <div>
            <h4 className="fw-bold mb-1">{customer.name}</h4>
            <p className="text-muted mb-0">{customer.mobile} | {customer.address}</p>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`alert ${notification.type === 'error' ? 'alert-danger' : 'alert-success'} border-0 rounded-3 d-flex align-items-center gap-2 mb-4`}>
          {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
          <span className="fw-bold">{notification.msg}</span>
        </div>
      )}

      <div className="row g-4">
        {/* MILK ENTRY SECTION */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2">
                <Droplet size={20} className="text-primary"/> Daily Milk Log
              </span>
              <button 
                className="btn btn-outline-success btn-sm rounded-pill fw-bold shadow-sm" 
                onClick={handleRegularEntry}
                disabled={saving}
              >
                + Add Regular
              </button>
            </h5>
            
            <form onSubmit={handleMilkSubmit}>
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <label className="form-label fw-bold small text-muted text-uppercase mb-2 d-block">Select Date</label>
                <div className="input-group-modern border-bottom-0 pb-0">
                  <CalendarIcon size={18} className="text-primary" />
                  <input 
                    type="date" 
                    className="form-control bg-transparent border-0 fw-bold fs-5" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    required
                  />
                </div>
              </div>

              {existingEntryId && (
                <div className="alert alert-warning border-0 small py-2 mb-4 d-flex align-items-center gap-2">
                  <Edit3 size={16}/> Data already exists for this date. Submitting will update it.
                </div>
              )}

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label fw-bold small text-muted text-uppercase">Morning (L)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    className="form-control-modern text-center fs-4 bg-light rounded-3 px-2 border-0" 
                    placeholder="0.0"
                    value={morning}
                    onChange={(e) => setMorning(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold small text-muted text-uppercase">Evening (L)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    className="form-control-modern text-center fs-4 bg-light rounded-3 px-2 border-0" 
                    placeholder="0.0"
                    value={evening}
                    onChange={(e) => setEvening(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className={`btn flex-grow-1 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 ${existingEntryId ? 'btn-warning text-dark' : 'btn-primary'}`}
                  disabled={saving}
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : (existingEntryId ? <Edit3 size={20}/> : <Save size={20}/>)}
                  {saving ? 'Processing...' : (existingEntryId ? 'Update Entry' : 'Save Entry')}
                </button>
                
                {existingEntryId && (
                  <button 
                    type="button" 
                    className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                    onClick={handleDeleteEntry}
                    disabled={saving}
                    title="Delete Entry"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* PRODUCT PURCHASE SECTION */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Package size={20} className="text-success"/> Add Products to Bill
            </h5>

            {products.length === 0 ? (
              <div className="text-center p-5 opacity-50">
                <Package size={40} className="mx-auto mb-3 text-muted"/>
                <p className="fw-bold">No products available to sell.</p>
              </div>
            ) : (
              <div className="row g-3">
                {products.map(p => (
                  <div key={p.id} className="col-md-6">
                    <div className="product-card-mini p-3 border rounded-4 bg-light d-flex flex-column h-100">
                      <div className="d-flex gap-3 align-items-center mb-3">
                        <img 
                          src={p.imagePath ? `http://localhost:1010${p.imagePath}` : 'https://placehold.co/100?text=Item'} 
                          className="rounded-3" 
                          style={{width: '60px', height: '60px', objectFit: 'cover'}} 
                          alt={p.name}
                        />
                        <div>
                          <h6 className="fw-bold mb-0">{p.name}</h6>
                          <div className="text-primary fw-bold">₹{p.price}</div>
                        </div>
                      </div>
                      
                      <div className="mt-auto d-flex align-items-center justify-content-between gap-2">
                        <div className="d-flex align-items-center bg-white rounded-pill px-2 py-1 border shadow-sm">
                          <button className="btn btn-sm btn-link text-dark p-0 text-decoration-none" onClick={() => updateQuantity(p.id, -1)}><Minus size={14}/></button>
                          <span className="fw-bold px-3 small">{quantities[p.id] || 1}</span>
                          <button className="btn btn-sm btn-link text-dark p-0 text-decoration-none" onClick={() => updateQuantity(p.id, 1)}><Plus size={14}/></button>
                        </div>
                        <button 
                          className="btn btn-black btn-sm rounded-pill flex-grow-1 fw-bold"
                          onClick={() => handleOrder(p)}
                          disabled={orderLoading === p.id}
                        >
                          {orderLoading === p.id ? <Loader2 size={16} className="animate-spin mx-auto"/> : <><ShoppingCart size={14} className="me-1"/> Add</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEntry;
