import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL, getMilkmanMobile } from './milkmanApi';
import { 
  Package, Plus, Image as ImageIcon, Trash2, 
  Loader2, 
  ArrowLeft
} from 'lucide-react';
import './Dashboard.css';

const NewProducts = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    specialMessage: '',
    imageFile: null
  });

  const [preview, setPreview] = useState(null);

  const milkmanMobile = getMilkmanMobile();
  const ROOT_URL = BASE_URL.replace('/api', '');

  // ✅ FETCH PRODUCTS (SAFE)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ROOT_URL}/product/list`);

      // 🔥 FIX: safe filter (avoid null issue)
      const filtered = (res.data || []).filter(
        p => !p.milkmanMobile || p.milkmanMobile === milkmanMobile
      );

      setProducts(filtered);

    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [milkmanMobile, ROOT_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ IMAGE PREVIEW
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ ADD PRODUCT (MULTIPART FIX)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const form = new FormData();

      form.append("name", formData.name);
      form.append("price", Number(formData.price));
      form.append("stock", Number(formData.stock));
      form.append("description", formData.description);
      form.append("promoted", true);
      form.append("specialMessage", formData.specialMessage);
      form.append("milkmanMobile", milkmanMobile);

      if (formData.imageFile) {
        form.append("file", formData.imageFile);
      }

      await axios.post(`${ROOT_URL}/product/add`, form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setShowAddForm(false);
      resetForm();
      fetchProducts();

    } catch (err) {
      console.error(err);
      alert("Failed to add product ❌");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      description: '',
      specialMessage: '',
      imageFile: null
    });
    setPreview(null);
  };

  // ✅ PROMOTE / UNPROMOTE
  const toggleStatus = async (id) => {
    try {
      const currentProduct = products.find(p => p.id === id);
      const nextStatus = !currentProduct?.promoted;
      await axios.put(`${ROOT_URL}/product/promote/${id}?status=${nextStatus}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DELETE PRODUCT
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      setActionLoading(true);
      await axios.delete(`${ROOT_URL}/product/delete/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="products-manager animate-fade-in">
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light rounded-circle p-2" onClick={onBack}>
            <ArrowLeft size={20}/>
          </button>
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
                    <input type="text" className="form-control" required value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})} />
                    <label>Product Name</label>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="form-floating">
                        <input type="number" min="0" className="form-control" required value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})} />
                        <label>Price (₹)</label>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="form-floating">
                        <input type="number" min="0" className="form-control" required value={formData.stock}
                          onChange={e => setFormData({...formData, stock: e.target.value})} />
                        <label>Stock</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-floating mb-3">
                    <textarea className="form-control" style={{height: '100px'}}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    <label>Description</label>
                  </div>

                  <div className="form-floating mb-4">
                    <input type="text" className="form-control"
                      value={formData.specialMessage}
                      onChange={e => setFormData({...formData, specialMessage: e.target.value})} />
                    <label>Special Message</label>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light flex-grow-1 py-3"
                  onClick={() => setShowAddForm(false)}>Discard</button>

                <button type="submit" className="btn btn-primary flex-grow-1 py-3"
                  disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Launch Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center p-5">
          <Loader2 className="animate-spin text-primary" size={40}/>
        </div>
      ) : (
        <div className="row g-4">
          {products.length === 0 && !loading && (
            <div className="col-12 text-center py-5 opacity-25">
              <Package size={56} className="mb-3" />
              <p className="fw-bold">No products yet. Click "Add Product" to start.</p>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="product-card-pro bg-white rounded-4 border overflow-hidden shadow-sm h-100 d-flex flex-column">
                <div className="position-relative">
                  <img 
                    src={p.imagePath ? `${ROOT_URL}${p.imagePath}` : 'https://placehold.co/400x300?text=No+Image'} 
                    className="w-100" style={{height: '180px', objectFit: 'cover'}} alt={p.name}
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x300?text=No+Image'; }}
                  />
                  <div className={`status-pill-float ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'OUT OF STOCK'}
                  </div>
                  {p.promoted && <div className="promoted-badge">★ FEATURED</div>}
                </div>

                <div className="p-3 flex-grow-1 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="fw-bold mb-0">{p.name}</h6>
                    <span className="fw-bold text-primary">₹{p.price}</span>
                  </div>
                  <p className="text-muted small mb-1 flex-grow-1">{p.description || 'No description'}</p>
                  {p.specialMessage && (
                    <div className="alert alert-warning py-1 px-2 small mb-2 border-0 rounded-3">
                      📢 {p.specialMessage}
                    </div>
                  )}
                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className={`btn btn-sm flex-grow-1 rounded-pill fw-bold ${ p.promoted ? 'btn-warning text-dark' : 'btn-outline-primary' }`}
                      onClick={() => toggleStatus(p.id)}
                    >
                      {p.promoted ? 'Un-promote' : 'Promote'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => handleDelete(p.id, p.name)}
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewProducts;