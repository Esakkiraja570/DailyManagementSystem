import React, { useState } from 'react';
import { Package, Plus, Minus, ShoppingBag, Star, ChevronLeft } from 'lucide-react';

/**
 * Productview Component
 * 
 * Props:
 *  - product     : object  — product details { id, name, price, stock, image, specialMessage }
 *  - onOrder     : fn(product, qty) — called when customer places an order
 *  - onBack      : fn()            — called to go back to shop list
 */
const Productview = ({ product, onOrder, onBack }) => {
  const [qty, setQty] = useState(1);
  const [ordered, setOrdered] = useState(false);

  if (!product) return (
    <div className="text-center py-5 text-muted">
      <Package size={48} className="opacity-25 mb-3" />
      <p>No product selected.</p>
    </div>
  );

  const handleOrder = () => {
    if (onOrder) onOrder(product, qty);
    setOrdered(true);
    setTimeout(() => setOrdered(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      {onBack && (
        <button className="btn btn-link text-muted p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none fw-bold" onClick={onBack}>
          <ChevronLeft size={18} /> Back to Shop
        </button>
      )}

      <div className="row g-4">
        {/* Product Image */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white" style={{ height: 320 }}>
            {product.image
              ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                  <Package size={80} className="opacity-15" />
                </div>
            }
          </div>

          {/* Stock badge */}
          <div className="d-flex align-items-center justify-content-between mt-3 px-1">
            <span className={`badge-active px-3 py-1 ${product.stock <= 5 ? 'bg-warning text-dark' : ''}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </span>
            {product.promoted && (
              <span className="d-flex align-items-center gap-1 text-warning fw-bold small">
                <Star size={14} fill="currentColor" /> Featured
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h2 className="fw-bold mb-1">{product.name}</h2>
            {product.specialMessage && (
              <p className="text-success small fw-bold mb-3">{product.specialMessage}</p>
            )}

            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="fw-bold text-primary" style={{ fontSize: '2rem' }}>₹{product.price}</span>
              <span className="text-muted small">per unit</span>
            </div>

            <div className="border-top border-bottom py-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold text-uppercase">Availability</span>
                <span className={`fw-bold small ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Unavailable'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold text-uppercase">Total</span>
                <span className="fw-bold small">₹{(product.price * qty).toFixed(2)}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="d-flex align-items-center gap-4 mb-5">
              <span className="fw-bold small text-muted text-uppercase">Quantity</span>
              <div className="d-flex align-items-center gap-3 bg-light rounded-pill px-4 py-2">
                <button
                  className="btn btn-sm border-0 bg-transparent p-0"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="fw-bold" style={{ minWidth: 28, textAlign: 'center' }}>{qty}</span>
                <button
                  className="btn btn-sm border-0 bg-transparent p-0"
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Order Button */}
            <button
              className={`btn w-100 py-3 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 ${ordered ? 'btn-success' : 'btn-black'}`}
              onClick={handleOrder}
              disabled={product.stock === 0 || ordered}
            >
              <ShoppingBag size={18} />
              {ordered ? 'Order Placed! ✅' : `Order Now — ₹${(product.price * qty).toFixed(2)}`}
            </button>

            {ordered && (
              <p className="text-success text-center small mt-2 fw-bold">
                ✅ Your order has been placed successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productview;
