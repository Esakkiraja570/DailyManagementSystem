import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Tag, Send, CalendarDays } from 'lucide-react';
import { apiPost, apiDelete } from './smallshopApi';
import { ConfirmDialog } from './ShopUI';

const EMPTY = { offerName: '', description: '', discount: '', minPurchase: '', validUntil: '', isActive: true };

const OfferManager = ({ shopId, offers = [], refresh, toast, customers = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation Logic
    if (!form.offerName.trim() || !form.discount || !form.validUntil) { 
      toast?.warning('Please fill all required fields'); 
      return; 
    }

    const payload = {
        ...form,
        offerName: form.offerName.trim(),
        description: form.description.trim(),
        discount: Number(form.discount),
        minPurchase: Number(form.minPurchase || 0)
    };

    setLoading(true);
    try {
      await apiPost(`/${shopId}/offers`, payload);
      toast?.success('Offer published successfully!');
      setForm(EMPTY); 
      setShowForm(false); 
      if(refresh) refresh();
    } catch (err) { 
      toast?.error(err.message || 'Failed to publish offer'); 
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/${shopId}/offers/${deleteTarget}`);
      toast?.success('Offer removed');
      if(refresh) refresh();
    } catch (err) { 
      toast?.error(err.message || 'Failed to delete offer'); 
    } finally {
      setDeleteTarget(null);
    }
  };

  const broadcastOffer = (offer) => {
    const phonedCustomers = customers.filter(c => c.phone);
    if (phonedCustomers.length === 0) { 
      toast?.warning('No customers with phone numbers found to broadcast'); 
      return; 
    }

    const storeUrl = `${window.location.origin}/smallshop/customer?shopId=${shopId}`;
    const msg = [
      `🎉 *SPECIAL OFFER from our Store!*`,
      `----------------------------`,
      `🎁 *${offer.offerName}*`,
      offer.description ? `_${offer.description}_` : '',
      `💰 *${offer.discount}% OFF*`,
      offer.minPurchase > 0 ? `(On orders above ₹${offer.minPurchase})` : '',
      `📅 Valid till: ${offer.validUntil}`,
      `----------------------------`,
      `🛒 Shop online here: ${storeUrl}`,
      `Visit us today! 🙏`
    ].filter(line => line !== '').join('\n');

    // Opens the WhatsApp "Send to..." dialog
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    toast?.success(`Broadcast link generated for ${phonedCustomers.length} customers!`);
  };

  const today = new Date().toISOString().split('T')[0];
  const activeOffers = offers.filter(o => !o.validUntil || o.validUntil >= today);
  const expiredOffers = offers.filter(o => o.validUntil && o.validUntil < today);

  const OfferCard = ({ o }) => (
    <div style={{
      background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
      borderRadius: 16, padding: 22, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,.08)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
        <button onClick={() => broadcastOffer(o)} title="Broadcast via WhatsApp" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={13} />
        </button>
        <button onClick={() => setDeleteTarget(o.id || o._id)} title="Delete" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,100,100,.3)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={13} />
        </button>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: .7, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <CalendarDays size={12} /> Valid till {o.validUntil}
      </div>
      <h4 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{o.offerName}</h4>
      {o.description && <p style={{ fontSize: 13, opacity: .85, marginBottom: 12 }}>{o.description}</p>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 900 }}>{o.discount}%</span>
        <span style={{ fontSize: 14, opacity: .8 }}>OFF{o.minPurchase ? ` · min ₹${o.minPurchase}` : ''}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Logic Improvement: Use isActive consistently with the form */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.isActive !== false ? '#4ade80' : '#ff8787' }} />
        <span style={{ fontSize: 11, fontWeight: 700, opacity: .8 }}>{o.isActive !== false ? 'LIVE' : 'PAUSED'}</span>
      </div>
    </div>
  );

  return (
    <div className="ss-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Offers & Promotions</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>{activeOffers.length} active • {expiredOffers.length} expired</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {showForm ? 'Cancel' : <><Plus size={18} /> New Offer</>}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h5 style={{ fontWeight: 700, marginBottom: 16 }}>Create Promotion</h5>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[['offerName','Offer Name *','text','e.g. Weekend Special'],['discount','Discount % *','number','e.g. 10'],['minPurchase','Min Purchase (₹)','number','0 for no minimum'],['validUntil','Valid Until *','date','']].map(([key,label,type,ph]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} required={label.includes('*')} value={form[key]} placeholder={ph} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Describe your offer..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ padding: '9px 24px', borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading ? <Loader2 size={16} className="ss-spin" /> : <Tag size={16} />} Publish
              </button>
            </div>
          </form>
        </div>
      )}

      {activeOffers.length > 0 && (
        <>
          <h5 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Active Offers</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 28 }}>
            {activeOffers.map(o => <OfferCard key={o.id || o._id} o={o} />)}
          </div>
        </>
      )}

      {expiredOffers.length > 0 && (
        <>
          <h5 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Expired</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, opacity: .5 }}>
            {expiredOffers.map(o => <OfferCard key={o.id || o._id} o={o} />)}
          </div>
        </>
      )}

      {offers.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <Tag size={40} style={{ marginBottom: 12, opacity: .4 }} />
          <p style={{ fontWeight: 600 }}>No offers yet. Create your first promotion!</p>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Offer" message="This offer will be permanently removed." danger />
    </div>
  );
};

export default OfferManager;