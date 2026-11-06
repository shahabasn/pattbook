import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Copy, 
  Check, 
  Flame, 
  ShieldCheck, 
  Terminal, 
  FileCode, 
  ExternalLink,
  Save,
  CheckCircle2
} from 'lucide-react';

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated shop staff can read and write records
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    match /pattTransactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
    match /purchaseItems/{itemId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'owner';
    }
  }
}`;

export default function FirebaseSetupModal({ isOpen, onClose }) {
  const { isFirebaseConfigured, showToast } = useShop();

  const [copiedRules, setCopiedRules] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  if (!isOpen) return null;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES);
    setCopiedRules(true);
    showToast('സുരക്ഷാ നിയമങ്ങൾ കോപ്പി ചെയ്തു (Rules Copied)', 'success');
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert('API Key യും Project ID യും നൽകണം');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    localStorage.setItem('shopbook_firebase_config', JSON.stringify(config));
    showToast('Firebase കോൺഫിഗറേഷൻ സേവ് ചെയ്തു! ആപ്പ് റീലോഡ് ചെയ്യുന്നു...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-full-sheet setup-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="title-with-badge">
              <Flame size={20} className="flame-icon" />
              <h2 className="modal-main-title">Firebase ക്ലൗഡ് സമന്വയം</h2>
            </div>
            <span className="modal-kicker">5 പേർക്ക് ഒരേസമയം ഉപയോഗിക്കാനുള്ള ക്ലൗഡ് സെറ്റപ്പ്</span>
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

        {/* Current Status Box */}
        <div className={`status-banner-box ${isFirebaseConfigured ? 'status-connected' : 'status-pending'}`}>
          <div className="status-banner-content">
            {isFirebaseConfigured ? (
              <>
                <CheckCircle2 size={24} className="banner-icon-success" />
                <div>
                  <h4 className="banner-heading">ക്ലൗഡ് ലൈവ് കണക്റ്റഡ്! (Cloud Connected)</h4>
                  <p className="banner-text">5 ഫോണുകളിലും ഈ ഡാറ്റ ഒരേസമയം തത്സമയം സിങ്ക് ആവുന്നുണ്ട്.</p>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck size={24} className="banner-icon-info" />
                <div>
                  <h4 className="banner-heading">ലോക്കൽ റിയൽടൈം മോഡ് (Local Simulated Cloud)</h4>
                  <p className="banner-text">നിങ്ങൾ ഇപ്പോൾ ഡെമോ മോഡിലാണ്. Firebase സൗജന്യ (Spark) പ്ലാൻ ഉപയോഗിച്ച് ലൈവ് ക്ലൗഡ് ആക്കാൻ താഴെ കാണുന്ന സ്റ്റെപ്പുകൾ ചെയ്യുക.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step-by-step Guide */}
        <div className="setup-steps-container">
          <h3 className="section-title-sm">9 എളുപ്പമുള്ള സ്റ്റെപ്പുകൾ (Beginner Guide):</h3>

          <div className="step-card">
            <div className="step-num">1</div>
            <div className="step-content">
              <strong>Firebase പ്രോജക്റ്റ് ഉണ്ടാക്കുക:</strong>
              <p><a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="step-link">console.firebase.google.com <ExternalLink size={12} /></a> ൽ പോയി 'Add Project' ക്ലിക്ക് ചെയ്ത് <code>ShopBook</code> എന്ന പേരിൽ സൗജന്യ പ്രോജക്റ്റ് ഉണ്ടാക്കുക.</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">2</div>
            <div className="step-content">
              <strong>Spark (സൗജന്യ) പ്ലാൻ ഉറപ്പാക്കുക:</strong>
              <p>പണം ഈടാക്കാത്ത 100% സൗജന്യ പ്ലാനാണ് Spark plan. മാസം 50,000 വായിക്കലുകളും 20,000 എഴുത്തുകളും ഇതിൽ സൗജന്യമാണ് (ചായക്കടയ്ക്ക് ധാരാളം!).</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">3</div>
            <div className="step-content">
              <strong>Firebase Authentication ഓൺ ചെയ്യുക:</strong>
              <p>Build &gt; Authentication &gt; Get Started &gt; 'Email/Password' enable ചെയ്യുക.</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">4</div>
            <div className="step-content">
              <strong>Cloud Firestore ഡാറ്റാബേസ് ഉണ്ടാക്കുക:</strong>
              <p>Build &gt; Firestore Database &gt; Create Database ക്ലിക്ക് ചെയ്യുക (Location: <code>asia-south1 (Mumbai)</code> തിരഞ്ഞെടുക്കുക).</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">5</div>
            <div className="step-content">
              <strong>സുരക്ഷാ നിയമങ്ങൾ (Security Rules) പേസ്റ്റ് ചെയ്യുക:</strong>
              <div className="rules-code-block">
                <div className="rules-code-header">
                  <span>firestore.rules</span>
                  <button type="button" className="btn-copy-code" onClick={handleCopyRules}>
                    {copiedRules ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedRules ? 'കോപ്പി ചെയ്തു' : 'കോപ്പി ചെയ്യുക'}</span>
                  </button>
                </div>
                <pre><code>{FIRESTORE_RULES}</code></pre>
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">6</div>
            <div className="step-content">
              <strong>5 ജീവനക്കാരുടെ അക്കൗണ്ടുകൾ ഉണ്ടാക്കുക:</strong>
              <p>Authentication &gt; Users &gt; 'Add User' വഴി കടയിലെ 5 പേരുടെയും ഇമെയിലുകളും പാസ്‌വേഡുകളും ചേർക്കുക.</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">7</div>
            <div className="step-content">
              <strong>Firebase Config ഇവിടെ നൽകുക അല്ലെങ്കിൽ <code>.env</code> ഫയലിൽ ഇടുക:</strong>
              <p>Project Settings &gt; General &gt; Your Apps &gt; Web App ഉണ്ടാക്കി കിട്ടുന്ന വിവരങ്ങൾ താഴെ നൽകാം:</p>

              <form onSubmit={handleSaveConfig} className="in-app-config-form">
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="apiKey (ഉദാ: AIzaSy...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="projectId (ഉദാ: shopbook-123)"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="appId (ഉദാ: 1:123456:web:...)"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />

                <button type="submit" className="btn-save-credentials">
                  <Save size={16} />
                  <span>കണക്റ്റ് ചെയ്യുക (Save & Connect)</span>
                </button>
              </form>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">8</div>
            <div className="step-content">
              <strong>Firebase Hosting വഴി പബ്ലിഷ് ചെയ്യാൻ:</strong>
              <div className="terminal-box">
                <code>npm run build</code>
                <code>npx firebase login</code>
                <code>npx firebase init hosting</code>
                <code>npx firebase deploy --only hosting</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
