import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useShop();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className={`toast-notification ${toast.type}`}>
      <div className="toast-icon">
        {isError ? (
          <AlertCircle size={18} />
        ) : isInfo ? (
          <Info size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
