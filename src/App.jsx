import React, { useState, useMemo } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import CustomerCard from './components/CustomerCard';
import AddPattModal from './components/AddPattModal';
import AddPaymentModal from './components/AddPaymentModal';
import CustomerHistoryModal from './components/CustomerHistoryModal';
import AddCustomerModal from './components/AddCustomerModal';
import PurchaseReminder from './components/PurchaseReminder';
import BottomNav from './components/BottomNav';
import StaffModal from './components/StaffModal';
import FirebaseSetupModal from './components/FirebaseSetupModal';
import PWAInstallBanner from './components/PWAInstallBanner';
import Toast from './components/Toast';
import { 
  Search, 
  UserPlus, 
  Users, 
  Filter, 
  ArrowUpDown,
  BookOpen,
  Coffee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function ShopBookApp() {
  const { 
    customers, 
    getCustomerTodayPatt, 
    getCustomerBalance, 
    selectedDate 
  } = useShop();

  // Navigation tab: 'register' (default) or 'purchases'
  const [currentTab, setCurrentTab] = useState('register');

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'balance', 'activeToday'
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'balanceHigh', 'name'

  // Modals
  const [pattModalCustomer, setPattModalCustomer] = useState(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState(null);
  const [historyModalCustomer, setHistoryModalCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isFirebaseSetupOpen, setIsFirebaseSetupOpen] = useState(false);

  // Filtered and sorted customer list
  const filteredCustomers = useMemo(() => {
    let list = [...customers];

    // Search query filter (matches name or phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.phone && c.phone.includes(q))
      );
    }

    // Filter pills
    if (filterType === 'balance') {
      list = list.filter(c => getCustomerBalance(c.id) > 0);
    } else if (filterType === 'activeToday') {
      list = list.filter(c => getCustomerTodayPatt(c.id, selectedDate) > 0);
    }

    // Sort order
    if (sortOrder === 'balanceHigh') {
      list.sort((a, b) => getCustomerBalance(b.id) - getCustomerBalance(a.id));
    } else if (sortOrder === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [customers, searchQuery, filterType, sortOrder, getCustomerBalance, getCustomerTodayPatt, selectedDate]);

  const handleOpenAddCustomer = () => {
    setCustomerToEdit(null);
    setIsAddCustomerOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setIsAddCustomerOpen(true);
  };

  return (
    <div className="shop-app-wrapper">
      {/* Top Header */}
      <Header
        onOpenAddCustomer={handleOpenAddCustomer}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenFirebaseSetup={() => setIsFirebaseSetupOpen(true)}
      />

      {/* PWA Home Screen Prompt Banner */}
      <PWAInstallBanner />

      {/* Desktop / Tablet Navigation Bar */}
      <div className="desktop-nav-tabs">
        <button
          type="button"
          className={`desktop-tab-btn ${currentTab === 'register' ? 'active' : ''}`}
          onClick={() => setCurrentTab('register')}
        >
          <BookOpen size={18} />
          <span>പറ്റ് രജിസ്റ്റർ (Patt Register)</span>
        </button>

        <button
          type="button"
          className={`desktop-tab-btn ${currentTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setCurrentTab('purchases')}
        >
          <Coffee size={18} />
          <span>സാധന ഓർമ്മക്കുറിപ്പ് (Purchase Reminder)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="main-viewport-content">
        {currentTab === 'register' ? (
          <div className="patt-register-view">
            {/* Summary Cards Row */}
            <SummaryCards />

            {/* Customer Search & Filter Bar */}
            <div className="search-filter-section">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-field"
                  placeholder="ഉപഭോക്താവിനെ തിരയുക (Search by name / phone)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="clear-search-btn" 
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Pills Row */}
              <div className="filter-chips-row">
                <button
                  type="button"
                  className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  എല്ലാവരും ({customers.length})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterType === 'balance' ? 'active' : ''}`}
                  onClick={() => setFilterType('balance')}
                >
                  ബാക്കി ഉള്ളവർ
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterType === 'activeToday' ? 'active' : ''}`}
                  onClick={() => setFilterType('activeToday')}
                >
                  ഇന്ന് പറ്റ് ഉള്ളവർ
                </button>

                {/* New Customer Button on Desktop / Header */}
                <button
                  type="button"
                  className="btn-add-customer-quick"
                  onClick={handleOpenAddCustomer}
                  title="പുതിയ ഉപഭോക്താവിനെ ചേർക്കുക"
                >
                  <UserPlus size={15} />
                  <span>+ കസ്റ്റമർ</span>
                </button>
              </div>
            </div>

            {/* Customer List */}
            <div className="customers-list-container">
              {filteredCustomers.length === 0 ? (
                <div className="empty-customers-card">
                  <Users size={44} className="empty-users-icon" />
                  <h3 className="empty-heading">ഉപഭോക്താക്കൾ ആരും ഇല്ല</h3>
                  <p className="empty-sub">
                    {searchQuery 
                      ? `'${searchQuery}' എന്ന പേരിൽ ആരെയും കണ്ടെത്തിയില്ല.` 
                      : 'പുതിയ ഉപഭോക്താക്കളെ ചേർക്കാൻ താഴെ കാണുന്ന ബട്ടൺ അമർത്തുക.'}
                  </p>
                  <button
                    type="button"
                    className="btn-add-customer-cta"
                    onClick={handleOpenAddCustomer}
                  >
                    <UserPlus size={18} />
                    <span>പുതിയ ഉപഭോക്താവിനെ ചേർക്കുക</span>
                  </button>
                </div>
              ) : (
                <div className="customers-grid">
                  {filteredCustomers.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
                      onAddPatt={(c) => setPattModalCustomer(c)}
                      onAddPayment={(c) => setPaymentModalCustomer(c)}
                      onViewHistory={(c) => setHistoryModalCustomer(c)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <PurchaseReminder />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAddCustomer={handleOpenAddCustomer}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
      />

      {/* Modals & Dialogs */}
      <AddPattModal
        customer={pattModalCustomer}
        isOpen={Boolean(pattModalCustomer)}
        onClose={() => setPattModalCustomer(null)}
      />

      <AddPaymentModal
        customer={paymentModalCustomer}
        isOpen={Boolean(paymentModalCustomer)}
        onClose={() => setPaymentModalCustomer(null)}
      />

      <CustomerHistoryModal
        customer={historyModalCustomer}
        isOpen={Boolean(historyModalCustomer)}
        onClose={() => setHistoryModalCustomer(null)}
        onOpenAddPatt={(c) => setPattModalCustomer(c)}
        onOpenAddPayment={(c) => setPaymentModalCustomer(c)}
        onOpenEditCustomer={(c) => handleOpenEditCustomer(c)}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onOpenFirebaseSetup={() => setIsFirebaseSetupOpen(true)}
      />

      <FirebaseSetupModal
        isOpen={isFirebaseSetupOpen}
        onClose={() => setIsFirebaseSetupOpen(false)}
      />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <ShopBookApp />
    </ShopProvider>
  );
}
