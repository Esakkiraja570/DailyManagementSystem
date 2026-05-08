import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

const colors = {
  success: { bg: '#10b981', color: '#fff' },
  error:   { bg: '#ef4444', color: '#fff' },
  warning: { bg: '#f59e0b', color: '#1a1a1a' },
  info:    { bg: '#2563eb', color: '#fff' },
};

export const Toast = ({ toast, onClose }) => {
  // Logic: Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;
  const c = colors[toast.type] || colors.info;

  return (
    <div 
      role="alert"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        background: c.bg, color: c.color,
        padding: '14px 20px', borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,.2)',
        animation: 'fadeInUp .35s ease', minWidth: 260, maxWidth: 380,
        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
      }}
    >
      {icons[toast.type]}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button 
        onClick={onClose} 
        aria-label="Close"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, opacity: .8, display: 'flex' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const Modal = ({ open, onClose, title, children, maxWidth = 520 }) => {
  // Logic: Handle Escape Key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Logic: Body Scroll Lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  if (!open) return null;

  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        role="dialog"
        aria-modal="true"
        style={{
          background: '#fff', borderRadius: 20,
          width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          animation: 'scaleIn .3s ease',
        }}
      >
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h5 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h5>
          <button 
            onClick={onClose} 
            aria-label="Close modal"
            style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '16px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, danger }) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
    <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>{message}</p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button 
        onClick={onClose} 
        style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
      >
        Cancel
      </button>
      <button 
        onClick={() => { onConfirm(); onClose(); }} 
        style={{
          padding: '9px 20px', borderRadius: 9, border: 'none',
          background: danger ? '#ef4444' : '#2563eb', color: '#fff',
          cursor: 'pointer', fontWeight: 600,
        }}
      >
        {danger ? 'Delete' : 'Confirm'}
      </button>
    </div>
  </Modal>
);

// Improved keyframe injection logic
if (typeof document !== 'undefined' && !document.head.querySelector('#ss-ui-styles')) {
  const style = document.createElement('style');
  style.id = 'ss-ui-styles';
  style.textContent = `
    @keyframes fadeInUp { 
      from { opacity:0; transform:translateY(20px); } 
      to { opacity:1; transform:translateY(0); } 
    }
    @keyframes scaleIn  { 
      from { opacity:0; transform:scale(.93); } 
      to { opacity:1; transform:scale(1); } 
    }
  `;
  document.head.appendChild(style);
}