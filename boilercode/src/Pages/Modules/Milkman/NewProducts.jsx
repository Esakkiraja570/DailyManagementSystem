import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Plus, Image as ImageIcon, Trash2, 
  Zap, ZapOff, CheckCircle, XCircle, Loader2, 
  ArrowLeft, Tag, ShoppingBag, MessageSquare
} from 'lucide-react';
import './Dashboard.css';

const NewProducts = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    specialMessage: '',
    imageFile: null
  });
  const [preview, setPreview] = useState(null);

  const milkmanMobile = localStorage.getItem("mobile");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:1010/api/product/milkman/${milkmanMobile}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description);
    data.append('specialMessage', formData.specialMessage);
    if (formData.imageFile) {
      data.append('imageFile', formData.imageFile);
    }

    try {
      await axios.post(`http://localhost:1010/api/product/add/${milkmanMobile}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowAddForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert("Failed to add product.");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', description: '', specialMessage: '', imageFile: null });
    setPreview(null);
  };

  const toggleStatus = async (id, field) => {
    try {
      // Assuming backend has endpoints like /toggle-promote/{id} and /toggle-availability/{id}
      // or a generic update endpoint
      await axios.put(`http://localhost:1010/api/product/toggle-${field}/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="products-manager animate-fade-in">
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light rounded-circle p-2" onClick={onBack}><ArrowLeft size={20}/></button>
          <div>
            <h3 className="fw-bold mb-0">Product Inventory</h3>
            <p className="text-muted small mb-0">Manage items available for your customers</p>
          </div>
        </div>
        <button 
          className="btn btn-black rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18}/> Add Product
        </button>
      </header>

      {showAddForm && (
        <div className="custom-modal-overlay">
          <div className="custom-modal glass rounded-4 p-5 bg-white shadow-2xl animate-scale-up" style={{maxWidth: '600px', width: '90%'}}>
            <h4 className="fw-bold mb-4 text-center">Create New Product</h4>
            <form onSubmit={handleAddProduct}>
              <div className="row g-4">
                <div className="col-md-5">
                  <div className="image-upload-area" onClick={() => document.getElementById('product-img').click()}>
                    {preview ? (
                      <img src={preview} alt="Preview" className="img-fluid rounded-3" />
                    ) : (
                      <div className="d-flex flex-column align-items-center opacity-50">
                        <ImageIcon size={40} />
                        <span className="extra-small fw-bold mt-2">UPLOAD PHOTO</span>
                      </div>
                    )}
                    <input type="file" id="product-img" hidden onChange={handleImageChange} accept="image/*" />
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <label>Product Name (e.g. Fresh Curd)</label>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="form-floating">
                        <input type="number" className="form-control" placeholder="Price" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        <label>Price (₹)</label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-floating">
                        <input type="number" className="form-control" placeholder="Stock" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                        <label>Stock (Qty)</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-floating mb-3">
                    <textarea className="form-control" placeholder="Description" style={{height: '100px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    <label>Description (Details, Weight, etc.)</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input type="text" className="form-control" placeholder="Special" value={formData.specialMessage} onChange={e => setFormData({...formData, specialMessage: e.target.value})} />
                    <label>Special Message (e.g. 10% Off today!)</label>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light flex-grow-1 py-3 rounded-3 fw-bold" onClick={() => setShowAddForm(false)}>Discard</button>
                <button type="submit" className="btn btn-primary flex-grow-1 py-3 rounded-3 fw-bold shadow-lg" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Launch Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center p-5"><Loader2 className="animate-spin text-primary" size={40}/></div>
      ) : (
        <div className="row g-4">
          {products.map(p => (
            <div key={p.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="product-card-pro bg-white rounded-4 border overflow-hidden shadow-sm hover-shadow transition-all">
                <div className="position-relative">
                  <img src={p.imagePath ? `http://localhost:1010${p.imagePath}` : 'https://placehold.co/400x300?text=Product'} className="w-100" style={{height: '180px', objectFit: 'cover'}} alt={p.name} />
                  <div className={`status-pill-float ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {p.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}
                  </div>
                  {p.promoted && <div className="promoted-badge"><Zap size={12} fill="white" /> PROMOTED</div>}
                </div>
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0">{p.name}</h5>
                    <div className="text-primary fw-bold fs-5">₹{p.price}</div>
                  </div>
                  <p className="text-muted extra-small mb-3 line-clamp-2">{p.description}</p>
                  
                  {p.specialMessage && (
                    <div className="special-msg-box mb-4">
                      <MessageSquare size={14} className="text-primary" />
                      <span>{p.specialMessage}</span>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <button 
                      className={`btn btn-sm rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 ${p.promoted ? 'btn-outline-warning text-dark' : 'btn-warning'}`}
                      onClick={() => toggleStatus(p.id, 'promote')}
                    >
                      {p.promoted ? <ZapOff size={16}/> : <Zap size={16}/>}
                      {p.promoted ? 'Un-promote' : 'Promote to Customers'}
                    </button>
                    <button 
                      className={`btn btn-sm rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 ${p.stock > 0 ? 'btn-outline-danger' : 'btn-success text-white'}`}
                      onClick={() => toggleStatus(p.id, 'availability')}
                    >
                      {p.stock > 0 ? <XCircle size={16}/> : <CheckCircle size={16}/>}
                      {p.stock > 0 ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center p-5 opacity-25 col-12">
              <ShoppingBag size={60} className="mx-auto mb-3" />
              <p className="fw-bold">No products found. Start adding your dairy items!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewProducts;
