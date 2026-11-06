import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  subscribeCustomers, 
  subscribePattTransactions, 
  subscribePayments, 
  subscribePurchaseItems,
  addCustomer,
  updateCustomer,
  addPattTransaction,
  deletePattTransaction,
  addPayment,
  deletePayment,
  addPurchaseItem,
  togglePurchaseItem,
  deletePurchaseItem,
  clearCompletedPurchases,
  exportAllData,
  importBackupData,
  DEFAULT_STAFF 
} from '../services/db';
import { isFirebaseConfigured } from '../services/firebase';
import { getTodayIST } from '../utils/formatters';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [pattTransactions, setPattTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [purchaseItems, setPurchaseItems] = useState([]);
  
  // Selected date for ledger (default IST today)
  const [selectedDate, setSelectedDate] = useState(getTodayIST());
  
  // Active shop staff member among 5 authorized users
  const [currentStaff, setCurrentStaff] = useState(() => {
    try {
      const saved = localStorage.getItem('shopbook_active_staff_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_STAFF[0]; // Majeed (Owner)
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  // Set active staff and persist
  const handleSelectStaff = useCallback((staffMember) => {
    setCurrentStaff(staffMember);
    localStorage.setItem('shopbook_active_staff_v1', JSON.stringify(staffMember));
    showToast(`ലോഗിൻ ചെയ്തു: ${staffMember.name}`, 'info');
  }, [showToast]);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubCust = subscribeCustomers((data) => {
      setCustomers(data);
    });
    const unsubPatt = subscribePattTransactions((data) => {
      setPattTransactions(data);
    });
    const unsubPay = subscribePayments((data) => {
      setPayments(data);
    });
    const unsubPurch = subscribePurchaseItems((data) => {
      setPurchaseItems(data);
      setLoading(false);
    });

    return () => {
      unsubCust();
      unsubPatt();
      unsubPay();
      unsubPurch();
    };
  }, []);

  // -----------------------------------------------------------
  // ACCURATE CALCULATIONS (AUTOMATIC & TRANSACTION-DERIVED)
  // -----------------------------------------------------------

  // Today's total patt for a customer on selected date
  const getCustomerTodayPatt = useCallback((customerId, date = selectedDate) => {
    return pattTransactions
      .filter(t => t.customerId === customerId && t.date === date)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [pattTransactions, selectedDate]);

  // Count of patt entries for a customer on selected date
  const getCustomerTodayCount = useCallback((customerId, date = selectedDate) => {
    return pattTransactions.filter(t => t.customerId === customerId && t.date === date).length;
  }, [pattTransactions, selectedDate]);

  // Total all-time patt for a customer
  const getCustomerTotalPatt = useCallback((customerId) => {
    return pattTransactions
      .filter(t => t.customerId === customerId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [pattTransactions]);

  // Total all-time payments for a customer
  const getCustomerTotalPayments = useCallback((customerId) => {
    return payments
      .filter(p => p.customerId === customerId)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  // Current Outstanding Balance for a customer: (All Patt - All Payments)
  const getCustomerBalance = useCallback((customerId) => {
    const totalPatt = getCustomerTotalPatt(customerId);
    const totalPayments = getCustomerTotalPayments(customerId);
    return totalPatt - totalPayments;
  }, [getCustomerTotalPatt, getCustomerTotalPayments]);

  // Full chronological transaction history for a customer with running balances
  const getCustomerHistory = useCallback((customerId, dateFilter = null) => {
    // Collect all patt entries
    const customerPatts = pattTransactions
      .filter(t => t.customerId === customerId)
      .map(t => ({
        ...t,
        type: 'patt',
        label: 'പറ്റ് (Patt)',
        isCredit: true
      }));

    // Collect all payment entries
    const customerPays = payments
      .filter(p => p.customerId === customerId)
      .map(p => ({
        ...p,
        type: 'payment',
        label: 'പണം വരവ് (Payment)',
        isCredit: false
      }));

    // Merge and sort chronologically (oldest to newest for running balance)
    const all = [...customerPatts, ...customerPays].sort((a, b) => {
      const dateComp = (a.date || '').localeCompare(b.date || '');
      if (dateComp !== 0) return dateComp;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    // Compute running balance
    let running = 0;
    const withRunningBalance = all.map(entry => {
      if (entry.type === 'patt') {
        running += Number(entry.amount) || 0;
      } else {
        running -= Number(entry.amount) || 0;
      }
      return {
        ...entry,
        runningBalance: running
      };
    });

    // If date filter is provided, filter while keeping the correct running balance
    if (dateFilter) {
      return withRunningBalance
        .filter(item => item.date === dateFilter)
        .reverse(); // Most recent first for daily view
    }

    // Default return all sorted newest first
    return [...withRunningBalance].reverse();
  }, [pattTransactions, payments]);

  // Overall Today's Total Patt (Sum across all customers for selectedDate)
  const todayTotalPatt = useMemo(() => {
    return pattTransactions
      .filter(t => t.date === selectedDate)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [pattTransactions, selectedDate]);

  // Overall Total Outstanding across all customers
  const totalOutstandingBalance = useMemo(() => {
    return customers.reduce((sum, customer) => {
      const bal = getCustomerBalance(customer.id);
      return sum + (bal > 0 ? bal : 0);
    }, 0);
  }, [customers, getCustomerBalance]);

  // Active customers today count
  const activeTodayCustomersCount = useMemo(() => {
    const activeIds = new Set(
      pattTransactions.filter(t => t.date === selectedDate).map(t => t.customerId)
    );
    return activeIds.size;
  }, [pattTransactions, selectedDate]);

  // -----------------------------------------------------------
  // ACTIONS WITH NOTIFICATIONS & SAFETY
  // -----------------------------------------------------------

  const handleAddCustomer = async (data) => {
    try {
      const res = await addCustomer({ ...data, createdBy: currentStaff });
      showToast(`ഉപഭോക്താവിനെ ചേർത്തു: ${res.name}`, 'success');
      return res;
    } catch (err) {
      showToast(err.message || 'ഉപഭോക്താവിനെ ചേർക്കാൻ കഴിഞ്ഞില്ല', 'error');
      throw err;
    }
  };

  const handleUpdateCustomer = async (id, data) => {
    try {
      await updateCustomer(id, data);
      showToast('വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്തു', 'success');
    } catch (err) {
      showToast('അപ്ഡേറ്റ് പരാജയപ്പെട്ടു', 'error');
      throw err;
    }
  };

  const handleAddPatt = async (data) => {
    try {
      const res = await addPattTransaction({ ...data, createdBy: currentStaff });
      showToast(`പറ്റ് രേഖപ്പെടുത്തി: ₹${data.amount} (${data.customerName})`, 'success');
      return res;
    } catch (err) {
      showToast(err.message || 'പറ്റ് രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല', 'error');
      throw err;
    }
  };

  const handleDeletePatt = async (id) => {
    try {
      await deletePattTransaction(id);
      showToast('പറ്റ് ഒഴിവാക്കി', 'info');
    } catch (err) {
      showToast('ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല', 'error');
      throw err;
    }
  };

  const handleAddPayment = async (data) => {
    try {
      const res = await addPayment({ ...data, createdBy: currentStaff });
      showToast(`വരവ് രേഖപ്പെടുത്തി: ₹${data.amount} (${data.customerName})`, 'success');
      return res;
    } catch (err) {
      showToast(err.message || 'വരവ് രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല', 'error');
      throw err;
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await deletePayment(id);
      showToast('വരവ് ഒഴിവാക്കി', 'info');
    } catch (err) {
      showToast('ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല', 'error');
      throw err;
    }
  };

  const handleAddPurchase = async (data) => {
    try {
      const res = await addPurchaseItem({ ...data, createdBy: currentStaff });
      showToast(`ലിസ്റ്റിൽ ചേർത്തു: ${res.name}`, 'success');
      return res;
    } catch (err) {
      showToast('ചേർക്കാൻ കഴിഞ്ഞില്ല', 'error');
      throw err;
    }
  };

  const handleTogglePurchase = async (id, currentStatus) => {
    try {
      await togglePurchaseItem(id, currentStatus);
    } catch (err) {
      showToast('അപ്ഡേറ്റ് പരാജയപ്പെട്ടു', 'error');
    }
  };

  const handleDeletePurchase = async (id) => {
    try {
      await deletePurchaseItem(id);
      showToast('സാധനം നീക്കം ചെയ്തു', 'info');
    } catch (err) {
      showToast('നീക്കം ചെയ്യാൻ കഴിഞ്ഞില്ല', 'error');
    }
  };

  const handleClearCompletedPurchases = async () => {
    try {
      await clearCompletedPurchases();
      showToast('വാങ്ങിയവ നീക്കം ചെയ്തു', 'info');
    } catch (err) {
      showToast('പരാജയപ്പെട്ടു', 'error');
    }
  };

  const handleExportBackup = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShopBook_Backup_${getTodayIST()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ബാക്കപ്പ് ഫയൽ ഡൗൺലോഡ് ചെയ്തു', 'success');
  };

  const handleImportBackup = (jsonData) => {
    try {
      importBackupData(jsonData);
      showToast('ഡാറ്റ പുനഃസ്ഥാപിച്ചു', 'success');
      window.location.reload();
    } catch (e) {
      showToast('ബാക്കപ്പ് ഫയൽ തെറ്റാണ്', 'error');
    }
  };

  const value = {
    customers,
    pattTransactions,
    payments,
    purchaseItems,
    selectedDate,
    setSelectedDate,
    isToday: selectedDate === getTodayIST(),
    currentStaff,
    setCurrentStaff: handleSelectStaff,
    allStaff: DEFAULT_STAFF,
    isFirebaseConfigured,
    loading,
    toast,
    showToast,
    // Calculations
    getCustomerTodayPatt,
    getCustomerTodayCount,
    getCustomerTotalPatt,
    getCustomerTotalPayments,
    getCustomerBalance,
    getCustomerHistory,
    todayTotalPatt,
    totalOutstandingBalance,
    activeTodayCustomersCount,
    // Database Operations
    handleAddCustomer,
    handleUpdateCustomer,
    handleAddPatt,
    handleDeletePatt,
    handleAddPayment,
    handleDeletePayment,
    handleAddPurchase,
    handleTogglePurchase,
    handleDeletePurchase,
    handleClearCompletedPurchases,
    handleExportBackup,
    handleImportBackup
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
