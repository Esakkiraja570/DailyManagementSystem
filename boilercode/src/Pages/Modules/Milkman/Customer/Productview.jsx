import React, { useState } from 'react';
import { Package, Plus, Minus, ShoppingBag, Star, ChevronLeft, Loader2 } from 'lucide-react';

/**
 * Productview Component
 * 
 * Props:
 *  - product     : object  — { id, name, price, stock, image, specialMessage, promoted }
 *  - onOrder     : fn(product, qty) — Async function to place order
 *  - onBack      : fn()             — Function to return to the shop list
 */
const Productview = ({ product, onOrder, onBack }) => {
  const [qty, setQty] = useState(1);
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!product) return (
    <div className="text-center py-5 text-muted">
      <Package size={48} className="opacity-25 mb-3" />
      <p>No product selected.</p>
    </div>
  );

  const handleOrder = async () => {
    // 1. Validation Logic
    if (product.stock === 0) {
      alert('This item is currently out of stock ❌');
      return;
    }

    if (qty > product.stock) {
      alert(`Only ${product.stock} units available ❌`);
      return;
    }

    try {
      setLoading(true);

      // 2. Execute Order (Parent API Call)
      if (onOrder) {
        await onOrder(product, qty);
      }

      // 3. Success State
      setOrdered(true);
      setQty(1); // Reset quantity for next time

      // 4. Reset success feedback after 3 seconds
      setTimeout(() => setOrdered(false), 3000);

    } catch (err) {
      console.error("Order process error:", err);
      alert('Could not place order. Please try again later. ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Back navigation */}
      {onBack && (
        <button
          className="btn btn-link text-muted p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none fw-bold"
          onClick={onBack}
        >
          <ChevronLeft size={18} /> Back to Storefront
        </button>
      )}

      <div className="row g-4">
        {/* Left Column: Product Image & Stock Status */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white" style={{ height: 350 }}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                <Package size={80} className="opacity-15" />
              </div>
            )}
          </div>

          <div className="d-flex align-items-center justify-content-between mt-3 px-1">
            <span className={`badge px-3 py-2 rounded-pill fw-bold ${product.stock <= 5 && product.stock > 0 ? 'bg-warning text-dark' : product.stock === 0 ? 'bg-danger text-white' : 'bg-light text-dark'}`}>
              {product.stock > 0 ? `${product.stock} units left` : 'Out of Stock'}
            </span>

            {product.promoted && (
              <span className="d-flex align-items-center gap-1 text-warning fw-bold small">
                <Star size={14} fill="currentColor" /> Best Seller
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Details & Pricing */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <div className="mb-4">
              <h2 className="fw-bold mb-1">{product.name}</h2>
              {product.specialMessage ? (
                <p className="text-success small fw-bold mb-0">{product.specialMessage}</p>
              ) : (
                <p className="text-muted small mb-0">Pure and Fresh Quality Guaranteed</p>
              )}
            </div>

            <div className="d-flex align-items-baseline gap-2 mb-4">
              <span className="fw-bold text-primary" style={{ fontSize: '2.5rem' }}>
                ₹{product.price}
              </span>
              <span className="text-muted fw-bold">/ unit</span>
            </div>

            {/* Summary Table */}
            <div className="border-top border-bottom py-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold text-uppercase">Availability</span>
                <span className={`fw-bold small ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                  {product.stock > 0 ? 'Ready to Ship' : 'Unavailable'}
                </span>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold text-uppercase">Subtotal</span>
                <span className="fw-bold fs-5">
                  ₹{(product.price * qty).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quantity Controller */}
            <div className="d-flex align-items-center gap-4 mb-5">
              <span className="fw-bold small text-muted text-uppercase">Select Quantity</span>

              <div className="d-flex align-items-center gap-3 bg-light rounded-pill px-4 py-2 border">
                <button
                  className="btn btn-sm border-0 p-0 text-muted"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1 || loading || ordered}
                >
                  <Minus size={18} />
                </button>

                <span className="fw-bold px-2" style={{ minWidth: 35, textAlign: 'center', fontSize: '1.1rem' }}>
                  {qty}
                </span>

                <button
                  className="btn btn-sm border-0 p-0 text-muted"
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock || loading || ordered}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
              <button
                className={`btn w-100 py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all ${
                  ordered ? 'btn-success scale-up' : 'btn-black'
                }`}
                onClick={handleOrder}
                disabled={product.stock === 0 || ordered || loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing Order...
                  </>
                ) : ordered ? (
                  <>
                    Order Placed! ✅
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Place Order — ₹{(product.price * qty).toFixed(2)}
                  </>
                )}
              </button>

              {ordered && (
                <div className="alert alert-success border-0 rounded-4 mt-3 py-2 text-center small fw-bold animate-fade-in">
                  Transaction successful! Check "My Orders" for tracking.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productview;