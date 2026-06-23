import React, { useState } from "react";

const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Подтвердить
          </button>
        </div>
      </div>

      <style>{`
        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .confirm-dialog {
          background: white;
          padding: 24px;
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .confirm-dialog h3 {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 600;
        }
        .confirm-dialog p {
          margin: 0 0 20px;
          color: #5C6675;
          line-height: 1.5;
        }
        .confirm-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn-cancel, .btn-confirm {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .btn-cancel {
          background: #F5F6F8;
          color: #101522;
        }
        .btn-cancel:hover {
          background: #E8EBEF;
        }
        .btn-confirm {
          background: #DC2626;
          color: white;
        }
        .btn-confirm:hover {
          background: #B91C1C;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
