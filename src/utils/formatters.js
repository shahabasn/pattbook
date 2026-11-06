/**
 * Utilities for formatting Indian Currency, IST Dates, 12-Hour Times, and WhatsApp messages
 */

// Format numbers in Indian numbering system with Rupee symbol: ₹1,250
export function formatRupee(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const numericAmount = Math.round(Number(amount));
  return '₹' + numericAmount.toLocaleString('en-IN');
}

// Get today's date in IST (India Standard Time: UTC+5:30) as YYYY-MM-DD
export function getTodayIST() {
  const now = new Date();
  // Adjust for IST UTC+5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 3600000;
  const istDate = new Date(utc + istOffset);
  
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get yesterday's date in IST as YYYY-MM-DD
export function getYesterdayIST() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 3600000 - 24 * 3600000; // -1 day
  const istDate = new Date(utc + istOffset);
  
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get current 12-hour time in IST e.g. "10:24 AM"
export function getCurrentTime12h() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  
  let hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}

// Format YYYY-MM-DD to DD/MM/YYYY
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Format full date with day name e.g. "വെള്ളി, 06 നവംബർ 2026"
export function formatHeaderDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  
  const malayalamDays = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];
  const englishDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayNameMl = malayalamDays[dateObj.getDay()] || '';
  const dayNum = String(d).padStart(2, '0');
  const monthName = months[m - 1] || '';
  
  return {
    display: `${dayNum}/${String(m).padStart(2, '0')}/${y}`,
    readable: `${dayNameMl}, ${dayNum} ${monthName} ${y}`
  };
}

// WhatsApp reminder message generator (Malayalam + English)
export function generateWhatsAppReminder({ customerName, balance, todayPatt, phone }) {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const message = `പ്രിയപ്പെട്ട ${customerName},\nമജീദിന്റെ ചായക്കടയിൽ നിന്നുള്ള കണക്ക് വിവരങ്ങൾ:\n\n*ആകെ പറ്റ് ബാക്കി തുക: ${formatRupee(balance)}*${todayPatt > 0 ? `\n(ഇന്നത്തെ പറ്റ്: ${formatRupee(todayPatt)})` : ''}\n\nതുക സൗകര്യത്തിനനുസരിച്ച് നേരിട്ടോ GPay വഴിയോ അടയ്ക്കാവുന്നതാണ്. നന്ദി! ☕\n— മജീദിന്റെ ചായക്കട`;
  
  const encoded = encodeURIComponent(message);
  const url = intlPhone ? `https://wa.me/${intlPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  
  return { message, url };
}

// Unique ID generator for transactions
export function generateId(prefix = 'txn') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
