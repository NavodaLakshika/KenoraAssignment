import React, { useEffect } from 'react';
import { AlertTriangle, LogOut, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Please Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger' | 'warning'
  icon,
  submitting = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return <LogOut size={20} color="#dc2626" />;
      case 'warning':
        return <AlertTriangle size={20} color="#d97706" />;
      default:
        return <CheckCircle2 size={20} color="#2563eb" />;
    }
  };

  const getIconWrapperClass = () => {
    switch (variant) {
      case 'danger':
        return 'confirm-icon-danger';
      case 'warning':
        return 'confirm-icon-warning';
      default:
        return 'confirm-icon-primary';
    }
  };

  const getConfirmBtnClass = () => {
    switch (variant) {
      case 'danger':
        return 'btn btn-danger';
      case 'warning':
        return 'btn btn-primary';
      default:
        return 'btn btn-primary';
    }
  };

  return (
    <div className="modal-backdrop confirm-modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content confirm-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, borderRadius: '5px' }}
      >
        <div className="confirm-modal-layout">
          {/* Icon Badge */}
          <div className={`confirm-icon-wrapper ${getIconWrapperClass()}`} style={{ borderRadius: '5px' }}>
            {renderIcon()}
          </div>

          {/* Title & Message Content */}
          <div className="confirm-modal-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <h3 className="confirm-modal-title">{title}</h3>
              <button 
                type="button" 
                className="confirm-modal-close-btn"
                style={{ borderRadius: '5px' }}
                onClick={onClose}
                disabled={submitting}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="confirm-modal-message">
              {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="confirm-modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ minWidth: '80px', borderRadius: '5px' }}
            onClick={onClose}
            disabled={submitting}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`${getConfirmBtnClass()} btn-sm`}
            style={{ minWidth: '100px', borderRadius: '5px' }}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

