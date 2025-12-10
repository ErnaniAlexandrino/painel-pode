import React from 'react';

const Modal = ({ isOpen, onClose, message, type = 'error', title }) => {
  if (!isOpen) return null;

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Sucesso';
      case 'warning':
        return 'Atenção';
      case 'error':
      default:
        return 'Erro';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
      default:
        return '✕';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header modal-header-${type}`}>
          <span className="modal-icon">{getIcon()}</span>
          <span className="modal-title">{getTitle()}</span>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          <button className={`modal-btn modal-btn-${type}`} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

