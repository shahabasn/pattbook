import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { getTodayIST, getYesterdayIST, formatHeaderDate } from '../utils/formatters';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Users, 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  Sparkles,
  Download
} from 'lucide-react';

export default function Header({ onOpenAddCustomer, onOpenStaffModal, onOpenFirebaseSetup }) {
  const { 
    selectedDate, 
    setSelectedDate, 
    isToday, 
    currentStaff, 
    isFirebaseConfigured,
    handleExportBackup 
  } = useShop();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const formattedDate = formatHeaderDate(selectedDate);
  const todayIST = getTodayIST();
  const yesterdayIST = getYesterdayIST();

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${ny}-${nm}-${nd}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${ny}-${nm}-${nd}`);
  };

  return (
    <header className="shop-header">
      {/* Top Branding Row */}
      <div className="header-top-row">
        <div className="brand-group">
          <div className="brand-icon-wrapper" title="മജീദിന്റെ ചായക്കട - ShopBook">
            <img 
              src="/icons/icon-180.png" 
              alt="Majeedinte Chayakada Logo" 
              className="brand-logo-img" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="brand-titles">
            <div className="brand-mallu-title">മജീദിന്റെ ചായക്കട</div>
            <div className="brand-sub-badge">
              <span className="brand-app-name">ShopBook</span>
              <span className="brand-dot">•</span>
              <span className="brand-sub-text">പറ്റ് രജിസ്റ്റർ</span>
            </div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="header-actions">
          {/* Cloud Sync Status Indicator */}
          <button 
            type="button" 
            className={`sync-badge ${isFirebaseConfigured ? 'sync-online' : 'sync-local'}`}
            onClick={onOpenFirebaseSetup}
            title={isFirebaseConfigured ? 'Cloud Firestore കണക്റ്റഡ് (5 സ്റ്റാഫ് ഷെയറിംഗ്)' : 'ലോക്കൽ മോഡ് (ക്ലൗഡ് സെറ്റപ്പിനായി ടാപ്പ് ചെയ്യുക)'}
          >
            {isFirebaseConfigured ? (
              <>
                <Cloud size={14} className="sync-icon" />
                <span className="sync-text">Cloud Live</span>
              </>
            ) : (
              <>
                <CloudOff size={14} className="sync-icon" />
                <span className="sync-text">Local Sync</span>
              </>
            )}
          </button>

          {/* Current Staff Switcher */}
          <button 
            type="button" 
            className="staff-badge-btn" 
            onClick={onOpenStaffModal}
            title="സ്റ്റാഫ് മാറ്റാൻ ടാപ്പ് ചെയ്യുക"
          >
            <div className="staff-avatar">{currentStaff.name.slice(0, 1)}</div>
            <span className="staff-name-text">{currentStaff.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Selector Row */}
      <div className="header-date-row">
        <div className="date-nav-controls">
          <button 
            type="button" 
            className="date-nav-arrow" 
            onClick={handlePrevDay} 
            title="മുമ്പത്തെ ദിവസം (Previous Day)"
            aria-label="Previous day"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="date-display-box" onClick={() => setShowDatePicker(!showDatePicker)}>
            <Calendar size={15} className="date-icon" />
            <div className="date-text-container">
              <span className="date-main">{formattedDate.display}</span>
              <span className="date-weekday">{formattedDate.readable.split(',')[0]}</span>
            </div>
            {isToday && <span className="today-chip">ഇന്ന്</span>}
          </div>

          <button 
            type="button" 
            className="date-nav-arrow" 
            onClick={handleNextDay} 
            title="അടുത്ത ദിവസം (Next Day)"
            aria-label="Next day"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Quick Date Shortcuts */}
        <div className="date-quick-pills">
          <button 
            type="button" 
            className={`quick-pill ${isToday ? 'active' : ''}`}
            onClick={() => setSelectedDate(todayIST)}
          >
            ഇന്ന് (Today)
          </button>
          <button 
            type="button" 
            className={`quick-pill ${selectedDate === yesterdayIST ? 'active' : ''}`}
            onClick={() => setSelectedDate(yesterdayIST)}
          >
            ഇന്നലെ (Yesterday)
          </button>

          {/* Native Date Picker trigger */}
          <label className="quick-pill date-picker-label" title="തീയതി തിരഞ്ഞെടുക്കുക">
            <input 
              type="date" 
              className="native-date-input"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
            />
            <span>മാറ്റുക</span>
          </label>
        </div>
      </div>
    </header>
  );
}
