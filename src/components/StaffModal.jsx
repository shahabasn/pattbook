import React, { useState, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Download, 
  Upload, 
  Cloud, 
  Check, 
  Lock, 
  Sparkles,
  Key
} from 'lucide-react';

export default function StaffModal({ 
  isOpen, 
  onClose, 
  onOpenFirebaseSetup 
}) {
  const { 
    currentStaff, 
    setCurrentStaff, 
    allStaff, 
    handleExportBackup, 
    handleImportBackup,
    isFirebaseConfigured 
  } = useShop();

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        handleImportBackup(parsed);
        onClose();
      } catch (err) {
        alert('തെറ്റായ ഫയൽ ഫോർമാറ്റ്');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-bottom-sheet staff-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-indicator"></div>

        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">കടയിലെ ജീവനക്കാർ (Shop Staff)</span>
            <h2 className="modal-main-title">5 അംഗീകൃത ജീവനക്കാർ</h2>
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

        <p className="staff-intro-note">
          ഈ ആപ്പ് ഒരേസമയം 5 പേർക്ക് ഒരേ ക്ലൗഡ് ഡാറ്റാബേസിൽ ഉപയോഗിക്കാം. നിങ്ങൾ ആരാണെന്ന് തിരഞ്ഞെടുക്കുക:
        </p>

        {/* 5 Authorized Staff Selection */}
        <div className="staff-members-list">
          {allStaff.map((staff) => {
            const isSelected = currentStaff.id === staff.id;
            const isOwner = staff.role === 'owner';

            return (
              <div
                key={staff.id}
                className={`staff-member-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setCurrentStaff(staff);
                }}
              >
                <div className="staff-avatar-box">
                  {staff.name.slice(0, 1)}
                </div>

                <div className="staff-info-box">
                  <div className="staff-name-line">
                    <span className="staff-display-name">{staff.name}</span>
                    {isOwner && (
                      <span className="badge-owner">ഉടമ (Owner)</span>
                    )}
                  </div>
                  <span className="staff-email-sub">{staff.email}</span>
                </div>

                <div className="staff-radio-circle">
                  {isSelected && <Check size={16} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cloud Sync & Backup Actions */}
        <div className="staff-tools-section">
          <h4 className="tools-heading">ബാക്കപ്പും ക്ലൗഡ് സമന്വയവും (Backup & Cloud)</h4>

          <div className="tools-buttons-grid">
            <button
              type="button"
              className="btn-tool"
              onClick={handleExportBackup}
            >
              <Download size={16} />
              <span>ഡാറ്റ ഡൗൺലോഡ് ചെയ്യുക (Backup)</span>
            </button>

            <button
              type="button"
              className="btn-tool"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>ബാക്കപ്പ് റീസ്റ്റോർ (Restore)</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />

            <button
              type="button"
              className="btn-tool cloud-tool"
              onClick={() => {
                onClose();
                onOpenFirebaseSetup();
              }}
            >
              <Cloud size={16} />
              <span>Firebase കണക്ഷൻ വിവരങ്ങൾ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
