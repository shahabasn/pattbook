import React from 'react';
import { useShop } from '../context/ShopContext';
import { formatRupee, formatDateDisplay } from '../utils/formatters';
import { TrendingUp, Wallet, ArrowUpRight, AlertCircle, Users } from 'lucide-react';

export default function SummaryCards() {
  const { 
    todayTotalPatt, 
    totalOutstandingBalance, 
    selectedDate, 
    isToday, 
    activeTodayCustomersCount,
    customers
  } = useShop();

  return (
    <div className="summary-cards-wrapper">
      {/* Today's Patt Card */}
      <div className="summary-card today-patt-card">
        <div className="summary-card-inner">
          <div className="summary-top">
            <div className="summary-icon-pill green-pill">
              <TrendingUp size={15} />
            </div>
            <span className="summary-date-hint">
              {isToday ? 'ഇന്നത്തെ പറ്റ് (Today)' : `${formatDateDisplay(selectedDate)}`}
            </span>
          </div>

          <div className="summary-amount-row">
            <span className="summary-currency-amount">{formatRupee(todayTotalPatt)}</span>
          </div>

          <div className="summary-footer-meta">
            <span>{activeTodayCustomersCount} പേർ പറ്റ് വാങ്ങി</span>
          </div>
        </div>
      </div>

      {/* Total Outstanding Card */}
      <div className="summary-card outstanding-card">
        <div className="summary-card-inner">
          <div className="summary-top">
            <div className="summary-icon-pill forest-pill">
              <Wallet size={15} />
            </div>
            <span className="summary-date-hint">ആകെ കിട്ടാനുള്ളത്</span>
          </div>

          <div className="summary-amount-row">
            <span className="summary-currency-amount">{formatRupee(totalOutstandingBalance)}</span>
          </div>

          <div className="summary-footer-meta">
            <span>{customers.length} ഉപഭോക്താക്കൾ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
