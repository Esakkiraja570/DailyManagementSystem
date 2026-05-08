import React, { useState } from 'react';
import { Users, Search, Share2 } from 'lucide-react';

const loyaltyStyle = (level) => {
  const lvl = (level || '').toLowerCase();
  if (lvl === 'gold')   return { bg: '#fef9c3', color: '#854d0e', label: '🥇 Gold' };
  if (lvl === 'silver') return { bg: '#f1f5f9', color: '#475569', label: '🥈 Silver' };
  return                         { bg: '#fef3e2', color: '#92400e', label: '🥉 Bronze' };
};

const CustomerManager = ({ customers = [], shopId }) => {
  const [search, setSearch] = useState('');

  // ── Logic Improvements: Filtering ───────────────────────────
  const filtered = customers.filter(c => {
    const nameMatch = (c.name || '').toLowerCase().includes(search.toLowerCase());
    const phoneMatch = (c.phone || '').includes(search);
    return nameMatch || phoneMatch;
  });

  const shareLink = (c) => {
    if (!c.phone) return;
    // Strip non-numeric characters from phone
    const cleanPhone = c.phone.replace(/\D/g, '');
    const url = `${window.location.origin}/smallshop/customer?shopId=${shopId}`;
    const msg = `Hi ${c.name || 'there'}! View your bills & exclusive offers at our store here: ${url}`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Logic Improvements: Pre-calculating Stats ────────────────
  const totalRevenue = customers.reduce((s, c) => s + (parseFloat(c.totalPurchase) || 0), 0);
  
  const stats = customers.reduce((acc, c) => {
    const lvl = (c.purchaseLevel || 'bronze').toLowerCase();
    if (lvl === 'gold') acc.gold++;
    else if (lvl === 'silver') acc.silver++;
    else acc.bronze++;
    return acc;
  }, { gold: 0, silver: 0, bronze: 0 });

  return (
    <div className="ss-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Customers</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>{customers.length} registered • ₹{totalRevenue.toLocaleString('en-IN')} total revenue</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone..." style={{ paddingLeft: 36, height: 40, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', width: 220 }} />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          ['Gold Members',   stats.gold,   '#fef9c3', '#854d0e'],
          ['Silver Members', stats.silver, '#f1f5f9', '#475569'],
          ['Bronze Members', stats.bronze, '#fef3e2', '#92400e'],
        ].map(([label, val, bg, color]) => (
          <div key={label} style={{ background: bg, borderRadius: 12, padding: 16, border: `1px solid ${color}30` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color, opacity: .8 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['CUSTOMER','MOBILE','VISITS','TOTAL SPENT','LOYALTY','ACTION'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => {
              const ly = loyaltyStyle(c.purchaseLevel);
              const spent = parseFloat(c.totalPurchase) || 0;
              return (
                <tr key={c.id || c._id || idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(c.name || 'W').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name || 'Walk-in'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#64748b' }}>{c.phone || '—'}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14 }}>{c.visitCount || 0}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981', fontSize: 14 }}>₹{spent.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: ly.bg, color: ly.color }}>{ly.label}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.phone && (
                      <button onClick={() => shareLink(c)} title="Send WhatsApp" style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', border: 'none', color: '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Share2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                <Users size={36} style={{ marginBottom: 8, opacity: .4 }} /><br/>No customers found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerManager;