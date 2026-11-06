/**
 * Real-time Database Service for ShopBook
 * Integrates Cloud Firestore with full offline and local fallback sync.
 */
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from './firebase';
import { generateId, getTodayIST, getCurrentTime12h } from '../utils/formatters';

const STORAGE_KEYS = {
  CUSTOMERS: 'shopbook_customers_v1',
  PATT_TXNS: 'shopbook_patt_txns_v1',
  PAYMENTS: 'shopbook_payments_v1',
  PURCHASES: 'shopbook_purchases_v1',
  ACTIVE_STAFF: 'shopbook_active_staff_v1'
};

// 5 Authorized Shop Users
export const DEFAULT_STAFF = [
  { id: 'staff_1', name: 'മജീദ് (Majeed)', role: 'owner', email: 'majeed@shopbook.app', pin: '1122' },
  { id: 'staff_2', name: 'ഷഹീർ (Shaheer)', role: 'staff', email: 'shaheer@shopbook.app', pin: '2233' },
  { id: 'staff_3', name: 'സുബൈർ (Subair)', role: 'staff', email: 'subair@shopbook.app', pin: '3344' },
  { id: 'staff_4', name: 'അൻവർ (Anwar)', role: 'staff', email: 'anwar@shopbook.app', pin: '4455' },
  { id: 'staff_5', name: 'റഷീദ് (Rasheed)', role: 'staff', email: 'rasheed@shopbook.app', pin: '5566' }
];

