import React, { useState } from 'react';
import { Search, Trash2, Loader2, MessageSquare, Printer, Plus, Minus } from 'lucide-react';
import { apiPost } from './smallshopApi';

const GST_RATE = 0.05; // 5% default

const BillingPOS = ({ shopId, products, refresh, shopProfile, toast }) => {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [bill, setBill] = useState(null);

  const filtered = products.filter(p =>
    (p.productName || '').toLowerCase().includes(search.toLowerCase()) && p.stock > 0
  );

  const addToCart = (p) => {
    const id = p.id || p._id;
    setCart(prev => {
      const existing = prev.find(i => i.productId === id);
      if (existing) {
        if (existing.quantity >= p.stock) { 
          toast?.warning('Maximum stock reached'); 
          return prev; 
        }
        return prev.map(i => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        productId: id, 
        productName: p.productName, 
        price: Number(p.price), 
        quantity: 1, 
        maxStock: p.stock 
      }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      // Logical check for bounds: minimum 1, maximum maxStock
      if (newQty > 0 && newQty <= i.maxStock) {
        return { ...i, quantity: newQty };
      } else if (newQty > i.maxStock) {
        toast?.warning('Stock limit reached');
      }
      return i;
    }));
  };

  const removeItem = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));

  // ── Calculation Logic ────────────────────────────────────────
  const subtotal   = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const discValue  = parseFloat(discount) || 0;
  const discAmt    = Math.min(discValue, subtotal);
  const afterDisc  = subtotal - discAmt;
  const gstAmt     = gstEnabled ? (afterDisc * GST_RATE) : 0;
  const total      = afterDisc + gstAmt;

  const handleCheckout = async () => {
    if (!cart.length) { toast?.warning('Cart is empty'); return; }
    if (customer.phone && customer.phone.length !== 10) { toast?.warning('Invalid phone number'); return; }
    
    setLoading(true);
    try {
      const payload = {
        customerName: customer.name.trim() || 'Walk-in',
        customerPhone: customer.phone,
        items: cart.map(i => ({ 
            productId: i.productId, 
            productName: i.productName, 
            price: Number(i.price), 
            quantity: Number(i.quantity) 
        })),
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discAmt.toFixed(2)),
        tax: Number(gstAmt.toFixed(2)),
        total: Number(total.toFixed(2)),
        shopId: shopId // Ensuring shopId is part of payload if needed
      };
      
      const res = await apiPost(`/${shopId}/bills`, payload);
      
      setBill({ 
        ...payload, 
        billNumber: res?.billNumber || res?.id || `BILL-${Date.now()}`, 
        date: new Date().toLocaleDateString('en-IN') 
      });
      
      setCart([]); 
      setDiscount(0);
      setCustomer({ name: '', phone: '' });
      toast?.success('Bill generated successfully!');
      if(refresh) refresh();
    } catch (err) {
      toast?.error(err.message || 'Failed to generate bill');
    } finally { setLoading(false); }
  };

  const handleWhatsApp = () => {
    if (!bill?.customerPhone) { toast?.warning('No customer phone'); return; }
    const storeUrl = `${window.location.origin}/smallshop/customer?shopId=${shopId}`;
    const itemLines = bill.items.map(i => `• ${i.productName} x${i.quantity} = ₹${(i.price * i.quantity).toFixed(0)}`).join('\n');
    
    const msg = [
      `🧾 *Bill from ${shopProfile?.shopName || 'Our Store'}*`,
      `Bill #: ${bill.billNumber}`,
      `Date: ${bill.date}`,
      `----------------------------`,
      itemLines,
      `----------------------------`,
      bill.discount > 0 ? `Discount: -₹${bill.discount.toFixed(0)}` : '',
      bill.tax > 0 ? `GST (5%): ₹${bill.tax.toFixed(0)}` : '',
      `*Total Amount: ₹${bill.total.toFixed(0)}*`,
      `----------------------------`,
      `📲 Pay Online: ${storeUrl}`,
      `Thank you! Visit again. 🙏`,
    ].filter(line => line !== '').join('\n');

    window.open(`https://wa.me/91${bill.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => window.print();

  // ── Bill Success Screen ──────────────────────────────────────
  if (bill) return (
    <div className="ss-fade-in" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div id="printable-bill" style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: 18, marginBottom: 18 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
          <h3 style={{ fontWeight: 800, marginBottom: 4 }}>{shopProfile?.shopName || 'Store'}</h3>
          <p style={{ color: '#64748b', fontSize: 13 }}>Bill #{bill.billNumber} • {bill.date}</p>
        </div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>Customer: {bill.customerName} {bill.customerPhone ? `(${bill.customerPhone})` : ''}</p>
        {bill.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
            <span>{it.productName} × {it.quantity}</span>
            <span style={{ fontWeight: 600 }}>₹{(it.price * it.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '2px solid #0f172a' }}>
          {bill.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: 14 }}><span>Discount</span><span>-₹{bill.discount.toFixed(0)}</span></div>}
          {bill.tax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 14 }}><span>GST (5%)</span><span>₹{bill.tax.toFixed(0)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20, marginTop: 8 }}>
            <span>Total</span><span style={{ color: '#2563eb' }}>₹{bill.total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        {bill.customerPhone && (
          <button onClick={handleWhatsApp} style={{ flex: 1, padding: '11px 0', background: '#25d366', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageSquare size={18} /> Send on WhatsApp
          </button>
        )}
        <button onClick={handlePrint} style={{ flex: 1, padding: '11px 0', background: '#f1f5f9', color: '#0f172a', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Printer size={18} /> Print
        </button>
      </div>
      <button onClick={() => setBill(null)} style={{ width: '100%', marginTop: 10, padding: '11px 0', background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
        Start New Bill
      </button>
    </div>
  );

  // ── POS Layout ──────────────────────────────────────────────
  return (
    <div className="ss-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
      {/* Products */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div><h3 style={{ fontWeight: 800, marginBottom: 2 }}>Point of Sale</h3><p style={{ color: '#64748b', fontSize: 13 }}>Tap a product to add to cart</p></div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ paddingLeft: 36, height: 40, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', width: 220 }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id || p._id} onClick={() => addToCart(p)} style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#0f172a' }}>{p.productName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#2563eb', fontWeight: 800, fontSize: 15 }}>₹{p.price}</span>
                <span style={{ fontSize: 11, color: p.stock < 10 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{p.stock} left</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No products found.</p>}
        </div>
      </div>

      {/* Cart */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: 0 }}>
        <h5 style={{ fontWeight: 800, marginBottom: 16 }}>Current Bill</h5>
        <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={customer.name} onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))} placeholder="Customer Name (optional)" style={{ height: 40, padding: '0 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
          <input value={customer.phone} onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))} placeholder="Mobile (for WhatsApp bill)" style={{ height: 40, padding: '0 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} maxLength={10} />
        </div>

        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 14 }}>
          {cart.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>Cart is empty</p>}
          {cart.map(item => (
            <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 9, padding: '8px 10px', marginBottom: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</div>
                <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(0)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button onClick={() => updateQty(item.productId, -1)} style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={13} /></button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, 1)} style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={13} /></button>
                <button onClick={() => removeItem(item.productId)} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Discount & GST */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Discount (₹)</label>
            <input type="number" min={0} value={discount} onChange={e => setDiscount(Math.max(0, e.target.value))} style={{ height: 38, padding: '0 10px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, width: '100%', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>GST 5%</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Apply</span>
            </label>
          </div>
        </div>

        {/* Totals */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginBottom: 14, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#64748b' }}><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
          {discAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#10b981' }}><span>Discount</span><span>-₹{discAmt.toFixed(0)}</span></div>}
          {gstAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#64748b' }}><span>GST (5%)</span><span>₹{gstAmt.toFixed(0)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, marginTop: 8 }}>
            <span>Total</span><span style={{ color: '#2563eb' }}>₹{total.toFixed(0)}</span>
          </div>
        </div>

        <button onClick={handleCheckout} disabled={loading || !cart.length} style={{
          width: '100%', padding: '13px 0', borderRadius: 11,
          background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff',
          border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: (!cart.length || loading) ? .55 : 1,
        }}>
          {loading ? <Loader2 size={18} className="ss-spin" /> : '🧾 Generate Bill'}
        </button>
      </div>
    </div>
  );
};

export default BillingPOS;