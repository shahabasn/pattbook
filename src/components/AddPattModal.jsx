import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { getCurrentTime12h, getTodayIST, formatRupee } from '../utils/formatters';
import { X, Check, Clock, Calendar, Plus, Sparkles } from 'lucide-react';

const QUICK_AMOUNTS = [10, 20, 25, 30, 45, 50, 80, 100];
const QUICK_TAGS = [
  'ചായ & കടി (Tea & Snacks)',
  'സിഗരറ്റ് (Cigarette)',
  'ഊണ് (Meals)',
  'പലചരക്ക് (Groceries)',
  'പാഴ്സൽ (Parcel)'
];

export default function AddPattModal({ customer, isOpen, onClose }) {
  const { handleAddPatt, selectedDate, currentStaff } = useShop();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate || getTodayIST());
  const [time, setTime] = useState(getCurrentTime12h());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(selectedDate || getTodayIST());
      setTime(getCurrentTime12h());
      setNote('');
      setIsSubmitting(false);
      // Auto-focus after modal opens
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
      await handleAddPatt({
        customerId: customer.id,
        customerName: customer.name,
        amount: num,
        date,
        time,
        note: note.trim()
      });
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (val) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-bottom-sheet patt-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Handle for mobile swipe feel */}
        <div className="modal-drag-indicator"></div>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">പറ്റ് ചേർക്കുക (Add Patt)</span>
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

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Large Amount Input with Indian Rupee symbol */}
          <div className="large-amount-input-group">
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
              autoComplete="off"
            />
          </div>

          {/* Quick Preset Amount Chips for Fast Tea Stall Entries */}
          <div className="quick-amount-chips">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                className="chip-btn"
                onClick={() => handleQuickAdd(val)}
                disabled={isSubmitting}
              >
                +₹{val}
              </button>
            ))}
          </div>

          {/* Quick Category / Item Tags */}
          <div className="quick-tags-section">
            <span className="section-micro-label">സാധനം / കുറിപ്പ് (Item Tag):</span>
            <div className="tag-chips-scroll">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-chip ${note === tag ? 'active' : ''}`}
                  onClick={() => setNote(note === tag ? '' : tag)}
                  disabled={isSubmitting}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note Field */}
          <div className="form-row">
            <input
              type="text"
              className="form-input-text"
              placeholder="പ്രത്യേക കുറിപ്പ് ഉണ്ടെങ്കിൽ ഇവിടെ എഴുതാം..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Date & Time Row (Automatic defaults, editable) */}
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

          {/* Big Action Submit Button */}
          <div className="modal-actions-footer">
            <button
              type="submit"
              className="btn-submit-primary"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            >
              {isSubmitting ? (
                <span>സേവ് ചെയ്യുന്നു...</span>
              ) : (
                <>
                  <Check size={20} strokeWidth={2.5} />
                  <span>പറ്റ് രേഖപ്പെടുത്തുക (Save ₹{amount || '0'})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
