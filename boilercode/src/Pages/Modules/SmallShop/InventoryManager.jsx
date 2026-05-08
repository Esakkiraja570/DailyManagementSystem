import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, Package, Upload, Image as ImageIcon } from 'lucide-react';
import { apiPost, apiPut, apiDelete } from './smallshopApi';
import { ConfirmDialog } from './ShopUI';

const EMPTY = { productName: '', price: '', stock: '', category: '', imageUrl: '' };

const InventoryManager = ({ shopId, products = [], refresh, toast }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  // Logic: Extract unique, non-empty categories and trim them
  const categories = [...new Set(products.map(p => p.category?.trim()).filter(Boolean))];

  const filtered = products.filter(p => {
    if (filter === 'low') return p.stock < 10 && p.stock > 0;
    if (filter === 'out') return p.stock <= 0;
    if (filter !== 'all') return p.category === filter;
    return true;
  });

  const openAdd = () => { 
    setForm(EMPTY); 
    setEditingId(null); 
    setShowForm(true); 
  };

  const openEdit = (p) => { 
    setForm({ 
      productName: p.productName || '', 
      price: p.price || '', 
      stock: p.stock || '', 
      category: p.category || '', 
      imageUrl: p.imageUrl || '' 
    }); 
    setEditingId(p.id || p._id); 
    setShowForm(true); 
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { 
      toast?.warning('Image too large (>2MB)'); 
      return; 
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation Logic
    if (!form.productName.trim() || form.price === '' || form.stock === '') { 
      toast?.warning('Please fill all required fields'); 
      return; 
    }

    const payload = {
        ...form,
        productName: form.productName.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stock: Number(form.stock)
    };

    setLoading(true);
    try {
      if (editingId) {
        await apiPut(`/${shopId}/products/${editingId}`, payload);
        toast?.success('Product updated successfully');
      } else {
        await apiPost(`/${shopId}/products`, payload);
        toast?.success('New product added');
      }
      setShowForm(false); 
      setEditingId(null); 
      setForm(EMPTY);
      if(refresh) refresh();
    } catch (err) { 
      toast?.error(err.message || 'Operation failed'); 
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/${shopId}/products/${deleteTarget}`);
      toast?.success('Product removed');
      if(refresh) refresh();
    } catch (err) { 
      toast?.error(err.message || 'Failed to delete'); 
    } finally {
      setDeleteTarget(null);
    }
  };

  const lowCount = products.filter(p => p.stock < 10 && p.stock > 0).length;
  const outCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="ss-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Inventory</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>{products.length} products • {lowCount} low stock • {outCount} out of stock</p>
        </div>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Alerts */}
      {(lowCount > 0 || outCount > 0) && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#854d0e' }}>
            {outCount > 0 && `${outCount} items out of stock. `}{lowCount > 0 && `${lowCount} items running low.`}
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['low', '⚠ Low Stock'], ['out', '🚫 Out of Stock'], ...categories.map(c => [c, c])].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: filter === val ? '#2563eb' : '#f1f5f9',
            color: filter === val ? '#fff' : '#64748b',
          }}>{label}</button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,.06)' }}>
          <h5 style={{ fontWeight: 700, marginBottom: 16 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h5>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[['productName','Product Name *','text'],['category','Category *','text'],['price','Price (₹) *','number'],['stock','Stock *','number']].map(([key,label,type]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Product Image</label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, border: '2px dashed #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: form.imageUrl ? `url(${form.imageUrl}) center/cover` : '#f8fafc',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  overflow: 'hidden', flexShrink: 0
                }}>
                  {!form.imageUrl && <ImageIcon size={24} color="#cbd5e1" />}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="Paste image URL..."
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', marginBottom: 8 }} />
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px',
                    borderRadius: 8, background: '#f1f5f9', color: '#475569', fontSize: 12,
                    fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                  }}>
                    <Upload size={14} /> Choose Local File
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      style={{ marginLeft: 10, border: 'none', background: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ padding: '9px 24px', borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading ? <Loader2 size={16} className="ss-spin" /> : null}
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['PRODUCT','CATEGORY','PRICE','STOCK','STATUS','ACTIONS'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const id = p.id || p._id;
              // Stock bar logic: assuming 100 is "full" stock for visual scale
              const stockPct = Math.min(100, (Number(p.stock) / 100) * 100);
              return (
                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={18} color="#2563eb" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.productName}</div>
                        {p.imageUrl && <div style={{ fontSize: 10, color: '#2563eb', fontStyle: 'italic' }}>Image set</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{p.category || '—'}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>₹{p.price}</td>
                  <td style={{ padding: '14px 16px', minWidth: 100 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{p.stock} units</div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stockPct}%`, background: p.stock <= 0 ? '#ef4444' : p.stock < 10 ? '#f59e0b' : '#10b981', borderRadius: 3 }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.stock <= 0 ? '#fee2e2' : p.stock < 10 ? '#fef9c3' : '#dcfce7', color: p.stock <= 0 ? '#991b1b' : p.stock < 10 ? '#854d0e' : '#166534' }}>
                      {p.stock <= 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} title="Edit" style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(id)} title="Delete" style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                <Package size={36} style={{ marginBottom: 8, opacity: .4 }} /><br/>No products found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="This will permanently remove the product from your inventory."
        danger
      />
    </div>
  );
};

export default InventoryManager;