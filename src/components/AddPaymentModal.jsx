import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { getCurrentTime12h, getTodayIST, formatRupee } from '../utils/formatters';
import { X, Check, ArrowDownLeft, Calendar, Clock, CreditCard } from 'lucide-react';

const PAYMENT_MODES = [
  'പണം (Cash)',
  'GPay / UPI',
  'ബാങ്ക് (Bank Transfer)',
  'മറ്റ് (Other)'
];

export default function AddPaymentModal({ customer, isOpen, onClose }) {
  const { handleAddPayment, selectedDate, getCustomerBalance } = useShop();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate || getTodayIST());
  const [time, setTime] = useState(getCurrentTime12h());
  const [mode, setMode] = useState('പണം (Cash)');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef(null);
  const currentBalance = customer ? getCustomerBalance(customer.id) : 0;

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(selectedDate || getTodayIST());
      setTime(getCurrentTime12h());
      setMode('പണം (Cash)');
      setNote('');
      setIsSubmitting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const num = parseFloat(amount);
    if (!num || isNaN(num) || num <= 0) {
      inputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      const fullNote = note.trim() ? `${mode} - ${note.trim()}` : mode;
      await handleAddPayment({
        customerId: customer.id,
        customerName: customer.name,
        amount: num,
        date,
        time,
        note: fullNote
      });
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handlePayFullBalance = () => {
    if (currentBalance > 0) {
      setAmount(String(currentBalance));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-bottom-sheet payment-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-indicator"></div>

        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker payment-kicker">പണം വരവ് രേഖപ്പെടുത്തുക (Record Payment)</span>
            <h2 className="modal-customer-name">{customer.name}</h2>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="payment-balance-banner">
          <span className="balance-banner-label">നിലവിലെ ആകെ ബാക്കി തുക:</span>
          <span className="balance-banner-val">{formatRupee(currentBalance)}</span>
          {currentBalance > 0 && (
            <button 
              type="button" 
              className="pay-full-pill"
              onClick={handlePayFullBalance}
            >
              മുഴുവൻ തുക നൽകുക
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Amount input */}
          <div className="large-amount-input-group payment-input-group">
            <span className="input-currency-symbol">₹</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              className="large-amount-field"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              required
              min="1"
              step="any"
            />
          </div>

          {/* Payment Method Pills */}
          <div className="quick-tags-section">
            <span className="section-micro-label">പേയ്മെന്റ് രീതി (Method):</span>
            <div className="tag-chips-scroll">
              {PAYMENT_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`tag-chip ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                  disabled={isSubmitting}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="form-row">
            <input
              type="text"
              className="form-input-text"
              placeholder="കുറിപ്പ് (Optional Note, e.g. GPay Ref / Cash)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Date & Time */}
          <div className="form-meta-row">
            <div className="meta-field">
              <Calendar size={14} className="meta-icon" />
              <input
                type="date"
                className="meta-date-picker"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="meta-field">
              <Clock size={14} className="meta-icon" />
              <input
                type="text"
                className="meta-time-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="modal-actions-footer">
            <button
              type="submit"
              className="btn-submit-payment"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            >
              {isSubmitting ? (
                <span>വരവ് രേഖപ്പെടുത്തുന്നു...</span>
              ) : (
                <>
                  <Check size={20} strokeWidth={2.5} />
                  <span>വരവ് സേവ് ചെയ്യുക (Save Payment ₹{amount || '0'})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
