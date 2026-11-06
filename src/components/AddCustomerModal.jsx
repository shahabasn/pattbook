import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Check, User, Phone, FileText } from 'lucide-react';

export default function AddCustomerModal({ isOpen, onClose, customerToEdit = null }) {
  const { handleAddCustomer, handleUpdateCustomer } = useShop();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef(null);

  const isEditing = Boolean(customerToEdit);

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setName(customerToEdit.name || '');
        setPhone(customerToEdit.phone || '');
        setNotes(customerToEdit.notes || '');
      } else {
        setName('');
        setPhone('');
        setNotes('');
      }
      setIsSubmitting(false);
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await handleUpdateCustomer(customerToEdit.id, {
          name: name.trim(),
          phone: phone.trim(),
          notes: notes.trim()
        });
      } else {
        await handleAddCustomer({
          name: name.trim(),
          phone: phone.trim(),
          notes: notes.trim()
        });
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-bottom-sheet customer-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-indicator"></div>

        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">
              {isEditing ? 'ഉപഭോക്താവിനെ മാറ്റുക' : 'പുതിയ ഉപഭോക്താവ്'}
            </span>
            <h2 className="modal-main-title">
              {isEditing ? 'കസ്റ്റമർ വിവരങ്ങൾ തിരുത്തുക' : 'ഉപഭോക്താവിനെ ചേർക്കുക'}
            </h2>
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
          {/* Customer Name */}
          <div className="input-group">
            <label className="input-label">
              <User size={15} />
              <span>ഉപഭോക്താവിന്റെ പേര് (Customer Name) *</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              className="form-input-text input-large"
              placeholder="ഉദാ: വിഷ്ണു / Vishnu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="input-group">
            <label className="input-label">
              <Phone size={15} />
              <span>മൊബൈൽ നമ്പർ (Optional Phone)</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              className="form-input-text"
              placeholder="ഉദാ: 9847012345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div className="input-group">
            <label className="input-label">
              <FileText size={15} />
              <span>കുറിപ്പ് (Optional Notes)</span>
            </label>
            <input
              type="text"
              className="form-input-text"
              placeholder="ഉദാ: രാവിലെ വരുന്നയാൾ, വർക്ക്‌ഷോപ്പ്"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {isEditing && (
            <p className="edit-safety-notice">
              ശ്രദ്ധിക്കുക: പേര് മാറ്റിയാലും പഴയ എല്ലാ പറ്റ്, വരവ് ഇടപാടുകളും സുരക്ഷിതമായി നിലനിൽക്കും.
            </p>
          )}

          <div className="modal-actions-footer">
            <button
              type="submit"
              className="btn-submit-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <span>സേവ് ചെയ്യുന്നു...</span>
              ) : (
                <>
                  <Check size={20} strokeWidth={2.5} />
                  <span>{isEditing ? 'വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്യുക' : 'ഉപഭോക്താവിനെ സേവ് ചെയ്യുക'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