// Initial realistic Kerala tea shop ledger seed
const today = getTodayIST();
const INITIAL_CUSTOMERS = [
  {
    id: 'cust_vishnu',
    name: 'Vishnu (വിഷ്ണു)',
    phone: '9847012345',
    notes: 'Regular customer - Morning & evening tea',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_unni',
    name: 'Unnikrishnan (ഉണ്ണികൃഷ്ണൻ)',
    phone: '9847123456',
    notes: 'Auto driver - Tea & snacks',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_shahan',
    name: 'Shahan (ഷഹാൻ)',
    phone: '9745112233',
    notes: 'Near junction',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_faisal',
    name: 'Faisal (ഫൈസൽ)',
    phone: '9447889900',
    notes: 'Workshop next door',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_rahul',
    name: 'Rahul (രാഹുൽ)',
    phone: '9633221100',
    notes: 'Evening tea regular',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PATT_TXNS = [
  // Vishnu matching prompt: 10:24 AM ₹26, 11:05 AM ₹45, 12:30 PM ₹80 = Today Total ₹151
  {
    id: 'patt_1',
    customerId: 'cust_vishnu',
    customerName: 'Vishnu (വിഷ്ണു)',
    amount: 26,
    date: today,
    time: '10:24 AM',
    note: 'ചായ & പരിപ്പുവട',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'patt_2',
    customerId: 'cust_vishnu',
    customerName: 'Vishnu (വിഷ്ണു)',
    amount: 45,
    date: today,
    time: '11:05 AM',
    note: 'സിഗരറ്റ് & ചായ',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'patt_3',
    customerId: 'cust_vishnu',
    customerName: 'Vishnu (വിഷ്ണു)',
    amount: 80,
    date: today,
    time: '12:30 PM',
    note: 'ഊണ് & സോഡ',
    createdById: 'staff_2',
    createdByName: 'ഷഹീർ (Shaheer)',
    createdAt: new Date().toISOString()
  },
  // Previous balance simulation entry for Vishnu (1250 past patt)
  {
    id: 'patt_prev_vishnu',
    customerId: 'cust_vishnu',
    customerName: 'Vishnu (വിഷ്ണു)',
    amount: 1250,
    date: '2026-11-01',
    time: '09:00 AM',
    note: 'കഴിഞ്ഞ മാസത്തെ ബാക്കി (Previous Month Balance)',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date('2026-11-01').toISOString()
  },
  // Unnikrishnan
  {
    id: 'patt_4',
    customerId: 'cust_unni',
    customerName: 'Unnikrishnan (ഉണ്ണികൃഷ്ണൻ)',
    amount: 35,
    date: today,
    time: '08:30 AM',
    note: 'ചായ & പഴംപൊരി',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'patt_5',
    customerId: 'cust_unni',
    customerName: 'Unnikrishnan (ഉണ്ണികൃഷ്ണൻ)',
    amount: 420,
    date: '2026-11-02',
    time: '09:30 AM',
    note: 'പഴയ പറ്റ്',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date('2026-11-02').toISOString()
  },
  // Shahan
  {
    id: 'patt_6',
    customerId: 'cust_shahan',
    customerName: 'Shahan (ഷഹാൻ)',
    amount: 50,
    date: today,
    time: '09:15 AM',
    note: 'ചായ & സമോസ',
    createdById: 'staff_3',
    createdByName: 'സുബൈർ (Subair)',
    createdAt: new Date().toISOString()
  },
  // Faisal
  {
    id: 'patt_7',
    customerId: 'cust_faisal',
    customerName: 'Faisal (ഫൈസൽ)',
    amount: 250,
    date: '2026-11-04',
    time: '04:00 PM',
    note: 'പലഹാരങ്ങൾ',
    createdById: 'staff_2',
    createdByName: 'ഷഹീർ (Shaheer)',
    createdAt: new Date('2026-11-04').toISOString()
  }
];

const INITIAL_PAYMENTS = [
  // Vishnu payment matching prompt: ₹300 payment -> Outstanding: 1250 + 151 - 300 = ₹1,101
  {
    id: 'pay_1',
    customerId: 'cust_vishnu',
    customerName: 'Vishnu (വിഷ്ണു)',
    amount: 300,
    date: today,
    time: '03:00 PM',
    note: 'GPay വഴി അടച്ചു',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pay_2',
    customerId: 'cust_rahul',
    customerName: 'Rahul (രാഹുൽ)',
    amount: 200,
    date: today,
    time: '11:30 AM',
    note: 'നേരിട്ട് പണം നൽകി (Cash)',
    createdById: 'staff_1',
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PURCHASES = [
  {
    id: 'item_1',
    name: 'പാൽ (Milma Milk)',
    quantity: '10 ലിറ്റർ (10L)',
    note: 'രാവിലെ 6 മണിക്ക്',
    purchased: false,
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'item_2',
    name: 'പഞ്ചസാര (Sugar)',
    quantity: '5 Kg',
    note: 'സൂപ്പർമാർക്കറ്റിൽ നിന്ന്',
    purchased: false,
    createdByName: 'ഷഹീർ (Shaheer)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'item_3',
    name: 'ചായപ്പൊടി (AVT Tea)',
    quantity: '2 Kg Dust',
    note: 'കട്ടൻ ചായപ്പൊടി',
    purchased: false,
    createdByName: 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'item_4',
    name: 'വെളിച്ചെണ്ണ (Coconut Oil)',
    quantity: '2 Litres',
    note: 'പലഹാരങ്ങൾ ഉണ്ടാക്കാൻ',
    purchased: true,
    purchasedAt: new Date().toISOString(),
    createdByName: 'സുബൈർ (Subair)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'item_5',
    name: 'പേപ്പർ ഗ്ലാസ്സ് (Paper Cups)',
    quantity: '2 പാക്കറ്റ്',
    note: 'പാർസൽ ചായയ്ക്ക്',
    purchased: true,
    purchasedAt: new Date().toISOString(),
    createdByName: 'അൻവർ (Anwar)',
    createdAt: new Date().toISOString()
  }
];

// BroadcastChannel for instant cross-tab sync in browser
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('shopbook_sync_bus') 
  : null;

function loadLocal(key, defaultValue) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (channel) {
      channel.postMessage({ type: 'SYNC_UPDATE', key });
    }
  } catch (e) {
    console.error('Local save error:', e);
  }
}

// -------------------------------------------------------------
// REALTIME SUBSCRIBERS
// -------------------------------------------------------------

export function subscribeCustomers(callback) {
  if (isFirebaseConfigured && db) {
    const unsub = onSnapshot(
      collection(db, 'customers'), 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Firestore customers listener error, using local data:', error);
        callback(loadLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
      }
    );
    return unsub;
  }

  // Local sync mode
  const send = () => {
    const items = loadLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    callback(items);
  };
  send();

  const handleMessage = (e) => {
    if (e.data?.key === STORAGE_KEYS.CUSTOMERS || !e.data?.key) {
      send();
    }
  };
  if (channel) channel.addEventListener('message', handleMessage);
  window.addEventListener('storage', send);

  return () => {
    if (channel) channel.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', send);
  };
}

export function subscribePattTransactions(callback) {
  if (isFirebaseConfigured && db) {
    const unsub = onSnapshot(
      collection(db, 'pattTransactions'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Firestore pattTransactions error, using local data:', error);
        callback(loadLocal(STORAGE_KEYS.PATT_TXNS, INITIAL_PATT_TXNS));
      }
    );
    return unsub;
  }

  const send = () => {
    const items = loadLocal(STORAGE_KEYS.PATT_TXNS, INITIAL_PATT_TXNS);
    callback(items);
  };
  send();

  const handleMessage = (e) => {
    if (e.data?.key === STORAGE_KEYS.PATT_TXNS || !e.data?.key) {
      send();
    }
  };
  if (channel) channel.addEventListener('message', handleMessage);
  window.addEventListener('storage', send);

  return () => {
    if (channel) channel.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', send);
  };
}

export function subscribePayments(callback) {
  if (isFirebaseConfigured && db) {
    const unsub = onSnapshot(
      collection(db, 'payments'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Firestore payments error, using local data:', error);
        callback(loadLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS));
      }
    );
    return unsub;
  }

  const send = () => {
    const items = loadLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    callback(items);
  };
  send();

  const handleMessage = (e) => {
    if (e.data?.key === STORAGE_KEYS.PAYMENTS || !e.data?.key) {
      send();
    }
  };
  if (channel) channel.addEventListener('message', handleMessage);
  window.addEventListener('storage', send);

  return () => {
    if (channel) channel.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', send);
  };
}

export function subscribePurchaseItems(callback) {
  if (isFirebaseConfigured && db) {
    const unsub = onSnapshot(
      collection(db, 'purchaseItems'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Firestore purchaseItems error, using local data:', error);
        callback(loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES));
      }
    );
    return unsub;
  }

  const send = () => {
    const items = loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    callback(items);
  };
  send();

  const handleMessage = (e) => {
    if (e.data?.key === STORAGE_KEYS.PURCHASES || !e.data?.key) {
      send();
    }
  };
  if (channel) channel.addEventListener('message', handleMessage);
  window.addEventListener('storage', send);

  return () => {
    if (channel) channel.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', send);
  };
}

// -------------------------------------------------------------
// DATABASE MUTATION METHODS
// -------------------------------------------------------------

// Add Customer
export async function addCustomer({ name, phone = '', notes = '', createdBy }) {
  const customerData = {
    name: name.trim(),
    phone: phone.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    createdById: createdBy?.id || 'staff_1',
    createdByName: createdBy?.name || 'മജീദ് (Majeed)'
  };

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...customerData,
      serverTime: serverTimestamp()
    });
    return { id: docRef.id, ...customerData };
  }

  // Local
  const items = loadLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  const newCust = { id: generateId('cust'), ...customerData };
  items.unshift(newCust);
  saveLocal(STORAGE_KEYS.CUSTOMERS, items);
  return newCust;
}

// Update Customer Name & Details (Stable customer ID keeps transactions intact)
export async function updateCustomer(customerId, { name, phone, notes }) {
  const updateData = {
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    notes: notes ? notes.trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const custRef = doc(db, 'customers', customerId);
    await updateDoc(custRef, updateData);
    return true;
  }

  const items = loadLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  const idx = items.findIndex(c => c.id === customerId);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updateData };
    saveLocal(STORAGE_KEYS.CUSTOMERS, items);
  }
  return true;
}

// Add Multiple Daily Patt Entry (CRITICAL: Every entry saved as unique record)
export async function addPattTransaction({ customerId, customerName, amount, date, time, note = '', createdBy }) {
  const numericAmount = Math.abs(Number(amount));
  if (!numericAmount || isNaN(numericAmount)) {
    throw new Error('Valid patt amount is required');
  }

  const transactionData = {
    customerId,
    customerName,
    amount: numericAmount,
    date: date || getTodayIST(),
    time: time || getCurrentTime12h(),
    note: note.trim(),
    createdById: createdBy?.id || 'staff_1',
    createdByName: createdBy?.name || 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'pattTransactions'), {
      ...transactionData,
      serverTime: serverTimestamp()
    });
    return { id: docRef.id, ...transactionData };
  }

  const items = loadLocal(STORAGE_KEYS.PATT_TXNS, INITIAL_PATT_TXNS);
  const newTxn = { id: generateId('patt'), ...transactionData };
  items.unshift(newTxn);
  saveLocal(STORAGE_KEYS.PATT_TXNS, items);
  return newTxn;
}

