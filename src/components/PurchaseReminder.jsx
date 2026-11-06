import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Plus, 
  Check, 
  Trash2, 
  ShoppingBag, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

const COMMON_SUPPLIES = [
  { name: 'പാൽ (Milma Milk)', quantity: '10 ലിറ്റർ' },
  { name: 'പഞ്ചസാര (Sugar)', quantity: '5 Kg' },
  { name: 'ചായപ്പൊടി (Dust Tea)', quantity: '2 Kg' },
  { name: 'വെളിച്ചെണ്ണ (Coconut Oil)', quantity: '2 Ltr' },
  { name: 'പേപ്പർ ഗ്ലാസ്സ് (Paper Cups)', quantity: '2 പാക്കറ്റ്' },
  { name: 'മുട്ട (Eggs)', quantity: '1 ട്രേ' },
  { name: 'ബിസ്കറ്റ് (Biscuits)', quantity: '1 ബോക്സ്' },
  { name: 'പാമോലിൻ (Cooking Oil)', quantity: '5 Ltr' }
];

export default function PurchaseReminder() {
  const { 
    purchaseItems, 
    handleAddPurchase, 
    handleTogglePurchase, 
    handleDeletePurchase, 
    handleClearCompletedPurchases,
    currentStaff 
  } = useShop();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingItems = purchaseItems.filter(item => !item.purchased);
  const completedItems = purchaseItems.filter(item => item.purchased);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await handleAddPurchase({
        name: name.trim(),
        quantity: quantity.trim(),
        note: note.trim()
      });
      setName('');
      setQuantity('');
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuickSupply = (supply) => {
    setName(supply.name);
    setQuantity(supply.quantity);
  };

  return (
    <div className="purchase-reminder-container">
      {/* Top Banner */}
      <div className="purchase-page-header">
        <div className="purchase-title-group">
          <div className="purchase-icon-badge">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 className="purchase-main-title">സാധന ഓർമ്മക്കുറിപ്പ്</h1>
            <p className="purchase-sub-title">കടയിലേക്ക് വാങ്ങേണ്ട സാധനങ്ങൾ (Purchase Checklist)</p>
          </div>
        </div>
        <div className="pending-badge-count">
          {pendingItems.length} എണ്ണം ബാക്കി
        </div>
      </div>

      {/* Add Product Card */}
      <div className="card-box add-purchase-card">
        <h3 className="section-title-sm">വാങ്ങേണ്ട സാധനം ചേർക്കുക</h3>

        {/* Quick Suggestion Chips */}
        <div className="supplies-chips-row">
          <span className="chips-hint">വേഗത്തിൽ തിരഞ്ഞെടുക്കാം:</span>
          <div className="chips-scroll-box">
            {COMMON_SUPPLIES.map((sup, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-quick-supply"
                onClick={() => handleSelectQuickSupply(sup)}
              >
                + {sup.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="purchase-input-form">
          <div className="purchase-form-grid">
            <div className="purchase-field-grow">
              <input
                type="text"
                className="form-input-text input-large"
                placeholder="സാധനത്തിന്റെ പേര് (ഉദാ: പാൽ, പഞ്ചസാര) *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="purchase-field-qty">
              <input
                type="text"
                className="form-input-text"
                placeholder="അളവ് (ഉദാ: 5 Kg, 10L)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="purchase-form-secondary">
            <input
              type="text"
              className="form-input-text"
              placeholder="കുറിപ്പ് (Optional Note: കടയുടെ പേര്, സമയം...)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              className="btn-add-purchase"
              disabled={isSubmitting || !name.trim()}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>ചേർക്കുക (Add)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Pending Items List */}
      <div className="purchase-list-section">
        <div className="section-header-row">
          <h2 className="section-heading">വാങ്ങാനുള്ളവ ({pendingItems.length})</h2>
        </div>

        {pendingItems.length === 0 ? (
          <div className="empty-checklist-card">
            <CheckCircle2 size={36} className="empty-check-icon" />
            <p className="empty-check-title">വാങ്ങാൻ സാധനങ്ങൾ ഒന്നും ബാക്കിയില്ല!</p>
            <span className="empty-check-sub">എല്ലാ സാധനങ്ങളും വാങ്ങിയിരിക്കുന്നു. പുതിയവ മുകളിലുള്ള ഫോമിൽ ചേർക്കാം.</span>
          </div>
        ) : (
          <div className="checklist-items">
            {pendingItems.map((item) => (
              <div key={item.id} className="checklist-item-card pending">
                <button
                  type="button"
                  className="btn-checkbox"
                  onClick={() => handleTogglePurchase(item.id, item.purchased)}
                  title="വാങ്ങിയതായി അടയാളപ്പെടുത്തുക"
                >
                  <Circle size={22} className="check-icon-circle" />
                </button>

                <div 
                  className="item-text-body"
                  onClick={() => handleTogglePurchase(item.id, item.purchased)}
                >
                  <div className="item-title-line">
                    <span className="item-product-name">{item.name}</span>
                    {item.quantity && (
                      <span className="item-quantity-pill">{item.quantity}</span>
                    )}
                  </div>
                  {(item.note || item.createdByName) && (
                    <div className="item-sub-meta">
                      {item.note && <span className="item-note-text">{item.note}</span>}
                      {item.createdByName && (
                        <span className="item-staff-tag">• {item.createdByName}</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-item-delete"
                  onClick={() => handleDeletePurchase(item.id)}
                  title="ലിസ്റ്റിൽ നിന്ന് ഒഴിവാക്കുക"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Items Section */}
      {completedItems.length > 0 && (
        <div className="completed-purchase-section">
          <div className="section-header-row">
            <h2 className="section-heading text-muted">വാങ്ങിയവ ({completedItems.length})</h2>
            <button
              type="button"
              className="btn-clear-completed"
              onClick={handleClearCompletedPurchases}
            >
              <Trash2 size={13} />
              <span>ക്ലിയർ ചെയ്യുക</span>
            </button>
          </div>

          <div className="checklist-items completed-list">
            {completedItems.map((item) => (
              <div key={item.id} className="checklist-item-card completed">
                <button
                  type="button"
                  className="btn-checkbox checked"
                  onClick={() => handleTogglePurchase(item.id, item.purchased)}
                  title="തിരികെ മാറ്റുക"
                >
                  <CheckCircle2 size={22} className="check-icon-checked" />
                </button>

                <div 
                  className="item-text-body"
                  onClick={() => handleTogglePurchase(item.id, item.purchased)}
                >
                  <div className="item-title-line">
                    <span className="item-product-name strike-through">{item.name}</span>
                    {item.quantity && (
                      <span className="item-quantity-pill muted">{item.quantity}</span>
                    )}
                  </div>
                  {item.note && (
                    <span className="item-note-text muted">{item.note}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-item-delete"
                  onClick={() => handleDeletePurchase(item.id)}
                  title="ഒഴിവാക്കുക"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
