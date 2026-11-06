import React from 'react';
import { useShop } from '../context/ShopContext';
import { BookOpen, ShoppingBag, UserPlus, Users, Settings } from 'lucide-react';

export default function BottomNav({ 
  currentTab, 
  onSelectTab, 
  onOpenAddCustomer,
  onOpenStaffModal 
}) {
  const { purchaseItems } = useShop();
  const pendingPurchasesCount = purchaseItems.filter(i => !i.purchased).length;

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Patt Register */}
      <button
        type="button"
        className={`nav-item ${currentTab === 'register' ? 'active' : ''}`}
        onClick={() => onSelectTab('register')}
      >
        <div className="nav-icon-wrapper">
          <BookOpen size={20} strokeWidth={currentTab === 'register' ? 2.5 : 1.8} />
        </div>
        <span className="nav-label">പറ്റ് രജിസ്റ്റർ</span>
      </button>

      {/* 2. Floating Action in Nav: + Customer */}
      <button
        type="button"
        className="nav-item-center-action"
        onClick={onOpenAddCustomer}
        title="പുതിയ ഉപഭോക്താവിനെ ചേർക്കുക"
      >
        <div className="center-action-btn">
          <UserPlus size={22} strokeWidth={2.5} />
        </div>
        <span className="nav-label-micro">+ കസ്റ്റമർ</span>
      </button>

      {/* 3. Purchase Reminder */}
      <button
        type="button"
        className={`nav-item ${currentTab === 'purchases' ? 'active' : ''}`}
        onClick={() => onSelectTab('purchases')}
      >
        <div className="nav-icon-wrapper">
          <ShoppingBag size={20} strokeWidth={currentTab === 'purchases' ? 2.5 : 1.8} />
          {pendingPurchasesCount > 0 && (
            <span className="nav-badge-pill">{pendingPurchasesCount}</span>
          )}
        </div>
        <span className="nav-label">സാധനങ്ങൾ</span>
      </button>

      {/* 4. Staff & Settings */}
      <button
        type="button"
        className={`nav-item ${currentTab === 'staff' ? 'active' : ''}`}
        onClick={onOpenStaffModal}
      >
        <div className="nav-icon-wrapper">
          <Users size={20} strokeWidth={1.8} />
        </div>
        <span className="nav-label">സ്റ്റാഫ്</span>
      </button>
    </nav>
  );
}
