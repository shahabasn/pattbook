import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  formatRupee, 
  formatDateDisplay, 
  generateWhatsAppReminder 
} from '../utils/formatters';
import { 
  X, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ArrowDownLeft, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Plus, 
  FileText,
  User,
  AlertTriangle
} from 'lucide-react';

export default function CustomerHistoryModal({ 
  customer, 
  isOpen, 
  onClose, 
  onOpenAddPatt, 
  onOpenAddPayment,
  onOpenEditCustomer 
}) {
  const { 
    getCustomerHistory, 
    getCustomerBalance, 
    getCustomerTotalPatt, 
    getCustomerTotalPayments,
    getCustomerTodayPatt,
    selectedDate,
    handleDeletePatt,
    handleDeletePayment
  } = useShop();

  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'daily'
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!isOpen || !customer) return null;

  const currentBalance = getCustomerBalance(customer.id);
  const totalPatt = getCustomerTotalPatt(customer.id);
  const totalPayments = getCustomerTotalPayments(customer.id);
  const todayPatt = getCustomerTodayPatt(customer.id, selectedDate);

  // Retrieve history based on filter
  const historyList = getCustomerHistory(
    customer.id, 
    filterMode === 'daily' ? selectedDate : null
  );

  const { url: whatsAppUrl } = generateWhatsAppReminder({
    customerName: customer.name,
    balance: currentBalance,
    todayPatt: todayPatt,
    phone: customer.phone
  });

  const handleDeleteEntry = async (item) => {
    if (confirmDeleteId === item.id) {
      if (item.type === 'patt') {
        await handleDeletePatt(item.id);
      } else {
        await handleDeletePayment(item.id);
      }
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(item.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-full-sheet history-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-header-info">
            <span className="history-kicker">ഇടപാടുകളുടെ ചരിത്രം (Ledger History)</span>
            <div className="history-customer-title-row">
              <h2 className="history-customer-name">{customer.name}</h2>
              <button 
                type="button" 
                className="edit-customer-btn"
                onClick={() => onOpenEditCustomer(customer)}
                title="പേര് / ഫോൺ മാറ്റുക"
              >
                <Edit3 size={15} />
              </button>
            </div>
            {customer.phone && (
              <span className="history-phone-badge">{customer.phone}</span>
            )}
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

        {/* Customer Totals Summary Banner */}
        <div className="history-summary-grid">
          <div className="history-sum-box sum-patt">
            <span className="sum-box-label">ആകെ പറ്റ് (Total Patt)</span>
            <span className="sum-box-val">{formatRupee(totalPatt)}</span>
          </div>

          <div className="history-sum-box sum-payment">
            <span className="sum-box-label">ആകെ നൽകിയത് (Paid)</span>
            <span className="sum-box-val">{formatRupee(totalPayments)}</span>
          </div>

          <div className="history-sum-box sum-balance">
            <span className="sum-box-label">ബാക്കി തുക (Balance)</span>
            <span className={`sum-box-val ${currentBalance > 0 ? 'due' : 'settled'}`}>
              {formatRupee(currentBalance)}
            </span>
          </div>
        </div>

        {/* Action Bar (WhatsApp Reminder & Quick Actions) */}
        <div className="history-quick-actions-bar">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-action-pill whatsapp-pill"
            title="കണക്ക് WhatsApp വഴി അയക്കുക"
          >
            <MessageSquare size={16} />
            <span>WhatsApp അറിയിപ്പ്</span>
          </a>

          <button
            type="button"
            className="btn-action-pill add-patt-pill"
            onClick={() => {
              onClose();
              onOpenAddPatt(customer);
            }}
          >
            <Plus size={16} />
            <span>+ പറ്റ്</span>
          </button>

          <button
            type="button"
            className="btn-action-pill payment-pill"
            onClick={() => {
              onClose();
              onOpenAddPayment(customer);
            }}
          >
            <ArrowDownLeft size={16} />
            <span>പണം വരവ്</span>
          </button>
        </div>

        {/* Filter Tabs: Daily vs All-Time */}
        <div className="history-filter-tabs">
          <button
            type="button"
            className={`filter-tab ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            മുഴുവൻ ചരിത്രം (All Time)
          </button>
          <button
            type="button"
            className={`filter-tab ${filterMode === 'daily' ? 'active' : ''}`}
            onClick={() => setFilterMode('daily')}
          >
            ഈ ദിവസത്തെ ചരിത്രം ({formatDateDisplay(selectedDate)})
          </button>
        </div>

        {/* Transaction Ledger Table / Cards */}
        <div className="history-ledger-body">
          {historyList.length === 0 ? (
            <div className="empty-history-state">
              <FileText size={40} className="empty-icon" />
              <p className="empty-title">ഇടപാടുകൾ ഒന്നും കണ്ടെത്തിയില്ല</p>
              <span className="empty-sub">
                {filterMode === 'daily' 
                  ? 'ഈ തീയതിയിൽ പറ്റ് ഇടപാടുകൾ ഇല്ല. മുഴുവൻ ചരിത്രം കാണാൻ മുകളിലെ ടാബ് തിരഞ്ഞെടുക്കുക.' 
                  : 'ഈ ഉപഭോക്താവിന് ഇതുവരെ ഇടപാടുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.'}
              </span>
            </div>
          ) : (
            <div className="ledger-timeline">
              {historyList.map((entry) => {
                const isPatt = entry.type === 'patt';
                const isConfirming = confirmDeleteId === entry.id;

                return (
                  <div 
                    key={entry.id} 
                    className={`ledger-entry-item ${isPatt ? 'entry-patt' : 'entry-payment'}`}
                  >
                    <div className="entry-left-indicator">
                      <div className="entry-icon-circle">
                        {isPatt ? <TrendingUp size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                    </div>

                    <div className="entry-content-details">
                      <div className="entry-header-line">
                        <div className="entry-type-title">
                          <span className={`entry-type-tag ${isPatt ? 'tag-patt' : 'tag-payment'}`}>
                            {entry.label}
                          </span>
                          {entry.note && (
                            <span className="entry-note-text">{entry.note}</span>
                          )}
                        </div>

                        <span className={`entry-main-amount ${isPatt ? 'amount-patt' : 'amount-payment'}`}>
                          {isPatt ? `+${formatRupee(entry.amount)}` : `-${formatRupee(entry.amount)}`}
                        </span>
                      </div>

                      <div className="entry-meta-line">
                        <div className="entry-time-group">
                          <span className="entry-date">{formatDateDisplay(entry.date)}</span>
                          <span className="meta-bullet">•</span>
                          <span className="entry-time">{entry.time || ''}</span>
                        </div>

                        <div className="entry-running-group">
                          <span className="running-label">ബാക്കി:</span>
                          <span className="running-val">{formatRupee(entry.runningBalance)}</span>
                        </div>
                      </div>

                      {/* Entry creator & Delete option */}
                      <div className="entry-footer-line">
                        <span className="entry-staff-text">
                          രേഖപ്പെടുത്തിയത്: {entry.createdByName || 'സ്റ്റാഫ്'}
                        </span>

                        <button
                          type="button"
                          className={`btn-void-entry ${isConfirming ? 'confirm-state' : ''}`}
                          onClick={() => handleDeleteEntry(entry)}
                          title="ഇടപാട് റദ്ദാക്കുക"
                        >
                          {isConfirming ? (
                            <span className="confirm-text">ഉറപ്പാണോ? (Confirm)</span>
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
