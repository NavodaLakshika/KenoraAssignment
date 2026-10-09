import React from 'react';
import { AlertTriangle, LogOut, CheckCircle2, HelpCircle } from 'lucide-react';

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
  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return <LogOut size={26} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={26} className="text-amber-600" />;
      default:
        return <CheckCircle2 size={26} className="text-blue-600" />;
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
      >
        <div className="confirm-modal-body">
          <div className={`confirm-icon-wrapper ${getIconWrapperClass()}`}>
            {renderIcon()}
          </div>

          <h3 className="confirm-modal-title">{title}</h3>
          
          <div className="confirm-modal-message">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        <div className="confirm-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={getConfirmBtnClass()}
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