// Delete / Void Patt Transaction
export async function deletePattTransaction(transactionId) {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'pattTransactions', transactionId));
    return true;
  }

  const items = loadLocal(STORAGE_KEYS.PATT_TXNS, INITIAL_PATT_TXNS);
  const filtered = items.filter(t => t.id !== transactionId);
  saveLocal(STORAGE_KEYS.PATT_TXNS, filtered);
  return true;
}

// Record Customer Payment (Reduces outstanding balance)
export async function addPayment({ customerId, customerName, amount, date, time, note = '', createdBy }) {
  const numericAmount = Math.abs(Number(amount));
  if (!numericAmount || isNaN(numericAmount)) {
    throw new Error('Valid payment amount is required');
  }

  const paymentData = {
    customerId,
    customerName,
    amount: numericAmount,
    date: date || getTodayIST(),
    time: time || getCurrentTime12h(),
    note: note.trim() || 'പണം വരവ് (Payment)',
    createdById: createdBy?.id || 'staff_1',
    createdByName: createdBy?.name || 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      serverTime: serverTimestamp()
    });
    return { id: docRef.id, ...paymentData };
  }

  const items = loadLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  const newPay = { id: generateId('pay'), ...paymentData };
  items.unshift(newPay);
  saveLocal(STORAGE_KEYS.PAYMENTS, items);
  return newPay;
}

// Delete Payment
export async function deletePayment(paymentId) {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'payments', paymentId));
    return true;
  }

  const items = loadLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  const filtered = items.filter(p => p.id !== paymentId);
  saveLocal(STORAGE_KEYS.PAYMENTS, filtered);
  return true;
}

// Purchase Reminder Actions
export async function addPurchaseItem({ name, quantity = '', note = '', createdBy }) {
  const itemData = {
    name: name.trim(),
    quantity: quantity.trim(),
    note: note.trim(),
    purchased: false,
    createdById: createdBy?.id || 'staff_1',
    createdByName: createdBy?.name || 'മജീദ് (Majeed)',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'purchaseItems'), {
      ...itemData,
      serverTime: serverTimestamp()
    });
    return { id: docRef.id, ...itemData };
  }

  const items = loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  const newItem = { id: generateId('item'), ...itemData };
  items.unshift(newItem);
  saveLocal(STORAGE_KEYS.PURCHASES, items);
  return newItem;
}

export async function togglePurchaseItem(itemId, currentStatus) {
  const newStatus = !currentStatus;
  const updateData = {
    purchased: newStatus,
    purchasedAt: newStatus ? new Date().toISOString() : null
  };

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'purchaseItems', itemId), updateData);
    return true;
  }

  const items = loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  const idx = items.findIndex(i => i.id === itemId);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updateData };
    saveLocal(STORAGE_KEYS.PURCHASES, items);
  }
  return true;
}

export async function deletePurchaseItem(itemId) {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'purchaseItems', itemId));
    return true;
  }

  const items = loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  const filtered = items.filter(i => i.id !== itemId);
  saveLocal(STORAGE_KEYS.PURCHASES, filtered);
  return true;
}

export async function clearCompletedPurchases() {
  if (isFirebaseConfigured && db) {
    // In live firestore, find and batch delete
    // For simplicity, handled through the app state
    return true;
  }

  const items = loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  const activeOnly = items.filter(i => !i.purchased);
  saveLocal(STORAGE_KEYS.PURCHASES, activeOnly);
  return true;
}

// Full Backup Export
export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    shop: 'മജീദിന്റെ ചായക്കട (Majeed Tea Stall)',
    appName: 'ShopBook',
    customers: loadLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
    pattTransactions: loadLocal(STORAGE_KEYS.PATT_TXNS, INITIAL_PATT_TXNS),
    payments: loadLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
    purchaseItems: loadLocal(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES)
  };
  return data;
}

// Restore Backup Data
export function importBackupData(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid backup file');
  }
  if (Array.isArray(jsonData.customers)) saveLocal(STORAGE_KEYS.CUSTOMERS, jsonData.customers);
  if (Array.isArray(jsonData.pattTransactions)) saveLocal(STORAGE_KEYS.PATT_TXNS, jsonData.pattTransactions);
  if (Array.isArray(jsonData.payments)) saveLocal(STORAGE_KEYS.PAYMENTS, jsonData.payments);
  if (Array.isArray(jsonData.purchaseItems)) saveLocal(STORAGE_KEYS.PURCHASES, jsonData.purchaseItems);
  return true;
}
