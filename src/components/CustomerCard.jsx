import React from 'react';
import { useShop } from '../context/ShopContext';
import { formatRupee } from '../utils/formatters';
import { 
  Plus, 
  History, 
  CreditCard, 
  Phone, 
  MessageSquare, 
  CheckCircle,
  Clock,
  ArrowDownLeft
} from 'lucide-react';

export default function CustomerCard({ 
  customer, 
  onAddPatt, 
  onAddPayment, 
  onViewHistory 
}) {
  const { 
    getCustomerTodayPatt, 
    getCustomerTodayCount, 
    getCustomerBalance 
  } = useShop();

  const todayPatt = getCustomerTodayPatt(customer.id);
  const todayCount = getCustomerTodayCount(customer.id);
  const outstandingBalance = getCustomerBalance(customer.id);

  const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : '';
  const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  return (
    <div className={`customer-card ${outstandingBalance > 0 ? 'has-balance' : 'settled'}`}>
      {/* Top Customer Info Row */}
      <div className="card-header-row">
        <div className="customer-primary-info" onClick={() => onViewHistory(customer)}>
          <div className="customer-avatar-badge">
            {customer.name.slice(0, 1)}
          </div>
          <div className="customer-identity">
            <h3 className="customer-name-heading">{customer.name}</h3>
            {customer.phone && (
              <span className="customer-phone-sub">
                {customer.phone}
              </span>
            )}
          </div>
        </div>

        {/* Quick Phone / WhatsApp Actions */}
        {customer.phone && (
          <div className="card-quick-contacts">
            <a 
              href={`tel:${customer.phone}`} 
              className="quick-contact-icon tel-link" 
              title="വിളിക്കുക (Call)"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={14} />
            </a>
            <a 
              href={`https://wa.me/${intlPhone}`} 
              target="_blank" 
              rel="noreferrer" 
              className="quick-contact-icon wa-link" 
              title="WhatsApp സന്ദേശം"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageSquare size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Ledger Balances Metric Grid */}
      <div className="card-metrics-grid">
        {/* Today's Patt Metric */}
        <div className="metric-box today-metric">
          <span className="metric-label">ഇന്നത്തെ പറ്റ്</span>
          <div className="metric-value-row">
            <span className={`metric-amount ${todayPatt > 0 ? 'active-amount' : 'zero-amount'}`}>
              {formatRupee(todayPatt)}
            </span>
            {todayCount > 0 && (
              <span className="metric-entry-count">
                ({todayCount} തവണ)
              </span>
            )}
          </div>
        </div>

        {/* Total Outstanding Metric */}
        <div className="metric-box outstanding-metric">
          <span className="metric-label">ആകെ ബാക്കി</span>
          <div className="metric-value-row">
            <span className={`metric-amount ${outstandingBalance > 0 ? 'due-amount' : 'cleared-amount'}`}>
              {outstandingBalance < 0 
                ? `${formatRupee(Math.abs(outstandingBalance))}` 
                : formatRupee(outstandingBalance)}
            </span>
            {outstandingBalance === 0 && (
              <span className="metric-settled-pill">തീർത്തു</span>
            )}
            {outstandingBalance < 0 && (
              <span className="metric-settled-pill" style={{ backgroundColor: '#FFF3CD', color: '#856404' }}>അഡ്വാൻസ്</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons (Large touch targets for 1-hand mobile use) */}
      <div className="card-actions-row">
        {/* + Patt (Primary Big Action) */}
        <button 
          type="button" 
          className="btn-card-action btn-add-patt"
          onClick={() => onAddPatt(customer)}
          title="പറ്റ് ചേർക്കുക"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>+ പറ്റ് (+ Patt)</span>
        </button>

        {/* History */}
        <button 
          type="button" 
          className="btn-card-action btn-history"
          onClick={() => onViewHistory(customer)}
          title="ചരിത്രം കാണുക"
        >
          <History size={16} />
          <span>ചരിത്രം</span>
        </button>

        {/* Payment */}
        <button 
          type="button" 
          className="btn-card-action btn-payment"
          onClick={() => onAddPayment(customer)}
          title="പണം വരവ് രേഖപ്പെടുത്തുക"
        >
          <ArrowDownLeft size={16} />
          <span>വരവ്</span>
        </button>
      </div>
    </div>
  );
}
